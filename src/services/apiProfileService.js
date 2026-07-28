import { apiClient } from './apiClient.js';
import { mockAuthService } from './mockAuthService.js';

export const apiProfileService = {
  // GET /api/profile/me
  async getMyProfile() {
    try {
      const response = await apiClient.get('/api/profile/me');
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // POST /api/profile
  async createProfile(data) {
    try {
      const response = await apiClient.post('/api/profile', data);
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // PUT /api/profile
  async updateProfile(data) {
    try {
      const response = await apiClient.put('/api/profile', data);
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // GET /api/profile/:username
  async getPublicProfile(username) {
    try {
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      const response = await apiClient.get(`/api/profile/${cleanUsername}`);
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },

  // DELETE /api/profile
  async deleteProfile() {
    try {
      const response = await apiClient.delete('/api/profile');
      return response.data;
    } catch (err) {
      if (err.response) {
        throw err.response.data;
      }
      throw err;
    }
  },
};
