import { apiClient } from './apiClient.js';

export const apiUserService = {
  // GET /api/users/me (Always sends token)
  async getMyUser() {
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/users/{userId} (Public)
  async getPublicUser(userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/avatar { avatar }
  async updateAvatar(avatar) {
    try {
      const response = await apiClient.put('/api/users/avatar', { avatar });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/language { language } (Values: EN, HI, MR, PA, TA, TE, GU, BN, KN, ML)
  async updateLanguage(language) {
    try {
      const response = await apiClient.put('/api/users/language', { language });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/users/me/profile
  async getMyProfile() {
    try {
      const response = await apiClient.get('/api/users/me/profile');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/users/password { currentPassword, newPassword }
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/api/users/password', { currentPassword, newPassword });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/users/me
  async deactivateAccount() {
    try {
      const response = await apiClient.delete('/api/users/me');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/users/mute/{username}
  async muteUser(username) {
    try {
      const clean = username.replace(/^@/, '');
      const response = await apiClient.post(`/api/users/mute/${encodeURIComponent(clean)}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/users/unmute/{username}
  async unmuteUser(username) {
    try {
      const clean = username.replace(/^@/, '');
      const response = await apiClient.delete(`/api/users/unmute/${encodeURIComponent(clean)}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/users/muted
  async getMutedUsers() {
    try {
      const response = await apiClient.get('/api/users/muted');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },
};
