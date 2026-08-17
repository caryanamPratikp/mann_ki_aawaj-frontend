import React, { useState, useEffect } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { ArrowRight, MessageSquare, Bell } from 'lucide-react';
import { formatTimePune } from '../../utils/formatDate.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function SingleToastItem({ notif, onDismiss, onView }) {
  const { currentLanguage, translateText, t } = useLanguage();
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 4 seconds (4000ms) with right-swipe animation
    const timer = setTimeout(() => {
      setIsDismissing(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationEnd = () => {
    if (isDismissing) {
      onDismiss(notif.toastId || notif.id);
    }
  };

  const isMsg = notif.label === 'MESSAGE' || Boolean(notif.roomId);
  const labelText = notif.label || (isMsg ? 'MESSAGE' : 'NOTIFICATION');
  
  const username = notif.senderUsername
    ? (notif.senderUsername.startsWith('@') ? notif.senderUsername : `@${notif.senderUsername}`)
    : '@user';

  const rawText = notif.content || notif.text || notif.message || '';
  const translatedContent = currentLanguage !== 'EN' && currentLanguage !== 'English'
    ? translateText(rawText, currentLanguage)
    : rawText;

  const previewSubtext = notif.previewText || (notif.content && notif.content !== rawText ? notif.content : null);

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={isDismissing ? 'animate-toast-dismissing' : 'animate-toast-popup'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        boxShadow: '0 8px 24px rgba(111, 64, 95, 0.18), 0 2px 8px rgba(0,0,0,0.05)',
        border: '1.5px solid var(--deep-plum)',
        color: 'var(--eclipse)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        width: '100%',
        flexShrink: 0,
      }}
    >
      {/* ── TOP BAR: Category Pill Label & Timestamp ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: isMsg ? 'rgba(111,64,95,0.12)' : 'rgba(225,29,72,0.10)',
            color: isMsg ? 'var(--deep-plum)' : '#E11D48',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
          }}
        >
          {isMsg ? <MessageSquare size={10} /> : <Bell size={10} />}
          {labelText}
        </span>

        <span style={{ fontSize: '10px', color: 'var(--hurricane)', fontWeight: 500 }}>
          {formatTimePune(notif.timestamp || notif.createdAt || new Date())}
        </span>
      </div>

      {/* ── MAIN BODY: Avatar, username : content & View Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <InitialAvatar username={username} size={30} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontWeight: 800, fontSize: '12.5px', color: '#6F405F', whiteSpace: 'nowrap' }}>
            {username} :
          </span>
          <span
            style={{
              fontWeight: 500,
              fontSize: '12.5px',
              color: '#2D1D15',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {previewSubtext || translatedContent}
          </span>
        </div>

        {/* View Action Button */}
        <button
          type="button"
          onClick={() => {
            setIsDismissing(true);
            if (onView) onView(notif);
          }}
          style={{
            padding: '5px 10px',
            borderRadius: '10px',
            backgroundColor: 'var(--deep-plum)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            flexShrink: 0,
          }}
        >
          {t('view', 'View')} <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

export function FloatingChatToast({ notifications = [], onDismiss, onView }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      className="no-scrollbar"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column', // Newest added at bottom, older pushed upwards
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        pointerEvents: 'none',
      }}
    >
      {notifications.map((notif) => (
        <SingleToastItem
          key={notif.toastId || notif.id}
          notif={notif}
          onDismiss={onDismiss}
          onView={onView}
        />
      ))}
    </div>
  );
}
