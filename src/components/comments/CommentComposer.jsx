import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Smile, AlertCircle, Mic, MicOff, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { moderationCheck } from '../../utils/moderationCheck.js';

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
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'
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

export function CommentComposer({
  postId,
  postAuthorUsername,
  onSubmit,
  onCancel,
  initialText = '',
  placeholder = 'Write a comment...',
  onNavigate
}) {
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { currentLanguage, t } = useLanguage();
  const [spokenLanguage] = useSpokenLanguage();

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  }, spokenLanguage);

  const minLength = 2;
  const maxLength = 1000;
  const isValid = text.trim().length >= minLength && text.length <= maxLength;

  // Real-time moderation check status
  const modCheck = moderationCheck(text);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isBlocked) return;

    if (currentUser?.status === 'COMMENT_RESTRICTED') {
      addToast(`Comment restricted: ${currentUser.restrictionReason || 'Account restricted.'}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
      setShowEmojis(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
  };

  return (
    <form onSubmit={handleSubmit} className="mka-card flex-col gap-sm" style={{ background: 'var(--soft-white)', padding: '12px 14px', borderRadius: '14px' }}>
      {currentUser?.status === 'COMMENT_RESTRICTED' && (
        <div
          className="flex-row items-center gap-sm p-sm"
          style={{
            background: 'var(--warning-bg)',
            color: 'var(--warning)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '13px',
          }}
        >
          <AlertCircle size={16} />
          <span>
            Your account is currently COMMENT_RESTRICTED. Reason: {currentUser.restrictionReason || 'Community violation'}.
          </span>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/my-reports')}
              style={{ textDecoration: 'underline', fontWeight: 600, marginLeft: 'auto' }}
            >
              Appeal
            </button>
          )}
        </div>
      )}

      <div className="flex-col gap-xs" style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={maxLength}
          disabled={submitting || currentUser?.status === 'COMMENT_RESTRICTED'}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: isBlocked ? '1px solid var(--error)' : '1px solid var(--border-light)',
            background: 'var(--pure-white)',
            fontSize: '14px',
            color: 'var(--eclipse)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.5,
          }}
        />

        {/* Real-time Moderation Indicator */}
        <div className="flex-row justify-between items-center" style={{ padding: '0 4px' }}>
          <ModerationIndicator text={text} />
          <span className="caption-text">
            {text.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* WhatsApp-Style Rich Categorized Emoji Picker */}
      {showEmojis && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #E5E0DF',
            boxShadow: '0 4px 16px rgba(45,29,21,0.08)',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE8E6', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategoryIndex(idx)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: activeCategoryIndex === idx ? 'rgba(111,64,95,0.12)' : 'transparent',
                    border: activeCategoryIndex === idx ? '1px solid #6F405F' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title={cat.name}
                >
                  <span>{cat.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: activeCategoryIndex === idx ? 700 : 500, color: activeCategoryIndex === idx ? '#6F405F' : '#6E625F' }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowEmojis(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8C8385' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Emoji Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
              gap: '4px',
              maxHeight: '140px',
              overflowY: 'auto',
              padding: '4px 0',
            }}
          >
            {EMOJI_CATEGORIES[activeCategoryIndex].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  fontSize: '18px',
                  padding: '4px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar Controls (Voice & WhatsApp Emoji — Guidelines removed as requested) */}
      <div className="flex-row justify-between items-center flex-wrap gap-sm" style={{ paddingTop: '2px' }}>
        <div className="flex-row items-center gap-sm" style={{ gap: '10px' }}>
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing || currentUser?.status === 'COMMENT_RESTRICTED'}
            title={isRecording ? 'Click to stop recording' : 'Speak comment (Voice-to-Text)'}
            className="flex-row items-center gap-xs secondary-text"
            style={{
              fontSize: '13px',
              color: isRecording ? '#B33A3A' : 'var(--deep-plum)',
              fontWeight: isRecording ? 700 : 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isTranscribing ? (
              <Loader2 size={15} className="spin-animation" />
            ) : isRecording ? (
              <MicOff size={15} />
            ) : (
              <Mic size={15} />
            )}
            <span>{isTranscribing ? 'Transcribing...' : isRecording ? 'Recording...' : 'Voice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="flex-row items-center gap-xs secondary-text"
            style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', color: showEmojis ? '#6F405F' : 'inherit' }}
          >
            <Smile size={16} style={{ color: showEmojis ? '#6F405F' : 'inherit' }} />
            <span>Emoji</span>
          </button>
        </div>

        <div className="flex-row items-center gap-sm">
          {onCancel && (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!isValid || isBlocked || submitting || currentUser?.status === 'COMMENT_RESTRICTED'}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  );
}
