import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiNotificationService } from '../services/apiNotificationService.js';
import { mapNotification } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) { setNotifications([]); return; }
    try {
      const response = await apiNotificationService.getNotifications();
      setNotifications((response.data?.content || []).map(mapNotification));
    } catch (err) {
      setNotifications([]);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
    const timer = setInterval(() => {
      refreshNotifications();
    }, 5000);
    return () => clearInterval(timer);
  }, [refreshNotifications]);

  const markAsRead = async (id) => {
    await apiNotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    await apiNotificationService.markAllAsRead();
    await refreshNotifications();
  };

  // No delete-notification endpoint exists in the current backend.
  const deleteNotification = () => {};

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
