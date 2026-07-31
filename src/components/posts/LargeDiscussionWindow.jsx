import React, { useState } from 'react';
import { SpeechBubbleComment } from '../comments/SpeechBubbleComment.jsx';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { MessageSquare, Send, Sparkles, ChevronDown, ChevronUp, Mic, MicOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';

export function LargeDiscussionWindow({ post, comments: passedComments, onAddComment, onReactComment, onNavigate }) {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [pinnedCommentId, setPinnedCommentId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Voice to text recorder for comments
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setCommentText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  });

  if (!post) {
    return (
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EDE8E6',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#8C8385',
        }}
      >
        <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
          Select a post from the topic stream to join the discussion.
        </p>
      </div>
    );
  }

  // Use passed comments or empty array
  const comments = passedComments || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(post.id, commentText.trim());
    }
    setCommentText('');
  };

  const pinnedComment = comments.find((c) => c.id === pinnedCommentId);
  const regularComments = comments.filter((c) => c.id !== pinnedCommentId);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EDE8E6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* ── TOP BAR / MAIN POST HEADER (Click to Expand / Collapse) ── */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{
          padding: '14px 18px',
          borderBottom: isExpanded ? '1px solid #EDE8E6' : 'none',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigate) onNavigate(`/profile/${post.username.replace('@', '')}`);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
            title={`View ${post.username}'s profile`}
          >
            <AvatarThumbnail
              username={post.username}
              initials={post.avatarInitials}
              config={post.avatarConfig}
              size={36}
            />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNavigate) onNavigate(`/profile/${post.username.replace('@', '')}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#2D1D15',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {post.username}
              </button>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6F405F',
                  backgroundColor: 'rgba(111,64,95,0.08)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {post.topic || 'General'}
              </span>
              <span style={{ fontSize: '11px', color: '#8C8385' }}>
                • {formatDate(post.createdAt)}
              </span>
            </div>
            <h2
              style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#2D1D15',
                margin: '2px 0 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {post.content}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {pinnedCommentId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPinnedCommentId(null);
              }}
              style={{
                fontSize: '11px',
                color: '#6F405F',
                background: 'rgba(111,64,95,0.08)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Unpin
            </button>
          )}
          <span
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: '#EDE8E6',
              display: 'flex',
              color: '#2D1D15',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* ── EXPANDABLE DISCUSSION BODY ── */}
      {isExpanded && (
        <div
          style={{
            padding: '16px 20px',
            maxHeight: '460px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#F7F4F3',
          }}
        >
          {/* PINNED COMMENT BANNER */}
          {pinnedComment && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1.5px solid #6F405F',
                boxShadow: '0 2px 8px rgba(111,64,95,0.08)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6F405F',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={13} /> PINNED HIGHLIGHT
              </div>
              <SpeechBubbleComment
                comment={pinnedComment}
                onReact={onReactComment}
                isPinned={true}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {/* COMMENTS FEED */}
          {regularComments.length > 0 ? (
            regularComments.map((comment) => (
              <div key={comment.id} style={{ position: 'relative' }}>
                <SpeechBubbleComment
                  comment={comment}
                  onReact={onReactComment}
                  onPin={() => setPinnedCommentId(comment.id)}
                  onNavigate={onNavigate}
                />
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#8C8385',
                fontSize: '13px',
              }}
            >
              No comments yet. Be the first to start the conversation!
            </div>
          )}
        </div>
      )}

      {/* ── LIVE COMMENT COMPOSER (Bottom) ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #EDE8E6',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <AvatarThumbnail
          username={currentUser?.username || '@anonymous'}
          initials={currentUser?.avatarInitials || 'AN'}
          config={currentUser?.avatarConfig}
          size={32}
        />
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening to voice...'
              : isTranscribing
              ? 'Converting speech to text...'
              : `Comment as ${currentUser?.username || 'anonymous'}...`
          }
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '20px',
            border: isRecording ? '1.5px solid #B33A3A' : '1.5px solid #D4CECC',
            fontSize: '12.5px',
            outline: 'none',
            color: '#2D1D15',
            backgroundColor: isRecording ? 'rgba(179,58,58,0.05)' : '#FAFAFA',
          }}
        />

        {/* VOICE-TO-TEXT MICROPHONE BUTTON */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isTranscribing}
          title={isRecording ? 'Click to stop recording' : 'Click to convert voice to text'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.10)',
            color: isRecording ? '#FFFFFF' : '#6F405F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isTranscribing ? (
            <Loader2 size={15} className="spin-animation" />
          ) : isRecording ? (
            <MicOff size={15} />
          ) : (
            <Mic size={15} />
          )}
        </button>

        <button
          type="submit"
          disabled={!commentText.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: commentText.trim() ? '#6F405F' : '#EAE5E3',
            color: commentText.trim() ? '#FFFFFF' : '#9F9794',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: commentText.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Send size={13} /> Send
        </button>
      </form>
    </div>
  );
}
