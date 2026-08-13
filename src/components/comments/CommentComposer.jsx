import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Smile, BookOpen, AlertCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { SpokenLanguageSelector } from '../common/SpokenLanguageSelector.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

const QUICK_EMOJIS = ['😊', '🙏', '❤️', '💡', '🤝', '🌸', '✨', '👏'];

export function CommentComposer({
  postId,
  postAuthorUsername,
  onSubmit,
  onCancel,
  initialText = '',
  placeholder = 'Write a respectful comment...',
  onNavigate
}) {
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { currentLanguage } = useLanguage();
  const [spokenLanguage, setSpokenLanguage] = useSpokenLanguage();

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
    <form onSubmit={handleSubmit} className="mka-card flex-col gap-sm" style={{ background: 'var(--soft-white)' }}>
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
            Your account is currently COMMENT_RESTRICTED. Reason: {currentUser.restrictionReason || 'Community violation'}. End date: {currentUser.restrictionEndsAt ? new Date(currentUser.restrictionEndsAt).toLocaleDateString() : 'Active'}.
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
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: isBlocked ? '1px solid var(--error)' : '1px solid var(--border-light)',
            background: 'var(--pure-white)',
            fontSize: '15px',
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

      {/* Quick Emojis Drawer */}
      {showEmojis && (
        <div className="flex-row items-center gap-xs flex-wrap" style={{ padding: '6px', background: 'var(--pure-white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              style={{ fontSize: '18px', padding: '4px 6px' }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="flex-row justify-between items-center flex-wrap gap-sm" style={{ paddingTop: '4px' }}>
        <div className="flex-row items-center gap-sm" style={{ gap: '8px' }}>
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
            style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Smile size={16} />
            <span>Emoji</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/community-guidelines')}
              className="flex-row items-center gap-xs secondary-text"
              style={{ fontSize: '13px', color: 'var(--deep-plum)' }}
            >
              <BookOpen size={15} />
              <span>Guidelines</span>
            </button>
          )}
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
