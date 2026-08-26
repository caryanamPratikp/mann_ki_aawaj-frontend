import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { formatDate, RealtimeTimestamp } from '../../utils/formatDate.js';

import { Button } from '../../components/common/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Bell, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { resolveNotificationPath } from '../../utils/notificationNavigation.js';

function NotificationItemText({ message, currentLanguage, translateTextAsync, t }) {
  const [text, setText] = useState(message);

  useEffect(() => {
    if (!message) return;
    let isMounted = true;

    if (message.startsWith('@')) {
      const spaceIdx = message.indexOf(' ');
      if (spaceIdx > 0) {
        const username = message.substring(0, spaceIdx);
        const actionText = message.substring(spaceIdx + 1);

        if (translateTextAsync && currentLanguage !== 'English') {
          translateTextAsync(actionText, currentLanguage)
            .then(translatedAction => {
              if (isMounted) setText(`${username} ${translatedAction}`);
            })
            .catch(() => {
              if (isMounted) setText(message);
            });
          return () => { isMounted = false; };
        }
      }
    } else if (translateTextAsync && currentLanguage !== 'English') {
      translateTextAsync(message, currentLanguage)
        .then(translated => {
          if (isMounted) setText(translated);
        })
        .catch(() => {
          if (isMounted) setText(message);
        });
      return () => { isMounted = false; };
    }

    setText(message);
  }, [message, currentLanguage, translateTextAsync]);

  return <span>{text}</span>;
}

export function NotificationsPage({ onNavigate }) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { currentLanguage, translateTextAsync, t } = useLanguage();
  const [filterUnread, setFilterUnread] = useState(false);

  const displayList = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <UserLayout activeRoute="/notifications" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row justify-between items-center flex-wrap gap-sm">
          <div>
            <h1 className="page-heading">{t('notifications', 'Notifications')}</h1>
          </div>

          <div className="flex-row items-center gap-sm">
            <Button
              variant={filterUnread ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
            >
              {filterUnread ? t('showAll', 'Show All') : t('filterUnread', 'Filter Unread')}
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
              {t('markAllRead', 'Mark All Read')}
            </Button>
          </div>
        </div>

        {displayList.length === 0 ? (
          <EmptyState
            title={t('noNotifications', 'No Notifications Yet')}
            description={t('noNotificationsDesc', 'There are no items to display at this time.')}
            icon={Bell}
          />
        ) : (
          <div className="flex-col gap-sm">
            {displayList.map((item) => {
              const targetPath = resolveNotificationPath(item);
              return (
              <div
                key={item.id}
                className="mka-card flex-row items-center justify-between gap-md animate-fade-in"
                style={{
                  padding: '14px 18px',
                  background: item.isRead ? 'var(--pure-white)' : 'var(--soft-white)',
                  borderLeft: item.isRead ? '1px solid var(--border-light)' : '4px solid var(--deep-plum)',
                }}
              >
                <div className="flex-row items-center gap-md" style={{ flex: 1 }}>
                  <InitialAvatar username={item.actorUsername} initials={item.actorInitials} size={36} />
                  <div className="flex-col gap-xs">
                    <p className="body-text" style={{ fontSize: '14px', color: 'var(--eclipse)' }}>
                      <NotificationItemText message={item.message} currentLanguage={currentLanguage} translateTextAsync={translateTextAsync} t={t} />
                    </p>
                    <RealtimeTimestamp date={item.createdAt} className="caption-text" />

                  </div>
                </div>

                <div className="flex-row items-center gap-xs">
                  {targetPath ? (
                    <button
                      onClick={() => {
                        markAsRead(item.id);
                        onNavigate(targetPath);
                      }}
                      className="flex-row items-center gap-xs secondary-text"
                      style={{ fontSize: '13px', color: 'var(--deep-plum)', fontWeight: 500 }}
                      title={item.targetType === 'MUSIC_TRACK' ? 'View Track' : 'View Post'}
                    >
                      <ArrowRight size={16} />
                    </button>
                  ) : null}

                  {!item.isRead && (
                    <button onClick={() => markAsRead(item.id)} style={{ color: 'var(--hurricane)', padding: '4px' }}>
                      <Check size={16} />
                    </button>
                  )}

                  <button onClick={() => deleteNotification(item.id)} style={{ color: 'var(--hurricane)', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
