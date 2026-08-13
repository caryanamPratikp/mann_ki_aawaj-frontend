import React, { useEffect } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import { formatTimePune } from '../../utils/formatDate.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function FloatingChatToast({ notifications = [], onDismiss, onView }) {
  const { currentLanguage, translateText, t } = useLanguage();

  if (!notifications || notifications.length === 0) return null;

  // Limit to maximum 3 stacked floating notifications
  const visibleList = notifications.slice(0, 3);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'auto',
      }}
    >
      {visibleList.map((notif) => {
        const username = notif.senderUsername
          ? (notif.senderUsername.startsWith('@') ? notif.senderUsername : `@${notif.senderUsername}`)
          : '@user';

        const rawText = notif.content || notif.text || '';
        const translatedContent = currentLanguage !== 'EN' && currentLanguage !== 'English'
          ? translateText(rawText, currentLanguage)
          : rawText;

        return (
          <div
            key={notif.toastId}
            className="animate-slide-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(111, 64, 95, 0.22)',
              border: '1.5px solid var(--deep-plum)',
              color: 'var(--eclipse)',
              transition: 'all 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <InitialAvatar username={username} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#6F405F' }}>
                    {username}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--hurricane)' }}>
                    {formatTimePune(notif.timestamp || notif.createdAt || new Date())}
                  </span>
                </div>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '12.5px',
                    color: 'var(--eclipse)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {translatedContent}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => onView(notif)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--deep-plum)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  lineHeight: 1,
                }}
              >
                {t('view', 'View')} <ArrowRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => onDismiss(notif.toastId)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--hurricane)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title={t('dismiss', 'Dismiss')}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
