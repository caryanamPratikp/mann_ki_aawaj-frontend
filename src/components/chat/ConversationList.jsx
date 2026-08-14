import React, { useState } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { mockChatService } from '../../services/mockChatService.js';
import { MessageSquare, Inbox, Shield, Check, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const normalizeUser = (u) => {
  if (!u) return '';
  const trimmed = u.trim();
  return trimmed.startsWith('@') ? trimmed.toLowerCase() : `@${trimmed.toLowerCase()}`;
};

const getOtherUsername = (conv, cleanSelf) => {
  if (!conv) return 'User';
  if (conv.otherParticipantUsername) return conv.otherParticipantUsername;
  if (conv.participant2Username) return conv.participant2Username;
  if (Array.isArray(conv.participants)) {
    const found = conv.participants.find(p => normalizeUser(p) !== cleanSelf);
    if (found) return found;
    if (conv.participants[0]) return conv.participants[0];
  }
  return 'User';
};

function TranslatedSnippet({ text }) {
  const { currentLanguage, translateTextAsync } = useLanguage();
  const [translated, setTranslated] = React.useState(text);

  React.useEffect(() => {
    let isMounted = true;
    if (!text || currentLanguage === 'EN' || currentLanguage === 'English') {
      setTranslated(text);
      return;
    }
    translateTextAsync(text, currentLanguage)
      .then((res) => {
        if (isMounted && res) setTranslated(res);
      })
      .catch(() => {
        if (isMounted) setTranslated(text);
      });

    return () => { isMounted = false; };
  }, [text, currentLanguage, translateTextAsync]);

  return <>{translated || text}</>;
}

export function ConversationList({ conversations = [], activeConvId, onSelectConversation, currentUserUsername }) {
  const { addToast } = useToast();
  const { acceptChatRequest, declineChatRequest, getUserPresence } = useChat();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'requests'

  const cleanSelf = currentUserUsername ? normalizeUser(currentUserUsername) : '';

  // Incoming requests (sent by someone else to currentUser)
  const incomingRequests = conversations.filter(c => {
    return c.requestStatus === 'PENDING' && normalizeUser(c.requestSender) !== cleanSelf;
  });

  // Primary Section: Contains active chats + outgoing requests sent by currentUser
  const primaryChats = conversations.filter(c => {
    if (!c.requestStatus || c.requestStatus === 'ACCEPTED') return true;
    if (c.requestStatus === 'PENDING' && normalizeUser(c.requestSender) === cleanSelf) return true;
    return false;
  });

  const totalUnreadMessages = primaryChats.reduce((sum, conv) => sum + (conv.unreadCount || (conv.hasUnread ? 1 : 0)), 0);

  const handleAccept = async (e, convId) => {
    e.stopPropagation();
    try {
      await acceptChatRequest(convId);
      onSelectConversation(convId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (e, convId) => {
    e.stopPropagation();
    try {
      await declineChatRequest(convId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-col gap-sm" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── MESSAGES VS REQUESTS TABS ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', gap: '4px', marginBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'chats' ? 700 : 400,
            color: activeTab === 'chats' ? 'var(--deep-plum)' : 'var(--hurricane)',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: activeTab === 'chats' ? '2px solid var(--deep-plum)' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>{t('messagesTab')}</span>
          {totalUnreadMessages > 0 && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                background: '#EF4444',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '10px',
              }}
            >
              {totalUnreadMessages}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'requests' ? 700 : 400,
            color: activeTab === 'requests' ? 'var(--deep-plum)' : 'var(--hurricane)',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid var(--deep-plum)' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>{t('requestsTab')}</span>
          {incomingRequests.length > 0 && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                background: 'var(--deep-plum)',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '10px',
              }}
            >
              {incomingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB CONTENT: PRIMARY CHATS (INCLUDES SENT REQUESTS) ── */}
      {activeTab === 'chats' && (
        <div className="flex-col gap-xs" style={{ flex: 1, overflowY: 'auto' }}>
          {!primaryChats.length ? (
            <div className="p-md secondary-text text-center" style={{ padding: '32px 16px' }}>
              <MessageSquare size={28} style={{ color: 'var(--hurricane)', margin: '0 auto 8px auto' }} />
              {t('noActiveConversations')}
            </div>
          ) : (
            primaryChats.map((conv) => {
              const otherUsername = getOtherUsername(conv, cleanSelf);
              const isActive = conv.id === activeConvId;
              const isSentPending = conv.requestStatus === 'PENDING' && normalizeUser(conv.requestSender) === cleanSelf;
              const status = getUserPresence
                ? getUserPresence(otherUsername, conv.otherParticipantIsOnline, conv.otherParticipantLastSeen, t)
                : { isOnline: true, statusText: t('online', 'Online') };

              const hasUnread = Boolean(conv.hasUnread || (conv.unreadCount && conv.unreadCount > 0));
              const unreadCountVal = conv.unreadCount || (conv.hasUnread ? 1 : 0);

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex-row items-center gap-md"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive
                      ? 'var(--deep-plum-light)'
                      : (hasUnread ? '#FFF0F5' : 'transparent'),
                    border: isActive
                      ? '1.5px solid var(--deep-plum)'
                      : (hasUnread ? '1.5px solid #6F405F' : '1px solid transparent'),
                    borderLeft: hasUnread
                      ? '4px solid #6F405F'
                      : (isActive ? '4px solid var(--deep-plum)' : '1px solid transparent'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <InitialAvatar username={otherUsername} size={38} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: status.isOnline ? 'var(--success)' : 'var(--hurricane)',
                        border: '2px solid var(--pure-white)',
                      }}
                    />
                  </div>

                  <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex-row justify-between items-center">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: hasUnread ? 900 : 700, color: hasUnread ? '#6F405F' : 'var(--eclipse)' }}>
                          {otherUsername}
                        </span>
                        {hasUnread && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 900,
                              backgroundColor: '#B33A3A',
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              lineHeight: '1.2',
                              boxShadow: '0 2px 6px rgba(179,58,58,0.35)',
                            }}
                          >
                            {unreadCountVal} new
                          </span>
                        )}
                      </div>
                      <span className="caption-text" style={{ fontSize: '11px', fontWeight: hasUnread ? 700 : 400 }}>{formatDate(conv.updatedAt)}</span>
                    </div>

                    {isSentPending ? (
                      <span style={{ fontSize: '11.5px', color: 'var(--deep-plum)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <Clock size={11} /> {t('requestSent')} ⏳
                      </span>
                    ) : (
                      <p
                        style={{
                          fontSize: '12.5px',
                          fontWeight: hasUnread ? 800 : 400,
                          color: hasUnread ? '#2D1D15' : 'var(--hurricane)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                          margin: 0,
                        }}
                      >
                        <TranslatedSnippet text={conv.lastMessage} />
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB CONTENT: INCOMING REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="flex-col gap-xs" style={{ flex: 1, overflowY: 'auto' }}>
          {!incomingRequests.length ? (
            <div className="p-md secondary-text text-center" style={{ padding: '32px 16px' }}>
              <Inbox size={28} style={{ color: 'var(--hurricane)', margin: '0 auto 8px auto' }} />
              {t('noPendingRequests')}
            </div>
          ) : (
            incomingRequests.map((conv) => {
              const otherUsername = getOtherUsername(conv, cleanSelf);
              const isActive = conv.id === activeConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isActive ? 'var(--deep-plum)' : 'var(--border-light)'}`,
                    background: isActive ? 'var(--deep-plum-light)' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <InitialAvatar username={otherUsername} size={32} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--eclipse)' }}>
                          {otherUsername}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--hurricane)', fontWeight: 600 }}>
                          {t('chatRequest')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--eclipse)', margin: '2px 0 0 0', fontStyle: 'italic' }}>
                    "{otherUsername} {t('wantsToChat')}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
