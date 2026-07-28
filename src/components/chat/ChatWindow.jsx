import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Button } from '../common/Button.jsx';
import { Send, Lock, MessageSquare, Paperclip, Smile, CheckCheck, MoreVertical, Search } from 'lucide-react';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { mockChatService } from '../../services/mockChatService.js';

export function ChatWindow({ conversation, currentUserUsername, onSendMessage, onNavigate }) {
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUsername = conversation?.participants.find(
    p => p.toLowerCase() !== currentUserUsername?.toLowerCase()
  ) || 'User';

  // TanStack Query for Realtime Messages (Polling every 2s)
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => (conversation ? mockChatService.getMessagesForConversation(conversation.id) : []),
    enabled: !!conversation,
    refetchInterval: 2000,
  });

  // TanStack Query for Realtime User Status ("online" / "Active 3m ago")
  const { data: userStatus } = useQuery({
    queryKey: ['userStatus', otherUsername],
    queryFn: () => mockChatService.getUserRealtimeStatus(otherUsername),
    enabled: !!conversation && !!otherUsername,
    refetchInterval: 4000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const modCheck = moderationCheck(inputText);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isBlocked) return;

    setSubmitting(true);
    try {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowEmojis(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  if (!conversation) {
    return (
      <div className="mka-card flex-col items-center justify-center text-center p-lg" style={{ height: '100%', background: 'var(--pure-white)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--soft-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--deep-plum)' }}>
          <MessageSquare size={32} />
        </div>
        <h3 className="card-heading" style={{ fontSize: '20px', color: 'var(--eclipse)' }}>
          Select or start a conversation
        </h3>
        <p className="secondary-text" style={{ maxWidth: '360px', marginTop: '6px' }}>
          Choose an existing chat from the left or visit any member profile to start an end-to-end shielded 1-on-1 conversation.
        </p>
      </div>
    );
  }

  const QUICK_EMOJIS = ['😊', '🙏', '❤️', '💡', '🤝', '✨', '👍', '🌸'];

  return (
    <div className="mka-card flex-col" style={{ height: '100%', padding: 0, overflow: 'hidden', background: 'var(--pure-white)', borderRadius: 'var(--radius-lg)' }}>
      {/* WhatsApp-Style Chat Header */}
      <div className="flex-row items-center justify-between" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--soft-white)' }}>
        <button
          onClick={() => onNavigate && onNavigate(`/profile/${otherUsername.replace('@', '')}`)}
          className="flex-row items-center gap-md"
          style={{ cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ position: 'relative' }}>
            <InitialAvatar username={otherUsername} size={42} />
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: userStatus?.isOnline ? 'var(--success)' : 'var(--hurricane)',
                border: '2px solid var(--pure-white)',
              }}
            />
          </div>

          <div className="flex-col">
            <span className="bold" style={{ fontSize: '16px', color: 'var(--eclipse)' }}>
              {otherUsername}
            </span>
            <span className="caption-text" style={{ color: userStatus?.isOnline ? 'var(--success)' : 'var(--hurricane)', fontWeight: userStatus?.isOnline ? 600 : 400 }}>
              {userStatus?.label || 'Active recently'}
            </span>
          </div>
        </button>

        <div className="flex-row items-center gap-sm">
          <button style={{ padding: '6px', color: 'var(--hurricane)' }} title="Search messages">
            <Search size={18} />
          </button>
          <button style={{ padding: '6px', color: 'var(--hurricane)' }} title="More options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* WhatsApp Wallpaper Messages Area */}
      <div
        className="flex-col gap-sm"
        style={{
          flex: 1,
          padding: '20px 16px',
          overflowY: 'auto',
          background: '#EBE6E5', // WhatsApp-style warm neutral wallpaper background
          backgroundImage: 'radial-gradient(var(--border-light) 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      >
        {messages.map((msg) => {
          const isMine = msg.senderUsername?.toLowerCase() === currentUserUsername?.toLowerCase();
          return (
            <div
              key={msg.id}
              className="flex-row gap-xs"
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '72%',
              }}
            >
              {!isMine && <InitialAvatar username={msg.senderUsername} size={28} />}

              <div
                className="flex-col gap-xs"
                style={{
                  padding: '10px 14px',
                  borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isMine ? 'var(--deep-plum)' : 'var(--pure-white)',
                  color: isMine ? 'var(--pure-white)' : 'var(--eclipse)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <p className="body-text" style={{ fontSize: '14px', color: 'inherit', whiteSpace: 'pre-line', lineHeight: '1.45' }}>
                  {msg.text}
                </p>

                <div className="flex-row items-center gap-xs" style={{ alignSelf: 'flex-end', marginTop: '2px' }}>
                  <span className="caption-text" style={{ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.75)' : 'var(--hurricane)' }}>
                    {formatDate(msg.createdAt)}
                  </span>
                  {isMine && <CheckCheck size={13} style={{ color: 'rgba(255,255,255,0.85)' }} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis bar */}
      {showEmojis && (
        <div className="flex-row items-center gap-xs flex-wrap" style={{ padding: '8px 16px', background: 'var(--soft-white)', borderTop: '1px solid var(--border-light)' }}>
          {QUICK_EMOJIS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} style={{ fontSize: '20px', padding: '2px 4px' }}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Instagram Accept/Decline Banner if Pending */}
      {conversation.requestStatus === 'PENDING' && conversation.requestSender?.toLowerCase() !== currentUserUsername?.toLowerCase() ? (
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--soft-white)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--deep-plum)' }}>
            📩 {otherUsername} wants to send you a message.
          </span>
          <span style={{ fontSize: '12px', color: 'var(--hurricane)' }}>
            Do you want to accept this request and start talking anonymously?
          </span>
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '320px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                const convs = mockChatService.getConversations();
                const idx = convs.findIndex(c => c.id === conversation.id);
                if (idx !== -1) {
                  convs[idx].requestStatus = 'ACCEPTED';
                  localStorage.setItem('mka_chat_conversations', JSON.stringify(convs));
                  window.location.reload();
                }
              }}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--deep-plum)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Accept Request
            </button>
            <button
              type="button"
              onClick={() => {
                const convs = mockChatService.getConversations();
                const filtered = convs.filter(c => c.id !== conversation.id);
                localStorage.setItem('mka_chat_conversations', JSON.stringify(filtered));
                window.location.reload();
              }}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-pill)',
                background: '#ffffff',
                color: 'var(--hurricane)',
                border: '1px solid var(--border-light)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Decline
            </button>
          </div>
        </div>
      ) : (
        /* WhatsApp Input Composer Bar */
        <form onSubmit={handleSend} className="flex-col gap-xs" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', background: 'var(--pure-white)' }}>
          <ModerationIndicator text={inputText} />

          <div className="flex-row items-center gap-sm">
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{ color: 'var(--hurricane)', padding: '6px' }}>
              <Smile size={20} />
            </button>

            <button type="button" style={{ color: 'var(--hurricane)', padding: '6px' }}>
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type a message...`}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                border: isBlocked ? '1px solid var(--error)' : '1px solid var(--border-light)',
                background: 'var(--soft-white)',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isBlocked || submitting}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: !inputText.trim() || isBlocked ? 'var(--zorba)' : 'var(--deep-plum)',
                color: 'var(--pure-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputText.trim() || isBlocked ? 'default' : 'pointer',
                border: 'none',
                transition: 'background var(--transition-fast)',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
