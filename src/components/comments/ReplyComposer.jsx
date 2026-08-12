import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { SpokenLanguageSelector } from '../common/SpokenLanguageSelector.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

export function ReplyComposer({ commentId, postId, targetUsername, onSubmit, onCancel }) {
  const { currentLanguage } = useLanguage();
  const [spokenLanguage, setSpokenLanguage] = useSpokenLanguage();
  const initialTag = targetUsername ? (targetUsername.startsWith('@') ? `${targetUsername} ` : `@${targetUsername} `) : '';
  const [text, setText] = useState(initialTag);
  const [submitting, setSubmitting] = useState(false);

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  }, spokenLanguage);

  const minLength = 2;
  const maxLength = 1000;
  const isValid = text.trim().length >= minLength && text.length <= maxLength;
  const modCheck = moderationCheck(text);
  const isBlocked = modCheck.status === 'BLOCKED';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isBlocked) return;

    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-col gap-xs" style={{ marginTop: '4px', width: '100%' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        maxLength={maxLength}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: isBlocked ? '1px solid var(--error)' : '1px solid var(--border-light)',
          background: 'var(--pure-white)',
          fontSize: '14px',
          outline: 'none',
          resize: 'vertical',
        }}
      />

      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-xs" style={{ gap: '8px' }}>
          <SpokenLanguageSelector value={spokenLanguage} onChange={setSpokenLanguage} />
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            title={isRecording ? 'Click to stop recording' : 'Speak reply (Voice-to-Text)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              color: isRecording ? '#B33A3A' : 'var(--deep-plum)',
              fontWeight: isRecording ? 700 : 500
            }}
          >
            {isTranscribing ? (
              <Loader2 size={14} className="spin-animation" />
            ) : isRecording ? (
              <MicOff size={14} />
            ) : (
              <Mic size={14} />
            )}
            <span>{isTranscribing ? 'Transcribing...' : isRecording ? 'Recording...' : 'Voice'}</span>
          </button>
          <ModerationIndicator text={text} />
        </div>
        <div className="flex-row items-center gap-xs">
          <Button type="button" variant="text" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!isValid || isBlocked || submitting}>
            Reply
          </Button>
        </div>
      </div>
    </form>
  );
}
