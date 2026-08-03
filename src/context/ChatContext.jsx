import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiChatService } from '../services/apiChatService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const ChatContext = createContext(null);

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return !token || token.startsWith('mock') || token === 'mock_token';
};

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    try {
      const list = await apiChatService.getConversations();
      setConversations(Array.isArray(list) ? list : []);
    } catch (err) {
      setConversations([]);
    }
  }, [currentUser]);

  // Periodic polling for conversations sidebar
  useEffect(() => {
    refreshConversations();
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  // Socket.IO real-time connection and message listeners
  useEffect(() => {
    if (!currentUser || isMockMode()) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to Socket.IO server on port 8085
    const socket = io('http://localhost:8085', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected as', currentUser.username);
    });

    socket.on('receive_message', (msg) => {
      console.log('[Socket] Received message:', msg);
      
      // Invalidate TanStack query cache for messages of this room to update UI instantly
      queryClient.invalidateQueries({ queryKey: ['messages', msg.roomId] });
      
      // Refresh conversations list to update sidebar message preview
      refreshConversations();
    });

    socket.on('room_status_change', (updatedRoom) => {
      console.log('[Socket] Room status changed:', updatedRoom);
      
      // Invalidate room message history
      queryClient.invalidateQueries({ queryKey: ['messages', updatedRoom.id] });
      
      // Refresh conversations sidebar
      refreshConversations();
      
      // Update activeConversation details locally
      setActiveConversation((prev) => {
        if (prev && prev.id === updatedRoom.id) {
          return {
            ...prev,
            requestStatus: updatedRoom.requestStatus,
            requestSenderId: updatedRoom.requestSenderId,
          };
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, queryClient, refreshConversations]);

  // Join/leave room rooms via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversation?.id || isMockMode()) return;

    const roomId = activeConversation.id;
    console.log('[Socket] Joining room:', roomId);
    socket.emit('join_room', String(roomId));

    return () => {
      console.log('[Socket] Leaving room:', roomId);
      socket.emit('leave_room', String(roomId));
    };
  }, [activeConversation?.id]);

  const openChatWithUser = useCallback(async (targetUsername) => {
    try {
      const conv = await apiChatService.startConversation(targetUsername);
      setActiveConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['messages', conv.id] });
      await refreshConversations();
      return conv;
    } catch (err) {
      addToast('Failed to open chat.', 'error');
    }
  }, [refreshConversations, addToast, queryClient]);

  const selectConversation = useCallback(async (convId) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setActiveConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['messages', convId] });
    }
  }, [conversations, queryClient]);

  const sendMessage = useCallback(async (text) => {
    if (!activeConversation) return;
    try {
      const otherUser = activeConversation.otherParticipantUsername
        || activeConversation.participant2Username
        || (Array.isArray(activeConversation.participants) ? activeConversation.participants.find(p => p.toLowerCase() !== currentUser?.username?.toLowerCase()) : null);

      const msg = await apiChatService.sendMessage(activeConversation.id, text, otherUser);
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversation.id] });
      await refreshConversations();
      return msg;
    } catch (err) {
      addToast(err?.message || 'Failed to send message.', 'error');
    }
  }, [activeConversation, currentUser, refreshConversations, addToast, queryClient]);

  const acceptChatRequest = useCallback(async (conversationId) => {
    try {
      await apiChatService.acceptChatRequest(conversationId);
      addToast('Chat request accepted!', 'success');
      await refreshConversations();
      
      setActiveConversation(prev => {
        if (prev && prev.id === conversationId) {
          return { ...prev, requestStatus: 'ACCEPTED' };
        }
        return prev;
      });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    } catch (err) {
      addToast('Failed to accept request.', 'error');
    }
  }, [refreshConversations, addToast, queryClient]);

  const declineChatRequest = useCallback(async (conversationId) => {
    try {
      await apiChatService.declineChatRequest(conversationId);
      addToast('Chat request declined.', 'info');
      await refreshConversations();
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    } catch (err) {
      addToast('Failed to decline request.', 'error');
    }
  }, [activeConversation, refreshConversations, addToast, queryClient]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      activeMessages: [],
      refreshConversations,
      openChatWithUser,
      selectConversation,
      sendMessage,
      acceptChatRequest,
      declineChatRequest,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
