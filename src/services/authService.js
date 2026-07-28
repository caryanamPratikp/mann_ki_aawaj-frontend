import { apiClient } from './apiClient.js';
import { apiProfileService } from './apiProfileService.js';
import { mockAuthService } from './mockAuthService.js';

export const authService = {
  // POST /api/auth/login
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const res = response.data;

      if (res && res.success && res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('auth_user', JSON.stringify(res.data));
        
        // Check if profile exists via GET /api/profile/me
        let hasProfile = false;
        try {
          const profileRes = await apiProfileService.getMyProfile();
          if (profileRes && profileRes.success && profileRes.data) {
            hasProfile = true;
            localStorage.setItem('user_profile', JSON.stringify(profileRes.data));
          }
        } catch (profileErr) {
          // If 404, user needs profile setup
          if (profileErr.status === 404 || profileErr.response?.status === 404) {
            hasProfile = false;
          }
        }

        const user = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          mobileNumber: res.data.mobileNumber,
          role: res.data.role,
          token: res.data.token,
          hasProfile,
        };
        mockAuthService.setCurrentUser(user);
        return { user, hasProfile };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        console.warn('Backend server offline (http://localhost:8080). Falling back to mock auth.');
        const mockUser = mockAuthService.login(email, password);
        return { user: mockUser, hasProfile: true };
      }
      throw err;
    }
  },

  // POST /api/auth/register
  async register(userData) {
    try {
      const payload = {
        fullName: userData.fullName,
        email: userData.email,
        mobileNumber: userData.mobileNumber || userData.mobile,
        password: userData.password,
      };

      const response = await apiClient.post('/api/auth/register', payload);
      const res = response.data;

      if (res && res.success) {
        // Registration does not return a token. Return success message.
        return res;
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      if (err.response?.data) {
        throw err.response.data;
      }
      if (err.isNetworkError || err.message?.includes('Failed to fetch') || !err.response) {
        throw new Error('Cannot reach the backend at http://localhost:8080. Start the Spring Boot server and try again.');
      }
      throw err;
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { /* fallback */ }
    }
    return mockAuthService.getCurrentUser();
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile');
    mockAuthService.logout();
  },
};
