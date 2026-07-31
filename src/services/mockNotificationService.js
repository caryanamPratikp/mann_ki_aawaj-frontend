import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_NOTIFICATIONS } from '../data/notifications.js';

export const mockNotificationService = {
  getNotifications() {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
      return MOCK_NOTIFICATIONS;
    }
    return JSON.parse(data);
  },

  getUserNotifications(userId) {
    if (!userId) return [];
    return this.getNotifications().filter(n => n.userId === userId);
  },

  addNotification(notif) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: `notif_${Date.now()}`,
      userId: notif.userId,
      type: notif.type || 'SYSTEM',
      actorUsername: notif.actorUsername || 'System',
      actorInitials: notif.actorInitials || 'SM',
      message: notif.message,
      targetPostId: notif.targetPostId || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotif;
  },

  markAsRead(notificationId) {
    const notifications = this.getNotifications();
    const idx = notifications.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      notifications[idx].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
    return true;
  },

  markAllAsRead(userId) {
    if (!userId) return false;
    const notifications = this.getNotifications().map(n => {
      if (n.userId === userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return true;
  },

  deleteNotification(notificationId) {
    const notifications = this.getNotifications().filter(n => n.id !== notificationId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return true;
  }
};
