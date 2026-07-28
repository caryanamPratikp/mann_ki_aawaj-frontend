import { apiRequest } from './apiService.js';
import { mockAuthService } from './mockAuthService.js';

export const authService = {
  // Login with API (POST /api/auth/login), with fallback to mockAuthService if server fails/offline
  async login(identifier, password) {
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: identifier, password }),
      });

      if (res && res.success && res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        const user = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          mobileNumber: res.data.mobileNumber,
          role: res.data.role,
          username: `@${res.data.fullName.toLowerCase().replace(/\s+/g, '')}`,
          token: res.data.token,
        };
        mockAuthService.setCurrentUser(user);
        return user;
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      // Fallback to mock service if network error or server 500 error occurs
      if (err.isNetworkError || err.status === 500 || err.message?.includes('Failed to fetch')) {
        console.warn('Backend service offline/500 error (http://localhost:8081). Falling back to mockAuthService.');
        return mockAuthService.login(identifier, password);
      }
      throw err;
    }
  },

  // Register with API (POST /api/auth/register), with fallback to mockAuthService if server fails/offline
  async register(userData) {
    try {
      const payload = {
        fullName: userData.fullName,
        email: userData.email,
        mobileNumber: userData.mobile || userData.mobileNumber,
        password: userData.password,
      };

      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success && res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        const user = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          mobileNumber: res.data.mobileNumber,
          role: res.data.role,
          username: userData.username || `@${res.data.fullName.toLowerCase().replace(/\s+/g, '')}`,
          token: res.data.token,
        };
        mockAuthService.setCurrentUser(user);
        return user;
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      if (err.isNetworkError || err.status === 500 || err.message?.includes('Failed to fetch')) {
        console.warn('Backend service offline/500 error (http://localhost:8081). Falling back to mockAuthService.');
        return mockAuthService.register(userData);
      }
      throw err;
    }
  },

  // Test protected endpoint
  async testAuth() {
    return apiRequest('/api/test');
  },

  // Test protected user endpoint
  async testUserAccess() {
    return apiRequest('/api/user/test');
  },

  // Test protected admin endpoint
  async testAdminAccess() {
    return apiRequest('/api/admin/test');
  },

  getCurrentUser() {
    return mockAuthService.getCurrentUser();
  },

  logout() {
    localStorage.removeItem('auth_token');
    mockAuthService.logout();
  },
};
