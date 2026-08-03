import React, { useState } from 'react';
import { Button } from '../common/Button.jsx';
import { ModerationIndicator } from '../common/ModerationIndicator.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

export function ReplyComposer({ commentId, postId, targetUsername, onSubmit, onCancel }) {
  const initialTag = targetUsername ? (targetUsername.startsWith('@') ? `${targetUsername} ` : `@${targetUsername} `) : '';
  const [text, setText] = useState(initialTag);
  const [submitting, setSubmitting] = useState(false);

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
        <ModerationIndicator text={text} />
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
