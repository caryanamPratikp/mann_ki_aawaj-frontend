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
    if (isMockMode()) {
      return mockChatService.getUserConversations(currentUser?.username);
    }
    try {
      const response = await apiClient.get('/api/chat/rooms');
      const apiRooms = response.data?.data || response.data || [];
      const normalizedApi = Array.isArray(apiRooms) ? apiRooms : [];

      return normalizedApi.map(apiRoom => {
        const p1 = apiRoom.participant1Username ? (apiRoom.participant1Username.startsWith('@') ? apiRoom.participant1Username : `@${apiRoom.participant1Username}`) : '';
        const p2 = apiRoom.participant2Username ? (apiRoom.participant2Username.startsWith('@') ? apiRoom.participant2Username : `@${apiRoom.participant2Username}`) : '';
        
        const requestSender = apiRoom.requestSenderId === apiRoom.participant1Id
          ? apiRoom.participant1Username
          : (apiRoom.requestSenderId === apiRoom.participant2Id ? apiRoom.participant2Username : null);

        const unreadCount = apiRoom.unreadCount || (apiRoom.hasUnread ? 1 : 0);
        return {
          id: apiRoom.id,
          participants: [p1, p2],
          otherParticipantUsername: apiRoom.otherParticipantUsername ? (apiRoom.otherParticipantUsername.startsWith('@') ? apiRoom.otherParticipantUsername : `@${apiRoom.otherParticipantUsername}`) : '',
          otherParticipantAvatar: apiRoom.otherParticipantAvatar,
          otherParticipantId: apiRoom.otherParticipantId,
          lastMessage: apiRoom.lastMessage?.content || 'Chat room active',
          lastMessageObj: apiRoom.lastMessage,
          hasUnread: Boolean(apiRoom.hasUnread || unreadCount > 0),
          unreadCount: unreadCount,
          updatedAt: apiRoom.updatedAt || new Date().toISOString(),
          requestStatus: apiRoom.requestStatus || 'ACCEPTED',
          requestSenderId: apiRoom.requestSenderId,
          requestSender: requestSender,
        };
      });
    } catch (err) {
      console.error('[ChatService] Failed to fetch rooms:', err);
      return [];
    }
  },

  // GET /api/chat/messages/{roomId} (get room message history)
  async getMessages(roomId) {
    if (!roomId || String(roomId).startsWith('conv_') || isMockMode()) {
      return mockChatService.getMessagesByConversationId(roomId);
    }
    try {
      const response = await apiClient.get(`/api/chat/messages/${roomId}`);
      const pageData = response.data?.data || response.data;
      const list = Array.isArray(pageData?.content) ? pageData.content : (Array.isArray(pageData) ? pageData : []);
      
      // Sort to show oldest messages first in UI list
      return [...list].reverse().map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        senderId: msg.senderId,
        senderUsername: msg.senderUsername ? (msg.senderUsername.startsWith('@') ? msg.senderUsername : `@${msg.senderUsername}`) : '',
        senderAvatar: msg.senderAvatar,
        content: msg.content,
        text: msg.content,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      }));
    } catch (err) {
      console.error('[ChatService] Failed to fetch messages for room:', roomId, err);
      return [];
    }
  },

  // POST /api/chat/rooms/private/{targetUserId} (start or fetch room)
  async startConversation(recipientUsername, targetUserId) {
    const currentUser = getCurrentUserFromAuth();
    const target = recipientUsername ? (recipientUsername.startsWith('@') ? recipientUsername : `@${recipientUsername}`) : '@user';
    
    if (isMockMode()) {
      const cleanSelf = currentUser?.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user';
      return mockChatService.getOrCreateConversation(cleanSelf, target);
    }

    let resolvedId = targetUserId;
    if (!resolvedId && recipientUsername) {
      try {
        const { apiProfileService } = await import('./apiProfileService.js');
        const cleanHandle = recipientUsername.replace('@', '');
        const pRes = await apiProfileService.getPublicProfile(cleanHandle);
        resolvedId = pRes?.data?.userId || pRes?.data?.id || pRes?.userId || pRes?.id;
      } catch (e) {
        console.warn('[Chat] Failed to resolve targetUserId for handle:', recipientUsername, e);
      }
    }

    if (!resolvedId || resolvedId === 'undefined') {
      throw new Error(`Could not resolve user ID for handle: ${recipientUsername}`);
    }

    const response = await apiClient.post(`/api/chat/rooms/private/${resolvedId}`);
    const apiRoom = response.data?.data || response.data;
    
    const p1 = apiRoom.participant1Username ? (apiRoom.participant1Username.startsWith('@') ? apiRoom.participant1Username : `@${apiRoom.participant1Username}`) : '';
    const p2 = apiRoom.participant2Username ? (apiRoom.participant2Username.startsWith('@') ? apiRoom.participant2Username : `@${apiRoom.participant2Username}`) : '';

    const requestSender = apiRoom.requestSenderId === apiRoom.participant1Id
      ? apiRoom.participant1Username
      : (apiRoom.requestSenderId === apiRoom.participant2Id ? apiRoom.participant2Username : null);

    return {
      id: apiRoom.id,
      participants: [p1, p2],
      otherParticipantUsername: apiRoom.otherParticipantUsername ? (apiRoom.otherParticipantUsername.startsWith('@') ? apiRoom.otherParticipantUsername : `@${apiRoom.otherParticipantUsername}`) : '',
      otherParticipantAvatar: apiRoom.otherParticipantAvatar,
      otherParticipantId: apiRoom.otherParticipantId,
      lastMessage: apiRoom.lastMessage?.content || 'Chat room active',
      updatedAt: apiRoom.updatedAt || new Date().toISOString(),
      requestStatus: apiRoom.requestStatus || 'ACCEPTED',
      requestSenderId: apiRoom.requestSenderId,
      requestSender: requestSender,
    };
  },

  // POST /api/chat/messages { roomId, content } (send direct message)
  async sendMessage(roomId, content, recipientUsername) {
    const currentUser = getCurrentUserFromAuth();
    if (isMockMode()) {
      const cleanSelf = currentUser?.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user';
      return mockChatService.sendMessage(roomId, content, cleanSelf, recipientUsername);
    }
    const response = await apiClient.post('/api/chat/messages', { roomId, content });
    const msg = response.data?.data || response.data;
    return {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      senderUsername: msg.senderUsername ? (msg.senderUsername.startsWith('@') ? msg.senderUsername : `@${msg.senderUsername}`) : '',
      senderAvatar: msg.senderAvatar,
      content: msg.content,
      text: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    };
  },

  async acceptChatRequest(roomId) {
    if (isMockMode()) {
      return mockChatService.acceptChatRequest(roomId);
    }
    const response = await apiClient.put(`/api/chat/rooms/${roomId}/accept`);
    return response.data?.data || response.data;
  },

  async declineChatRequest(roomId) {
    if (isMockMode()) {
      return mockChatService.declineChatRequest(roomId);
    }
    const response = await apiClient.put(`/api/chat/rooms/${roomId}/reject`);
    return response.data?.data || response.data;
  },

  getUserRealtimeStatus(username) {
    if (!username) return { isOnline: false, statusText: 'Offline' };
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isOnline = hash % 2 === 0;
    const lastSeenMinutes = hash % 60;
    const statusText = isOnline ? 'Online' : `Last seen today at ${10 + (hash % 3)}:${lastSeenMinutes < 10 ? '0' : ''}${lastSeenMinutes} ${hash % 2 === 0 ? 'AM' : 'PM'}`;
    return { isOnline, statusText };
  }
};
