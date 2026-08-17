import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiNotificationService } from '../services/apiNotificationService.js';
import { mapNotification } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { playNotificationSound } from '../utils/soundUtil.js';

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const getUserNotifPrefs = useCallback(() => {
    const userId = currentUser?.id || currentUser?.username || 'guest';
    const raw = localStorage.getItem(`user_notif_prefs_${userId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return { chatMessages: true, postLikes: true, comments: true, systemAlerts: true, soundAlerts: true };
  }, [currentUser]);

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) { setNotifications([]); return; }
    try {
      const response = await apiNotificationService.getNotifications();
      const fetched = (response.data?.content || []).map(mapNotification);

      // EXCLUDE chat messages/requests from the Bell Icon section
      // Only Post actions (Comments, Likes, Reactions) & System Warnings belong in Bell section
      const postAndSystemNotifs = fetched.filter(n => {
        const type = (n.type || '').toUpperCase();
        return !type.includes('CHAT') && !type.includes('MESSAGE');
      });

      setNotifications(postAndSystemNotifs);
    } catch (err) {
      setNotifications([]);
    }
  }, [currentUser]);

  // 10-Second Auto-Refresh Timer
  useEffect(() => {
    refreshNotifications();
    const timer = setInterval(() => {
      refreshNotifications();
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshNotifications]);

  // Real-time Socket.IO notification listener
  useEffect(() => {
    if (!currentUser || !currentUser.id || window.location.pathname.startsWith('/admin')) return;

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
      const type = (newNotif?.type || '').toUpperCase();

      // Skip chat messages from Bell notification processing
      if (type.includes('CHAT') || type.includes('MESSAGE')) return;

      refreshNotifications();
      const prefs = getUserNotifPrefs();

      if (type.includes('LIKE') || type.includes('RELATE') || type.includes('REACTION')) {
        if (prefs.postLikes === false) return;
      } else if (type.includes('COMMENT')) {
        if (prefs.comments === false) return;
      } else if (type.includes('SYSTEM') || type.includes('WARNING')) {
        if (prefs.systemAlerts === false) return;
      }

      const rawSender = newNotif?.senderUsername || newNotif?.actorUsername || newNotif?.username || 'Someone';
      const cleanSender = rawSender.startsWith('@') ? rawSender : `@${rawSender}`;

      let formattedText = '';
      if (type.includes('RELATE')) {
        formattedText = `${cleanSender} related to your post`;
      } else if (type.includes('SUPPORT')) {
        formattedText = `${cleanSender} supported your post`;
      } else if (type.includes('AGREE')) {
        formattedText = `${cleanSender} agreed with your post`;
      } else if (type.includes('INTERESTING')) {
        formattedText = `${cleanSender} found your post interesting`;
      } else if (type.includes('LIKE')) {
        formattedText = `${cleanSender} reacted to your post`;
      } else if (type.includes('COMMENT')) {
        formattedText = `${cleanSender} commented on your post`;
      } else {
        formattedText = newNotif?.message || newNotif?.content || newNotif?.title || 'You have a new notification';
      }

      addToast(formattedText, 'notification', 4000, {
        label: 'NOTIFICATION',
        senderUsername: cleanSender,
      });

      if (prefs.soundAlerts !== false) {
        playNotificationSound();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, refreshNotifications, addToast, getUserNotifPrefs]);

  const markAsRead = async (id) => {
    await apiNotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    await apiNotificationService.markAllAsRead();
    await refreshNotifications();
  };

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
