import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../data/chats.js';
import { moderationCheck } from '../utils/moderationCheck.js';
import { mockAuthService } from './mockAuthService.js';

export const CHAT_STORAGE_KEY = 'mka_chat_conversations';
export const MESSAGES_STORAGE_KEY = 'mka_chat_messages';

export const mockChatService = {
  getConversations() {
    if (!localStorage.getItem('mka_purge_v4')) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem('mka_purge_v4', 'true');
      return [];
    }
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getMessages() {
    if (!localStorage.getItem('mka_purge_v4')) {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getUserConversations(username) {
    const convs = this.getConversations();
    if (!username) return [];
    const cleanUser = username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`;

    return convs.filter(c => {
      if (c.participants && Array.isArray(c.participants)) {
        return c.participants.some(p => p.toLowerCase() === cleanUser);
      }
      const p1 = c.participant1Username ? (c.participant1Username.startsWith('@') ? c.participant1Username.toLowerCase() : `@${c.participant1Username.toLowerCase()}`) : '';
      const p2 = c.participant2Username ? (c.participant2Username.startsWith('@') ? c.participant2Username.toLowerCase() : `@${c.participant2Username.toLowerCase()}`) : '';
      const pOther = c.otherParticipantUsername ? (c.otherParticipantUsername.startsWith('@') ? c.otherParticipantUsername.toLowerCase() : `@${c.otherParticipantUsername.toLowerCase()}`) : '';
      return p1 === cleanUser || p2 === cleanUser || pOther === cleanUser;
    });
  },

  getOrCreateConversation(user1, user2) {
    if (!user1 || !user2) return null;
    const u1 = user1.startsWith('@') ? user1 : `@${user1}`;
    const u2 = user2.startsWith('@') ? user2 : `@${user2}`;
    const convs = this.getConversations();

    let existing = convs.find(
      c => c.participants && Array.isArray(c.participants) &&
        c.participants.some(p => p.toLowerCase() === u1.toLowerCase()) &&
        c.participants.some(p => p.toLowerCase() === u2.toLowerCase())
    );

    if (!existing) {
      existing = {
        id: `conv_${Date.now()}`,
        participants: [u1, u2],
        lastMessage: 'Chat request initiated.',
        updatedAt: new Date().toISOString(),
        unreadCount: 1,
        requestStatus: 'PENDING',
        requestSender: u1,
      };
      convs.unshift(existing);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
    }
    return existing;
  },

  getMessagesByConversationId(conversationId) {
    const msgs = this.getMessages();
    return msgs.filter(m => m.conversationId === conversationId);
  },

  getMessagesForConversation(conversationId) {
    return this.getMessagesByConversationId(conversationId);
  },

  sendMessage(conversationId, text, senderUsername, recipientUsername) {
    const fullText = text || '';
    const modResult = moderationCheck(fullText);

    if (modResult.status === 'BLOCKED') {
      throw new Error(`Message blocked: ${modResult.explanation}`);
    }

    const messages = this.getMessages();
    const cleanSender = senderUsername ? (senderUsername.startsWith('@') ? senderUsername : `@${senderUsername}`) : '@user';
    const initials = cleanSender.replace('@', '').slice(0, 2).toUpperCase();

    // Determine recipient status for blue tick / double tick
    const status = 'READ'; // double blue tick for active interactive simulation

    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderUsername: cleanSender,
      senderInitials: initials,
      text: fullText,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isRead: true,
      status: 'READ',
      moderationResult: modResult
    };

    messages.push(newMessage);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

    // Update conversation lastMessage
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].lastMessage = fullText;
      convs[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
    }

    return newMessage;
  },

  acceptChatRequest(conversationId) {
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].requestStatus = 'ACCEPTED';
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
      return convs[idx];
    }
    return null;
  },

  declineChatRequest(conversationId) {
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].requestStatus = 'DECLINED';
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(convs));
    }
    return true;
  },

  getUserRealtimeStatus(username) {
    if (!username) return { isOnline: false, statusText: 'Offline', label: 'Offline' };
    const clean = username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`;
    
    // Simulate online for key handles, last seen for others
    if (clean === '@gentlejournal' || clean === '@subtlechapter' || clean === '@user') {
      return {
        isOnline: true,
        statusText: 'Online',
        label: 'Online',
      };
    }

    return {
      isOnline: false,
      statusText: 'Last seen today at 12:30 PM',
      label: 'Last seen today at 12:30 PM',
    };
  }
};
