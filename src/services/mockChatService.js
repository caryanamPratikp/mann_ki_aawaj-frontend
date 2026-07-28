import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../data/chats.js';
import { moderationCheck } from '../utils/moderationCheck.js';
import { mockAuthService } from './mockAuthService.js';

export const CHAT_STORAGE_KEY = 'mka_chat_conversations';
export const MESSAGES_STORAGE_KEY = 'mka_chat_messages';

export const mockChatService = {
  getConversations() {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!data || !data.includes('conv_004_in')) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(MOCK_CONVERSATIONS));
      return MOCK_CONVERSATIONS;
    }
    return JSON.parse(data);
  },

  getMessages() {
    const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!data || !data.includes('msg_006')) {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(MOCK_MESSAGES));
      return MOCK_MESSAGES;
    }
    return JSON.parse(data);
  },

  getUserConversations(username) {
    const convs = this.getConversations();
    const cleanUser = username
      ? (username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`)
      : '@quietchapter';

    let userConvs = convs.filter(c => 
      c.participants && c.participants.some(p => p.toLowerCase() === cleanUser)
    );

    // Fallback: If logged-in user has no custom chats, dynamically present demo mock chats mapped to cleanUser!
    if (userConvs.length === 0) {
      userConvs = convs.map(c => ({
        ...c,
        participants: c.participants.map(p => p.toLowerCase() === '@quietchapter' ? cleanUser : p),
        requestSender: c.requestSender?.toLowerCase() === '@quietchapter' ? cleanUser : c.requestSender,
      }));
    }

    return userConvs;
  },

  getOrCreateConversation(user1, user2) {
    if (!user1 || !user2) return null;
    const u1 = user1.startsWith('@') ? user1 : `@${user1}`;
    const u2 = user2.startsWith('@') ? user2 : `@${user2}`;
    const convs = this.getConversations();

    let existing = convs.find(
      c => c.participants &&
        c.participants.some(p => p.toLowerCase() === u1.toLowerCase()) &&
        c.participants.some(p => p.toLowerCase() === u2.toLowerCase())
    );

    if (!existing) {
      existing = {
        id: `conv_${Date.now()}`,
        participants: [u1, u2],
        lastMessage: 'Conversation started.',
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
      };
      convs.unshift(existing);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
    }

    return existing;
  },

  getMessagesForConversation(convId) {
    if (!convId) return [];
    const messages = this.getMessages();
    return messages.filter(m => m.conversationId === convId);
  },

  sendMessage(convId, text, currentUser) {
    if (!text || !text.trim() || !currentUser) {
      throw new Error('Message cannot be empty.');
    }

    // Moderation check
    const modResult = moderationCheck(text);
    if (modResult.status === 'BLOCKED') {
      throw new Error(`Message blocked: ${modResult.explanation || modResult.message}`);
    }

    const senderName = currentUser.username 
      ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`)
      : '@quietchapter';

    const messages = this.getMessages();
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderUsername: senderName,
      senderInitials: currentUser.avatarInitials || 'AN',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'read',
    };

    messages.push(newMessage);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

    // Update conversation last message
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === convId);
    if (idx !== -1) {
      convs[idx].lastMessage = text.trim();
      convs[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
    }

    return newMessage;
  },

  getUserRealtimeStatus(username) {
    if (!username) return { isOnline: false, label: 'Offline', badgeColor: '#8C8385' };
    const users = mockAuthService.getUsers();
    const cleanUser = username.startsWith('@') ? username : `@${username}`;
    const user = users.find(u => u.username && u.username.toLowerCase() === cleanUser.toLowerCase());

    if (user?.isOnline) {
      return { isOnline: true, label: 'online', badgeColor: '#3F7772' };
    }

    const minutes = (cleanUser.length * 3 + 1) % 45 || 3;
    if (minutes < 5) {
      return { isOnline: false, label: `Active ${minutes}m ago`, badgeColor: '#8C8385' };
    }
    if (minutes < 60) {
      return { isOnline: false, label: `Active ${minutes}m ago`, badgeColor: '#8C8385' };
    }

    return { isOnline: false, label: 'Active 2h ago', badgeColor: '#8C8385' };
  }
};
