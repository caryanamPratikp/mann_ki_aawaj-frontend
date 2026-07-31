import { apiClient } from './apiClient.js';
import { mockChatService } from './mockChatService.js';
import { mockAuthService } from './mockAuthService.js';

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return !token || token.startsWith('mock') || token === 'mock_token';
};

const getCurrentUserFromAuth = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u) {
        const stored = u.id ? (localStorage.getItem(`user_profile_${u.id}`) || localStorage.getItem('user_profile')) : localStorage.getItem('user_profile');
        let handle = u.username;
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p.username) handle = p.username;
          } catch (e) {}
        }
        const formattedHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '@user';
        return { ...u, username: formattedHandle };
      }
    } catch (e) {}
  }
  return mockAuthService.getCurrentUser();
};

export const apiChatService = {
  // GET /api/chat/rooms (get user rooms)
  async getConversations() {
    const currentUser = getCurrentUserFromAuth();
    const localList = mockChatService.getUserConversations(currentUser?.username);
    if (isMockMode()) {
      return localList;
    }
    try {
      const response = await apiClient.get('/api/chat/rooms');
      const apiRooms = response.data?.data || response.data || [];
      const normalizedApi = Array.isArray(apiRooms) ? apiRooms : [];

      const combined = [...localList];
      normalizedApi.forEach(apiRoom => {
        const p1 = apiRoom.participant1Username ? (apiRoom.participant1Username.startsWith('@') ? apiRoom.participant1Username : `@${apiRoom.participant1Username}`) : '';
        const p2 = apiRoom.participant2Username ? (apiRoom.participant2Username.startsWith('@') ? apiRoom.participant2Username : `@${apiRoom.participant2Username}`) : '';
        const exists = combined.some(c => c.id === apiRoom.id || (
          c.participants && c.participants.includes(p1) && c.participants.includes(p2)
        ));
        if (!exists) {
          combined.push({
            id: apiRoom.id,
            participants: [p1, p2],
            otherParticipantUsername: apiRoom.otherParticipantUsername,
            lastMessage: apiRoom.lastMessage?.content || 'Chat room active',
            updatedAt: apiRoom.updatedAt || new Date().toISOString(),
            requestStatus: 'ACCEPTED',
          });
        }
      });
      return combined;
    } catch (err) {
      return localList;
    }
  },

  // GET /api/chat/messages/{roomId} (get room message history)
  async getMessages(roomId) {
    if (!roomId || String(roomId).startsWith('conv_') || isMockMode()) {
      return mockChatService.getMessagesByConversationId(roomId);
    }
    try {
      const response = await apiClient.get(`/api/chat/messages/${roomId}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) && data.length > 0 ? data : mockChatService.getMessagesByConversationId(roomId);
    } catch (err) {
      return mockChatService.getMessagesByConversationId(roomId);
    }
  },

  // POST /api/chat/rooms/private/{targetUserId} (start or fetch room)
  async startConversation(recipientUsername, targetUserId) {
    const currentUser = getCurrentUserFromAuth();
    const target = recipientUsername ? (recipientUsername.startsWith('@') ? recipientUsername : `@${recipientUsername}`) : '@user';
    const cleanSelf = currentUser?.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user';
    
    // Always initialize/fetch local storage request
    const localConv = mockChatService.getOrCreateConversation(cleanSelf, target);

    let resolvedId = targetUserId;
    if (!resolvedId && !isMockMode() && recipientUsername) {
      try {
        const { apiProfileService } = await import('./apiProfileService.js');
        const cleanHandle = recipientUsername.replace('@', '');
        const pRes = await apiProfileService.getPublicProfile(cleanHandle);
        if (pRes?.data?.userId) {
          resolvedId = pRes.data.userId;
        } else if (pRes?.userId) {
          resolvedId = pRes.userId;
        }
      } catch (e) {
        console.warn('[Chat] Failed to resolve targetUserId for handle:', recipientUsername, e);
      }
    }

    if (!isMockMode() && resolvedId) {
      try {
        await apiClient.post(`/api/chat/rooms/private/${resolvedId}`);
      } catch (err) {
        console.warn('[Chat] Backend room init fallback to local:', err);
      }
    }
    return localConv;
  },

  // POST /api/chat/messages { roomId, content } (send direct message)
  async sendMessage(roomId, content, recipientUsername) {
    const currentUser = getCurrentUserFromAuth();
    const cleanSelf = currentUser?.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user';
    if (!roomId || String(roomId).startsWith('conv_') || isMockMode()) {
      return mockChatService.sendMessage(roomId, content, cleanSelf, recipientUsername);
    }
    try {
      const response = await apiClient.post('/api/chat/messages', { roomId, content });
      return response.data?.data || response.data;
    } catch (err) {
      return mockChatService.sendMessage(roomId, content, cleanSelf, recipientUsername);
    }
  },

  async acceptChatRequest(conversationId) {
    return mockChatService.acceptChatRequest(conversationId);
  },

  async declineChatRequest(conversationId) {
    return mockChatService.declineChatRequest(conversationId);
  },

  getUserRealtimeStatus(username) {
    return mockChatService.getUserRealtimeStatus(username);
  }
};
