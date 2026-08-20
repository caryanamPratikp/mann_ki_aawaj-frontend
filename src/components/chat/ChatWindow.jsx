import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../common/Button.jsx';
import {
  Send, Lock, MessageSquare, Paperclip, Smile, Check, CheckCheck,
  MoreVertical, Search, Mic, MicOff, Loader2, Clock, ArrowLeft,
  UserX, ShieldAlert, Trash2, VolumeX, Volume2, User
} from 'lucide-react';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { apiChatService } from '../../services/apiChatService.js';
import { apiTranslationService } from '../../services/apiTranslationService.js';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { SpokenLanguageSelector } from '../common/SpokenLanguageSelector.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

// WhatsApp-style categorized emoji collection
const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    icon: '🔥',
    emojis: ['😊', '❤️', '🔥', '👍', '🙏', '💡', '🤝', '💯', '🌸', '✨', '👏', '😍', '🤣', '🎉', '🚀', '🙌'],
  },
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
      '😬', '🤥', '😌', '😔', '😪', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '😎',
      '🥳', '🥸', '🤓', '🧐'
    ],
  },
  {
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '<ctrl42>', '💪'
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
      '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '😍', '🥰', '😘', '💋'
    ],
  },
  {
    name: 'Party & Objects',
    icon: '🎉',
    emojis: [
      '✨', '🔥', '🎉', '🎊', '🎁', '🎈', '⭐', '🌟', '💫', '💥', '💯', '🚀',
      '🏆', '🥇', '🎯', '💡', '📚', '☕', '🍰', '🍕', '🌸', '🌹', '🌺', '🌱'
    ],
  },
];

export function ChatWindow({
  conversation,
  currentUserUsername,
  onSendMessage,
  onNavigate,
  onAcceptRequest,
  onDeclineRequest,
  onBackToList,
}) {
  const { currentLanguage, t } = useLanguage();
  const { getUserPresence, acceptChatRequest, declineChatRequest, setConversations } = useChat();
  const { blockUser } = useReports();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [spokenLanguage, setSpokenLanguage] = useSpokenLanguage();
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [translatedMap, setTranslatedMap] = useState({});

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const emojiRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(e.target) && !e.target.closest('.emoji-toggle-btn')) {
        setShowEmojis(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice recorder
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setInputText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  }, spokenLanguage);

  const otherUsername =
    conversation?.otherParticipantUsername ||
    conversation?.participant2Username ||
    (Array.isArray(conversation?.participants)
      ? conversation.participants.find((p) => p.toLowerCase() !== currentUserUsername?.toLowerCase())
      : null) ||
    'User';

  const cleanOtherHandle = otherUsername.replace(/^@/, '');

  const userStatus = getUserPresence
    ? getUserPresence(otherUsername, conversation?.otherParticipantIsOnline, conversation?.otherParticipantLastSeen, t)
    : { isOnline: true, statusText: t('online', 'Online') };

  const isPendingRequest = conversation?.requestStatus === 'PENDING';
  const requestSenderUsername =
    conversation?.requestSender ||
    (conversation?.requestSenderId === conversation?.participant1Id
      ? conversation?.participant1Username
      : conversation?.participant2Username);

  const cleanSelf = currentUserUsername
    ? currentUserUsername.startsWith('@') ? currentUserUsername.toLowerCase() : `@${currentUserUsername.toLowerCase()}`
    : '';
  const cleanSender = requestSenderUsername
    ? requestSenderUsername.startsWith('@') ? requestSenderUsername.toLowerCase() : `@${requestSenderUsername.toLowerCase()}`
    : '';
  const isRecipientOfRequest = isPendingRequest && cleanSender !== cleanSelf;

  // TanStack Query for Realtime Messages
  const { data: rawMessages = [] } = useQuery({
    queryKey: ['messages', conversation?.id],
    queryFn: () => (conversation ? apiChatService.getMessages(conversation.id) : []),
    enabled: Boolean(conversation?.id),
    staleTime: 1000,
  });

  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    setLocalMessages(rawMessages);
  }, [rawMessages]);

  // Batch Translation Logic
  useEffect(() => {
    if (!localMessages || localMessages.length === 0) return;
    const allTexts = localMessages.map((m) => m.content || m.text || '').filter((t) => Boolean(t && t.trim()));

    if (allTexts.length > 0) {
      let isMounted = true;
      apiTranslationService.translateBatchText(allTexts, currentLanguage)
        .then((resMap) => {
          if (isMounted && resMap) {
            setTranslatedMap((prev) => ({ ...prev, ...resMap }));
          }
        })
        .catch((e) => console.warn('[ChatWindow] Batch translation notice:', e));

      return () => { isMounted = false; };
    }
  }, [localMessages, currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const modCheck = moderationCheck(inputText);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || submitting || !conversation) return;

    if (isBlocked) {
      addToast(modCheck.reason || 'Message violates safety guidelines.', 'error');
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    setShowEmojis(false);
    setSubmitting(true);

    try {
      if (onSendMessage) {
        await onSendMessage(conversation.id, textToSend);
      } else {
        await apiChatService.sendMessage(conversation.id, textToSend);
      }
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      addToast(err?.message || 'Failed to send message', 'error');
      setInputText(textToSend);
    } finally {
      setSubmitting(false);
    }
  };

  const displayMessages = useMemo(() => {
    if (!searchQuery.trim()) return localMessages;
    const qLower = searchQuery.trim().toLowerCase();
    return localMessages.filter((m) => {
      const orig = m.content || m.text || '';
      const trans = translatedMap[orig] || orig;
      return orig.toLowerCase().includes(qLower) || trans.toLowerCase().includes(qLower);
    });
  }, [localMessages, searchQuery, translatedMap]);

  const handleClearChat = () => {
    setIsMenuOpen(false);
    setLocalMessages([]);
    addToast('Chat messages cleared.', 'info');
  };

  const handleBlockUserInChat = () => {
    setIsMenuOpen(false);
    blockUser(cleanOtherHandle);
    if (onBackToList) onBackToList();
  };

  if (!conversation) {
    return (
      <div
        className="mka-card flex-col items-center justify-center text-center p-xl"
        style={{
          height: '100%',
          background: 'var(--pure-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <MessageSquare size={48} style={{ color: 'var(--hurricane)', opacity: 0.6 }} />
        <h3 className="card-heading" style={{ marginTop: '12px' }}>
          {t('selectConversation', 'Select a Conversation')}
        </h3>
        <p className="secondary-text" style={{ maxWidth: '360px', marginTop: '6px' }}>
          {t('chooseExistingChat', 'Choose an existing chat from the left sidebar or start a new anonymous message.')}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        position: 'relative',
        padding: 0,
        overflow: 'hidden',
        background: 'var(--pure-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-light)',
      }}
    >
      {/* ── STICKY CHAT HEADER NAVBAR ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-light)',
          background: '#FAF7F6',
          flexShrink: 0,
          zIndex: 100,
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Back Button - Collapse Chat Window */}
          {onBackToList && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onBackToList) onBackToList();
              }}
              style={{
                background: '#EFEAE8',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                color: '#2D1D15',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
              title="Close chat window"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate && onNavigate(`/profile/${cleanOtherHandle}`)}
            style={{ cursor: 'pointer', textAlign: 'left', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{ position: 'relative' }}>
              <InitialAvatar username={otherUsername} size={40} />
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: userStatus?.isOnline ? 'var(--success)' : 'var(--hurricane)',
                  border: '2px solid var(--pure-white)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--eclipse)', lineHeight: 1.2 }}>
                {otherUsername}
              </span>
              <span style={{ fontSize: '12px', color: userStatus?.isOnline ? 'var(--success)' : 'var(--hurricane)', fontWeight: userStatus?.isOnline ? 600 : 400 }}>
                {userStatus?.isOnline ? 'Online' : (userStatus?.statusText || 'Last seen recently')}
              </span>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
            style={{
              padding: '8px',
              borderRadius: '50%',
              color: isSearchOpen ? 'var(--deep-plum)' : 'var(--hurricane)',
              background: isSearchOpen ? '#EFEAE8' : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Search messages in chat"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              padding: '8px',
              borderRadius: '50%',
              color: isMenuOpen ? 'var(--deep-plum)' : 'var(--hurricane)',
              background: isMenuOpen ? '#EFEAE8' : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="More options"
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: '0',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                border: '1px solid var(--border-light)',
                padding: '6px 0',
                minWidth: '190px',
                zIndex: 999,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onNavigate) onNavigate(`/profile/${cleanOtherHandle}`);
                }}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--eclipse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 500,
                }}
              >
                <User size={15} /> View Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--eclipse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 500,
                }}
              >
                <Search size={15} /> Search Chat Messages
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsMuted(!isMuted);
                  addToast(isMuted ? 'Chat unmuted' : 'Chat muted', 'info');
                }}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--eclipse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 500,
                }}
              >
                {isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--eclipse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 500,
                }}
              >
                <Trash2 size={15} /> Clear Chat
              </button>

              <button
                type="button"
                onClick={handleBlockUserInChat}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--error)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 600,
                }}
              >
                <UserX size={15} /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── IN-CHAT SEARCH BAR ── */}
      {isSearchOpen && (
        <div
          style={{
            padding: '8px 16px',
            background: '#F5F2F0',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <Search size={16} style={{ color: 'var(--hurricane)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text in this chat..."
            autoFocus
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: '13.5px',
              outline: 'none',
              color: 'var(--eclipse)',
            }}
          />
          {searchQuery && (
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6F405F', background: '#FFFFFF', padding: '2px 8px', borderRadius: '10px' }}>
              {displayMessages.length} matches
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--hurricane)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── PENDING CHAT REQUEST BANNER ── */}
      {isPendingRequest && isRecipientOfRequest && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FAF5F8',
            borderBottom: '1px solid #EAE0E6',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '13px', color: '#6F405F', fontWeight: 600 }}>
            💬 Chat Request from <strong>{requestSenderUsername || otherUsername}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              size="sm"
              variant="primary"
              onClick={async () => {
                if (onAcceptRequest) await onAcceptRequest(conversation.id);
                else if (acceptChatRequest) await acceptChatRequest(conversation.id);
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
              }}
            >
              Accept Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (onDeclineRequest) await onDeclineRequest(conversation.id);
                else if (declineChatRequest) await declineChatRequest(conversation.id);
                if (onBackToList) onBackToList();
              }}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* ── MESSAGES LIST CONTAINER ── */}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          padding: '16px',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#EBE6E5',
          backgroundImage: 'radial-gradient(var(--border-light) 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {displayMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#8C8385', fontSize: '13px' }}>
            {searchQuery ? `No messages matching "${searchQuery}"` : 'No messages in this chat yet. Say hi! 👋'}
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isMine = msg.senderUsername?.toLowerCase() === currentUserUsername?.toLowerCase();
            const origText = msg.content || msg.text || '';
            const translatedText = translatedMap[origText] || origText;

            return (
              <div
                key={msg.id || `msg_${Math.random()}`}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                {!isMine && <InitialAvatar username={msg.senderUsername || otherUsername} size={28} />}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isMine ? 'var(--deep-plum)' : 'var(--pure-white)',
                    color: isMine ? 'var(--pure-white)' : 'var(--eclipse)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  {translatedText}

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
                    <span>{formatDate(msg.createdAt || new Date().toISOString())}</span>
                    {isMine && (
                      <CheckCheck size={13} style={{ color: 'rgba(255,255,255,0.9)' }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── WHATSAPP-STYLE EMOJI PICKER POPUP ── */}
      {showEmojis && (
        <div
          ref={emojiRef}
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '16px',
            right: '16px',
            maxWidth: '380px',
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            zIndex: 999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#FAF7F6',
              borderBottom: '1px solid var(--border-light)',
              padding: '4px 6px',
              overflowX: 'auto',
            }}
          >
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategoryIndex(idx)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '16px',
                  background: activeCategoryIndex === idx ? '#FFFFFF' : 'none',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: activeCategoryIndex === idx ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title={cat.name}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              padding: '10px',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {EMOJI_CATEGORIES[activeCategoryIndex].emojis.map((emoji, idx) => (
              <button
                key={`${emoji}_${idx}`}
                type="button"
                onClick={() => setInputText((prev) => prev + emoji)}
                style={{
                  fontSize: '20px',
                  padding: '6px 2px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease, background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F2F0';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT CHAT COMPOSER ── */}
      <form
        onSubmit={handleSend}
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--pure-white)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="emoji-toggle-btn"
            onClick={() => setShowEmojis(!showEmojis)}
            style={{
              padding: '10px',
              borderRadius: '50%',
              border: 'none',
              background: showEmojis ? '#EFEAE8' : '#FAF7F6',
              color: showEmojis ? 'var(--deep-plum)' : 'var(--eclipse)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Emoji Picker"
          >
            <Smile size={18} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a secure message..."
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: isBlocked ? '1.5px solid var(--error)' : '1px solid var(--border-light)',
              fontSize: '14px',
              outline: 'none',
              background: '#FAF7F6',
            }}
          />

          <button
            type="button"
            onClick={toggleRecording}
            style={{
              padding: '10px',
              borderRadius: '50%',
              border: 'none',
              background: isRecording ? 'var(--error)' : '#FAF7F6',
              color: isRecording ? '#FFFFFF' : 'var(--eclipse)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isRecording ? 'Stop Recording' : 'Voice Input'}
          >
            {isTranscribing ? (
              <Loader2 size={18} className="spin-animation" />
            ) : isRecording ? (
              <MicOff size={18} />
            ) : (
              <Mic size={18} />
            )}
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || submitting || isBlocked}
            style={{
              padding: '10px 18px',
              borderRadius: '24px',
              border: 'none',
              background: 'var(--deep-plum)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: (!inputText.trim() || submitting || isBlocked) ? 'not-allowed' : 'pointer',
              opacity: (!inputText.trim() || submitting || isBlocked) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {submitting ? <Loader2 size={16} className="spin-animation" /> : <Send size={16} />}
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
