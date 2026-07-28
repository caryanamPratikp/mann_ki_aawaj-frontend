import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockNotificationService } from '../services/mockNotificationService.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  const refreshNotifications = useCallback(() => {
    if (!currentUser) return;
    const list = mockNotificationService.getUserNotifications(currentUser.id);
    setNotifications(list);
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = (id) => {
    mockNotificationService.markAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (!currentUser) return;
    mockNotificationService.markAllAsRead(currentUser.id);
    refreshNotifications();
  };

  const deleteNotification = (id) => {
    mockNotificationService.deleteNotification(id);
    refreshNotifications();
  };

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
