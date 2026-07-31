import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiChatService } from '../services/apiChatService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

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

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const openChatWithUser = async (targetUsername) => {
    try {
      const conv = await apiChatService.startConversation(targetUsername);
      setActiveConversation(conv);
      const msgs = await apiChatService.getMessages(conv.id);
      setActiveMessages(Array.isArray(msgs) ? msgs : []);
      await refreshConversations();
      return conv;
    } catch (err) {
      addToast('Failed to open chat.', 'error');
    }
  };

  const selectConversation = async (convId) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setActiveConversation(conv);
      try {
        const msgs = await apiChatService.getMessages(convId);
        setActiveMessages(Array.isArray(msgs) ? msgs : []);
      } catch (e) {
        setActiveMessages([]);
      }
    }
  };

  const sendMessage = async (text) => {
    if (!activeConversation) return;
    try {
      const otherUser = activeConversation.otherParticipantUsername
        || activeConversation.participant2Username
        || (Array.isArray(activeConversation.participants) ? activeConversation.participants.find(p => p.toLowerCase() !== currentUser?.username?.toLowerCase()) : null);

      const msg = await apiChatService.sendMessage(activeConversation.id, text, otherUser);
      setActiveMessages(prev => [...prev, msg]);
      await refreshConversations();
      return msg;
    } catch (err) {
      addToast(err?.message || 'Failed to send message.', 'error');
    }
  };

  const acceptChatRequest = async (conversationId) => {
    try {
      await apiChatService.acceptChatRequest(conversationId);
      addToast('Chat request accepted!', 'success');
      await refreshConversations();
      const updated = conversations.find(c => c.id === conversationId);
      if (updated) setActiveConversation(updated);
    } catch (err) {
      addToast('Failed to accept request.', 'error');
    }
  };

  const declineChatRequest = async (conversationId) => {
    try {
      await apiChatService.declineChatRequest(conversationId);
      addToast('Chat request declined.', 'info');
      await refreshConversations();
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setActiveMessages([]);
      }
    } catch (err) {
      addToast('Failed to decline request.', 'error');
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      activeMessages,
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
