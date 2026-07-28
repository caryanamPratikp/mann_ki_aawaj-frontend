import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockChatService } from '../services/mockChatService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const currentUsername = currentUser?.username || '@quietchapter';

  const refreshConversations = useCallback(() => {
    const username = currentUser?.username || '@quietchapter';
    const list = mockChatService.getUserConversations(username);
    setConversations(list);
  }, [currentUser]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const openChatWithUser = (targetUsername) => {
    const conv = mockChatService.getOrCreateConversation(currentUsername, targetUsername);
    setActiveConversation(conv);
    const msgs = mockChatService.getMessagesForConversation(conv.id);
    setActiveMessages(msgs);
    refreshConversations();
    return conv;
  };

  const selectConversation = (convId) => {
    const convs = mockChatService.getConversations();
    const conv = convs.find(c => c.id === convId);
    if (conv) {
      setActiveConversation(conv);
      const msgs = mockChatService.getMessagesForConversation(convId);
      setActiveMessages(msgs);
    }
  };

  const sendMessage = (text) => {
    if (!activeConversation) return;
    try {
      const activeUser = currentUser || { username: '@quietchapter', avatarInitials: 'QC' };
      const msg = mockChatService.sendMessage(activeConversation.id, text, activeUser);
      setActiveMessages(prev => [...prev, msg]);
      refreshConversations();
      return msg;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
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
      sendMessage
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
