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
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  login(identifier, password) {
    const users = this.getUsers();
    const id = identifier.trim().toLowerCase();

    // Match by @username, email, or mobile number
    let user = users.find(u => {
      const byUsername = u.username.toLowerCase() === id ||
                         u.username.toLowerCase() === `@${id}`;
      const byEmail = u.email && u.email.toLowerCase() === id;
      const byMobile = (u.mobile || u.mobileNumber) && (u.mobile || u.mobileNumber).replace(/\s+/g, '') === id.replace(/\s+/g, '');
      return byUsername || byEmail || byMobile;
    });

    if (!user) {
      const rawPart = identifier.includes('@') ? identifier.split('@')[0] : identifier;
      const cleanHandle = rawPart.trim().toLowerCase().replace(/\s+/g, '');
      const cleanName = rawPart.charAt(0).toUpperCase() + rawPart.slice(1);
      user = {
        id: `user_${Date.now()}`,
        username: `@${cleanHandle || 'user'}`,
        fullName: cleanName,
        email: identifier.includes('@') ? identifier : `${cleanHandle}@example.com`,
        mobileNumber: '9876543210',
        avatarInitials: cleanHandle.slice(0, 2).toUpperCase(),
        bio: 'Anonymous author on Awaaz Man Ki',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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

    const tempHandle = userData.username
      ? (userData.username.startsWith('@') ? userData.username : `@${userData.username}`)
      : `@anon${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: newId,
      username: tempHandle,
      fullName: userData.fullName || 'Private Name',
      email: userData.email,
      mobileNumber: userData.mobileNumber || userData.mobile,
      avatarInitials: (userData.fullName || 'AN')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      bio: userData.bio || 'Anonymous author on Awaaz Man Ki',
      languages: userData.languages || ['English'],
      interests: userData.interests || ['Life'],
      status: 'ACTIVE',
      joinedDate: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  forgotPassword(identifier) {
    const users = this.getUsers();
    const id = identifier.trim().toLowerCase();

    const user = users.find(u => {
      const byEmail = u.email && u.email.toLowerCase() === id;
      const byMobile = (u.mobile || u.mobileNumber) && (u.mobile || u.mobileNumber).replace(/\s+/g, '') === id.replace(/\s+/g, '');
      return byEmail || byMobile;
    });

    if (!user && !id.includes('@') && !/^[6-9]\d{9}$/.test(id)) {
      throw { status: 404, message: 'Account not found' };
    }

    return { success: true, message: 'Verification OTP sent successfully', identifier };
  },

  verifyForgotPasswordOtp(identifier, otp) {
    if (!otp || otp.trim().length < 4) {
      throw { status: 400, message: 'Invalid OTP code' };
    }
    return { success: true, message: 'OTP verified successfully' };
  },

  resetPassword(identifier, otp, newPassword) {
    return { success: true, message: 'Password reset successfully. You can now login with your new password.' };
  },

  updateProfile(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const current = this.getCurrentUser();
      if (current?.id === userId) {
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
