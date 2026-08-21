import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Checkbox } from '../../components/common/Checkbox.jsx';
import { ArrowLeft, Save, MessageSquare, Heart, Volume2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function NotificationSettingsPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const userId = currentUser?.id || currentUser?.username || 'guest';
  const storageKey = `user_notif_prefs_${userId}`;

  // Default: ALL notifications are turned ON
  const [chatMessages, setChatMessages] = useState(true);
  const [postLikes, setPostLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Load user choices on mount
  useEffect(() => {
    const savedRaw = localStorage.getItem(storageKey);
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        if (typeof saved.chatMessages === 'boolean') setChatMessages(saved.chatMessages);
        if (typeof saved.postLikes === 'boolean') setPostLikes(saved.postLikes);
        if (typeof saved.comments === 'boolean') setComments(saved.comments);
        if (typeof saved.systemAlerts === 'boolean') setSystemAlerts(saved.systemAlerts);
        if (typeof saved.soundAlerts === 'boolean') setSoundAlerts(saved.soundAlerts);
      } catch (e) {
        console.warn('Failed to parse user notification preferences:', e);
      }
    }
  }, [storageKey]);

  const handleSave = (e) => {
    e.preventDefault();
    const prefs = {
      chatMessages,
      postLikes,
      comments,
      systemAlerts,
      soundAlerts,
    };
    localStorage.setItem(storageKey, JSON.stringify(prefs));
    addToast(t('notifPrefsSaved', 'Notification preferences saved successfully.'), 'success');
  };

  return (
    <UserLayout activeRoute="/settings/notifications" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            {t('back', 'Back')}
          </Button>
          <h1 className="page-heading">{t('notificationSettings', 'Notification Settings')}</h1>
        </div>

        <form onSubmit={handleSave} className="mka-card flex-col gap-md">
          {/* 1. Direct Messages & Chat Notifications */}
          <div className="flex-col gap-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                {t('directMessagesChat', 'Direct Messages & Chat')}
              </h3>
            </div>
            
            <Checkbox
              id="chatMessagesNotifCheck"
              label={t('receiveDirectChatNotifs', 'Receive notification toasts & badges for 1-on-1 direct chat messages')}
              checked={chatMessages}
              onChange={(e) => setChatMessages(e.target.checked)}
            />
          </div>

          {/* 2. Posts & Community Engagement */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                {t('postReactionsComments', 'Post Reactions & Comments')}
              </h3>
            </div>

            <Checkbox
              id="postLikesNotifCheck"
              label={t('notifyRelateSupport', 'Notify when members relate to or support my published thoughts')}
              checked={postLikes}
              onChange={(e) => setPostLikes(e.target.checked)}
            />
            <Checkbox
              id="commentsNotifCheck"
              label={t('notifyComment', 'Notify when members comment on my published thoughts')}
              checked={comments}
              onChange={(e) => setComments(e.target.checked)}
            />
          </div>

          {/* 3. System & Moderation Alerts */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                {t('systemSafetyNotices', 'System & Safety Notices')}
              </h3>
            </div>

            <Checkbox
              id="systemAlertsNotifCheck"
              label={t('receiveSystemNotices', 'Receive system notices, warning updates, and moderation status alerts')}
              checked={systemAlerts}
              onChange={(e) => setSystemAlerts(e.target.checked)}
            />
          </div>

          {/* 4. Notification Chime Sound */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                {t('audioChimeSound', 'Audio Chime Sound')}
              </h3>
            </div>

            <Checkbox
              id="soundAlertsCheck"
              label={t('playNotificationChime', 'Play notification sound chime for messages and alerts')}
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
            />
          </div>

          {/* Submit */}
          <div className="flex-row justify-end" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <Button type="submit" variant="primary" icon={Save}>
              {t('savePreferences', 'Save Preferences')}
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
