import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiChatService } from '../services/apiChatService.js';
import { mockChatService } from '../services/mockChatService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { FloatingChatToast } from '../components/common/FloatingChatToast.jsx';
import { formatLastSeen } from '../utils/formatLastSeen.js';

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

const ChatContext = createContext(null);

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return !token || token.startsWith('mock') || token === 'mock_token';
};

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [activeConversation, setActiveConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [floatingToasts, setFloatingToasts] = useState([]);
  const socketRef = useRef(null);
  const activeConvRef = useRef(activeConversation);

  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // TanStack Query for background conversations auto-sync
  const { data: conversations = [], refetch: refreshConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const data = await apiChatService.getConversations();
      return data || [];
    },
    enabled: Boolean(currentUser),
    refetchInterval: 3000,
    staleTime: 1000,
  });

  const dismissFloatingToast = useCallback((toastId) => {
    setFloatingToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const addFloatingToast = useCallback((msg) => {
    const toastId = `${msg.id || Date.now()}_${Math.random()}`;
    const newToast = { ...msg, toastId };

    setFloatingToasts((prev) => [newToast, ...prev.filter((t) => t.roomId !== msg.roomId)]);

    setTimeout(() => {
      dismissFloatingToast(toastId);
    }, 6000);
  }, [dismissFloatingToast]);

  // Global Real-time Socket.IO Connection & Presence Heartbeat
  useEffect(() => {
    if (!currentUser || isMockMode()) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    const sendHeartbeat = () => {
      if (socket.connected && currentUser?.id) {
        socket.emit('presence_heartbeat', {
          userId: currentUser.id,
          username: currentUser.username,
        });
      }
    };

    socket.on('connect', () => {
      console.log('[Socket] Connected as', currentUser.username, 'ID:', currentUser.id);
      if (currentUser?.id) {
        socket.emit('join_user_room', String(currentUser.id));
        sendHeartbeat();
      }
    });

    socket.on('receive_message', (msg) => {
      console.log('[Socket] Received message:', msg);
      
      queryClient.invalidateQueries({ queryKey: ['messages', msg.roomId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const cleanSelf = currentUser?.username
        ? (currentUser.username.startsWith('@') ? currentUser.username.toLowerCase() : `@${currentUser.username.toLowerCase()}`)
        : '';
      const cleanSender = msg.senderUsername
        ? (msg.senderUsername.startsWith('@') ? msg.senderUsername.toLowerCase() : `@${msg.senderUsername.toLowerCase()}`)
        : '';

      const isFromOther = cleanSender && cleanSender !== cleanSelf;
      const isViewingExactChat = String(activeConvRef.current?.id) === String(msg.roomId) && document.visibilityState === 'visible';

      if (isFromOther && !isViewingExactChat) {
        addFloatingToast(msg);
      }
    });

    socket.on('user_presence_changed', (presence) => {
      console.log('[Socket] Presence changed:', presence);
      if (presence && presence.username) {
        const cleanKey = presence.username.toLowerCase().replace('@', '');
        setOnlineUsers((prev) => ({
          ...prev,
          [cleanKey]: {
            isOnline: Boolean(presence.isOnline || presence.status === 'ONLINE'),
            lastSeen: presence.lastSeen || new Date().toISOString(),
            status: presence.status || (presence.isOnline ? 'ONLINE' : 'OFFLINE'),
          },
        }));
      }
    });

    socket.on('room_status_change', (updatedRoom) => {
      queryClient.invalidateQueries({ queryKey: ['messages', updatedRoom.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    // Send heartbeat every 25 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 25000);

    // Browser Visibility API
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, queryClient, addFloatingToast]);

  // Join/leave active chat room channels via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversation?.id || isMockMode()) return;

    const roomId = activeConversation.id;
    socket.emit('join_room', String(roomId));

    return () => {
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
    const conv = conversations.find(c => String(c.id) === String(convId));
    if (conv) {
      setActiveConversation(conv);
      queryClient.invalidateQueries({ queryKey: ['messages', convId] });
    }
  }, [conversations, queryClient]);

  const sendMessage = useCallback(async (roomId, content) => {
    try {
      const sent = await apiChatService.sendMessage(roomId, content);
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      await refreshConversations();
      return sent;
    } catch (err) {
      addToast(err?.message || 'Failed to send message.', 'error');
      throw err;
    }
  }, [refreshConversations, addToast, queryClient]);

  const acceptChatRequest = useCallback(async (roomId) => {
    try {
      const updated = await apiChatService.acceptRequest(roomId);
      setActiveConversation(updated);
      await refreshConversations();
      addToast('Chat request accepted.', 'success');
      return updated;
    } catch (err) {
      addToast('Failed to accept chat request.', 'error');
    }
  }, [refreshConversations, addToast]);

  const declineChatRequest = useCallback(async (roomId) => {
    try {
      await apiChatService.declineRequest(roomId);
      setActiveConversation(null);
      await refreshConversations();
      addToast('Chat request declined.', 'info');
    } catch (err) {
      addToast('Failed to decline chat request.', 'error');
    }
  }, [refreshConversations, addToast]);

  const getUserPresence = useCallback((username, fallbackOnline = true, fallbackLastSeen = null, t = null) => {
    if (!username) return { isOnline: false, statusText: t ? t('offline', 'Offline') : 'Offline' };
    const cleanU = username.trim().toLowerCase().replace('@', '');
    const entry = onlineUsers[cleanU] || onlineUsers[`@${cleanU}`];
    
    if (entry) {
      return {
        isOnline: entry.isOnline,
        statusText: formatLastSeen(entry, t),
      };
    }
    
    // Fallback based on backend API response or default active state
    const presenceObj = {
      isOnline: Boolean(fallbackOnline),
      lastSeen: fallbackLastSeen,
    };
    return {
      isOnline: Boolean(fallbackOnline),
      statusText: formatLastSeen(presenceObj, t),
    };
  }, [onlineUsers]);

  const hasUnreadMessages = conversations.some(conv => {
    const isPrimary = conv.requestStatus === 'ACCEPTED' || (conv.requestStatus === 'PENDING' && conv.requestSender !== currentUser?.username);
    return isPrimary && (conv.unreadCount > 0 || conv.hasUnread);
  });

  const handleViewFloatingToast = useCallback((toastNotif) => {
    dismissFloatingToast(toastNotif.toastId);
    selectConversation(toastNotif.roomId);
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [dismissFloatingToast, selectConversation]);

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
      hasUnreadMessages,
      onlineUsers,
      getUserPresence,
    }}>
      {children}
      <FloatingChatToast
        notifications={floatingToasts}
        onDismiss={dismissFloatingToast}
        onView={handleViewFloatingToast}
      />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
