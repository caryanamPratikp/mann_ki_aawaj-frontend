import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_USERS } from '../data/users.js';

export const mockAuthService = {
  getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(data);
  },

  getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) return JSON.parse(data);
    // Default logged in user: @quietchapter
    const users = this.getUsers();
    const defaultUser = users[0] || MOCK_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  login(identifier, password) {
    const users = this.getUsers();
    const id = identifier.trim().toLowerCase();

    // Match by @username, email, or mobile number
    const user = users.find(u => {
      const byUsername = u.username.toLowerCase() === id ||
                         u.username.toLowerCase() === `@${id}`;
      const byEmail = u.email && u.email.toLowerCase() === id;
      const byMobile = u.mobile && u.mobile.replace(/\s+/g, '') === id.replace(/\s+/g, '');
      return byUsername || byEmail || byMobile;
    });

    if (!user) {
      throw new Error('No account found with that username, email, or mobile number.');
    }

    if (user.status === 'BANNED' || user.status === 'TEMPORARILY_SUSPENDED') {
      throw new Error(`Your account status is currently ${user.status}. Access denied.`);
    }

    this.setCurrentUser(user);
    return user;
  },


  register(userData) {
    const users = this.getUsers();
    const newId = `user_${Date.now()}`;

    // Auto-generate a temp anonymous handle if no username provided yet
    // User picks their real handle during onboarding
    const tempHandle = `@anon${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: newId,
      username: userData.username
        ? (userData.username.startsWith('@') ? userData.username : `@${userData.username}`)
        : tempHandle,
      fullName: userData.fullName || 'Private Name',
      avatarInitials: (userData.fullName || 'AN')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      bio: userData.bio || 'Anonymous author on Man Ki Aavaj',
      languages: userData.languages || ['English'],
      interests: userData.interests || ['Life'],
      status: 'ACTIVE',
      joinedDate: new Date().toISOString(),
      needsUsernameSetup: !userData.username, // flag for onboarding
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  updateProfile(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = this.getCurrentUser();
      if (current.id === userId) {
        this.setCurrentUser(users[index]);
      }
      return users[index];
    }
    return null;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};
