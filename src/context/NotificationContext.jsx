import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiNotificationService } from '../services/apiNotificationService.js';
import { mapNotification } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

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

  // Real-time Socket.IO notification listener
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      socket.emit('join_user_room', String(currentUser.id));
    });

    socket.on('new_notification', (newNotif) => {
      console.log('[NotificationSocket] Received real-time notification:', newNotif);
      refreshNotifications();
      const notifMsg = newNotif?.message || newNotif?.content || newNotif?.title || 'You have a new notification';
      addToast(notifMsg, 'info', 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, refreshNotifications]);

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
