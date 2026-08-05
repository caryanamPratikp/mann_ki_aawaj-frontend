import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Bell, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

function NotificationItemText({ message, currentLanguage, translateTextAsync }) {
  const [text, setText] = useState(message);

  useEffect(() => {
    if (currentLanguage !== 'English' && message) {
      let isMounted = true;
      translateTextAsync(message, currentLanguage)
        .then(tText => {
          if (isMounted) setText(tText);
        })
        .catch(err => console.error(err));
      return () => { isMounted = false; };
    }
  }, [message, currentLanguage]);

  return <span>{text}</span>;
}

export function NotificationsPage({ onNavigate }) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { currentLanguage, translateTextAsync } = useLanguage();
  const [filterUnread, setFilterUnread] = useState(false);

  const displayList = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <UserLayout activeRoute="/notifications" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row justify-between items-center flex-wrap gap-sm">
          <div>
            <h1 className="page-heading">Notifications</h1>
            <p className="secondary-text">Stay updated on comments, replies, reactions, & moderation updates.</p>
          </div>

          <div className="flex-row items-center gap-sm">
            <Button
              variant={filterUnread ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
            >
              {filterUnread ? 'Show All' : 'Filter Unread'}
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
              Mark All Read
            </Button>
          </div>
        </div>

        {displayList.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You have no unread alerts or notifications at this time."
            icon={Bell}
          />
        ) : (
          <div className="flex-col gap-sm">
            {displayList.map((item) => (
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
                      <NotificationItemText message={item.message} currentLanguage={currentLanguage} translateTextAsync={translateTextAsync} />
                    </p>
                    <span className="caption-text">{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div className="flex-row items-center gap-xs">
                  {item.targetPostId && (
                    <button
                      onClick={() => {
                        markAsRead(item.id);
                        onNavigate(`/post/${item.targetPostId}`);
                      }}
                      className="flex-row items-center gap-xs secondary-text"
                      style={{ fontSize: '13px', color: 'var(--deep-plum)', fontWeight: 500 }}
                    >
                      <span>View</span>
                      <ArrowRight size={14} />
                    </button>
                  )}

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
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
