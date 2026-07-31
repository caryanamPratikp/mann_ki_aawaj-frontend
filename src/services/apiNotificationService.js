import { apiClient } from './apiClient.js';
import { mockNotificationService } from './mockNotificationService.js';

const isMockMode = () => {
  const token = localStorage.getItem('auth_token');
  return !token || token.startsWith('mock') || token === 'mock_token';
};

export const apiNotificationService = {
  // GET /api/notifications?page=0&size=20
  async getNotifications(params = {}) {
    const userStr = localStorage.getItem('auth_user');
    let userHandle = null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userHandle = u.username || u.email?.split('@')[0];
      } catch (e) {}
    }

    if (isMockMode()) {
      const mockNotifs = mockNotificationService.getUserNotifications(userHandle);
      return {
        success: true,
        data: {
          content: mockNotifs,
          totalElements: mockNotifs.length,
          totalPages: 1,
          number: 0,
          size: mockNotifs.length,
        },
      };
    }

    try {
      const response = await apiClient.get('/api/notifications', {
        params: {
          page: params.page || 0,
          size: params.size || 20,
          ...params,
        },
      });
      return response.data;
    } catch (err) {
      console.warn('[Notifications] Backend 500 notice, fallback to local storage:', err);
      const mockNotifs = mockNotificationService.getUserNotifications(userHandle);
      return {
        success: true,
        data: {
          content: mockNotifs,
          totalElements: mockNotifs.length,
          totalPages: 1,
          number: 0,
          size: mockNotifs.length,
        },
      };
    }
  },

  // GET /api/notifications/unread-count
  async getUnreadCount() {
    if (isMockMode()) {
      const count = mockNotificationService.getUnreadCount();
      return { success: true, data: count };
    }

    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      return response.data;
    } catch (err) {
      const count = mockNotificationService.getUnreadCount();
      return { success: true, data: count };
    }
  },

  // PUT /api/notifications/{id}/read
  async markAsRead(id) {
    if (isMockMode()) {
      mockNotificationService.markAsRead(id);
      return { success: true, message: 'Notification marked as read.' };
    }

    try {
      const response = await apiClient.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (err) {
      mockNotificationService.markAsRead(id);
      return { success: true, message: 'Notification marked as read.' };
    }
  },

  // PUT /api/notifications/read-all
  async markAllAsRead() {
    if (isMockMode()) {
      mockNotificationService.markAllAsRead();
      return { success: true, message: 'All notifications marked as read.' };
    }

    try {
      const response = await apiClient.put('/api/notifications/read-all');
      return response.data;
    } catch (err) {
      mockNotificationService.markAllAsRead();
      return { success: true, message: 'All notifications marked as read.' };
    }
  },
};
