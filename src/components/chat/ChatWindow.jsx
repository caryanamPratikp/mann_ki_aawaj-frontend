import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

function ChatMessageItem({ msg, isMine, currentLanguage, translateTextAsync }) {
  const originalText = msg.text || msg.content || '';
  const [displayText, setDisplayText] = useState(originalText);
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    if (!isMine && currentLanguage !== 'English' && originalText) {
      let isMounted = true;
      translateTextAsync(originalText, currentLanguage)
        .then(tText => {
          if (isMounted && tText !== originalText) {
            setDisplayText(tText);
            setIsTranslated(true);
          }
        })
        .catch(err => console.error(err));
      return () => { isMounted = false; };
    }
  }, [originalText, currentLanguage, isMine]);

  return (
    <div style={{ wordBreak: 'break-word' }}>
      {displayText}
      {isTranslated && (
        <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '6px', fontStyle: 'italic', display: 'inline-block' }}>
          🌐 translated
        </span>
      )}
    </div>
  );
}
import { useQuery } from '@tanstack/react-query';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Button } from '../common/Button.jsx';
import { Send, Lock, MessageSquare, Paperclip, Smile, Check, CheckCheck, MoreVertical, Search, Mic, MicOff, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { apiChatService } from '../../services/apiChatService.js';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';

export function ChatWindow({ conversation, currentUserUsername, onSendMessage, onNavigate, onAcceptRequest, onDeclineRequest }) {
  const { currentLanguage, translateTextAsync } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice to text recorder for direct messaging
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  });

  const otherUsername = conversation?.otherParticipantUsername
    || conversation?.participant2Username
    || (Array.isArray(conversation?.participants) ? conversation.participants.find(
        p => p.toLowerCase() !== currentUserUsername?.toLowerCase()
      ) : null)
    || 'User';

  const isPendingRequest = conversation?.requestStatus === 'PENDING';
  
  // Resolve current user's DB ID to match against requestSenderId
  const currentUserId = conversation?.participant1Username?.toLowerCase() === currentUserUsername?.toLowerCase() 
    ? conversation?.participant1Id 
    : conversation?.participant2Id;

  // Resolve request sender username handle
  const requestSenderUsername = conversation?.requestSender || (
    conversation?.requestSenderId === conversation?.participant1Id 
      ? conversation?.participant1Username 
      : conversation?.participant2Username
  );

  const cleanSelf = currentUserUsername ? (currentUserUsername.startsWith('@') ? currentUserUsername.toLowerCase() : `@${currentUserUsername.toLowerCase()}`) : '';
  const cleanSender = requestSenderUsername ? (requestSenderUsername.startsWith('@') ? requestSenderUsername.toLowerCase() : `@${requestSenderUsername.toLowerCase()}`) : '';
  const isRecipientOfRequest = isPendingRequest && cleanSender !== cleanSelf;

  // TanStack Query for Realtime Messages (Polling every 5s)
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => (conversation ? apiChatService.getMessages(conversation.id) : []),
    enabled: !!conversation,
    refetchInterval: 5000,
  });

  // TanStack Query for Realtime User Status ("Online" / "Last seen today at 12:30 PM")
  const { data: userStatus } = useQuery({
    queryKey: ['userStatus', otherUsername],
    queryFn: () => apiChatService.getUserRealtimeStatus(otherUsername),
    enabled: !!conversation && !!otherUsername,
    refetchInterval: 5000,
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

  if (!conversation) {
    return (
      <div className="mka-card flex-col items-center justify-center text-center p-lg" style={{ height: '100%', background: 'var(--pure-white)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--soft-white)', display: 'flex', alignItems: 'center', justifycontent: 'center', margin: '0 auto 16px auto', color: 'var(--deep-plum)' }}>
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

  return (
    <div className="mka-card flex-col" style={{ height: '100%', padding: 0, overflow: 'hidden', background: 'var(--pure-white)', borderRadius: 'var(--radius-lg)' }}>
      {/* Chat Header */}
      <div className="flex-row items-center justify-between" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--soft-white)' }}>
        <button
          onClick={() => onNavigate && onNavigate(`/profile/${otherUsername.replace('@', '')}`)}
          className="flex-row items-center gap-md"
          style={{ cursor: 'pointer', textAlign: 'left', background: 'none', border: 'none' }}
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
              {userStatus?.isOnline ? 'Online' : (userStatus?.statusText || userStatus?.label || 'Last seen recently')}
            </span>
          </div>
        </button>

        <div className="flex-row items-center gap-sm">
          <button style={{ padding: '6px', color: 'var(--hurricane)', background: 'none', border: 'none', cursor: 'pointer' }} title="Search messages">
            <Search size={18} />
          </button>
          <button style={{ padding: '6px', color: 'var(--hurricane)', background: 'none', border: 'none', cursor: 'pointer' }} title="More options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-col gap-sm"
        style={{
          flex: 1,
          padding: '20px 16px',
          overflowY: 'auto',
          background: '#EBE6E5',
          backgroundImage: 'radial-gradient(var(--border-light) 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      >
        {messages.map((msg) => {
          const isMine = msg.senderUsername?.toLowerCase() === currentUserUsername?.toLowerCase();
          const isRead = msg.status === 'READ' || msg.isRead === true || conversation?.requestStatus === 'ACCEPTED';
          const isDelivered = msg.status === 'DELIVERED';

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
                style={{
                  padding: '10px 14px',
                  borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isMine ? 'var(--deep-plum)' : 'var(--pure-white)',
                  color: isMine ? 'var(--pure-white)' : 'var(--eclipse)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  fontSize: '14px',
                  lineHeight: 1.45,
                }}
              >
                <ChatMessageItem msg={msg} isMine={isMine} currentLanguage={currentLanguage} translateTextAsync={translateTextAsync} />
                <div
                  style={{
                    fontSize: '10px',
                    color: isMine ? 'rgba(255,255,255,0.75)' : 'var(--hurricane)',
                    textAlign: 'right',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                  }}
                >
                  {formatDate(msg.createdAt || msg.timestamp)}
                  {isMine && (
                    isRead ? (
                      <CheckCheck size={14} color="#34B7F1" title="Read (Double Blue Tick)" />
                    ) : isDelivered ? (
                      <CheckCheck size={14} color="rgba(255,255,255,0.85)" title="Delivered (Double Grey Tick)" />
                    ) : (
                      <Check size={14} color="rgba(255,255,255,0.85)" title="Sent (Single Grey Tick)" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Request Action Banner if Request Pending */}
      {isPendingRequest ? (
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--soft-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {isRecipientOfRequest ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--eclipse)' }}>
                  {otherUsername} wants to chat with you
                </span>
                <span style={{ fontSize: '12px', color: 'var(--hurricane)' }}>
                  Accept to start chatting and continuous messaging.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onAcceptRequest && onAcceptRequest(conversation.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'var(--deep-plum)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={16} /> Accept
                </button>
                <button
                  type="button"
                  onClick={() => onDeclineRequest && onDeclineRequest(conversation.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'var(--soft-white)',
                    color: 'var(--hurricane)',
                    border: '1px solid var(--border-light)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <XCircle size={16} /> Decline
                </button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: 'var(--deep-plum)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Clock size={16} /> Chat Request Sent ⏳ Waiting for {otherUsername} to accept.
            </div>
          )}
        </div>
      ) : (
        /* Standard Composer Bar */
        <form onSubmit={handleSend} className="flex-col gap-xs" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', background: 'var(--pure-white)' }}>
          <ModerationIndicator text={inputText} />

          <div className="flex-row items-center gap-sm">
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{ color: 'var(--hurricane)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Smile size={20} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? 'Recording message...'
                  : isTranscribing
                  ? 'Transcribing voice message...'
                  : 'Type a message...'
              }
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                border: isRecording ? '1.5px solid #B33A3A' : isBlocked ? '1px solid var(--error)' : '1px solid var(--border-light)',
                background: isRecording ? 'rgba(179,58,58,0.05)' : 'var(--soft-white)',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            {/* VOICE TO TEXT MICROPHONE BUTTON */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTranscribing}
              title={isRecording ? 'Stop recording' : 'Speak to convert voice to text'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.10)',
                color: isRecording ? '#FFFFFF' : 'var(--deep-plum)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isTranscribing ? (
                <Loader2 size={16} className="spin-animation" />
              ) : isRecording ? (
                <MicOff size={16} />
              ) : (
                <Mic size={16} />
              )}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || isBlocked || submitting}
              style={{
                width: '36px',
                height: '36px',
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
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
