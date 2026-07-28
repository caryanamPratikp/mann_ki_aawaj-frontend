import React, { useState, useEffect } from 'react';
import { SpeechBubbleComment } from '../comments/SpeechBubbleComment.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { MessageSquare, X, Send, Sparkles, Smile, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const EMOJI_LIST = ['😊', '❤️', '👍', '🔥', '💯', '🤝', '💡', '🧠', '💪', '🙏', '✨', '🎉'];

const STICKER_LIST = [
  { label: 'Warm Hug', icon: '🤗' },
  { label: 'Well Said', icon: '👏' },
  { label: 'Stay Strong', icon: '🛡️' },
  { label: 'Deep Peace', icon: '🌸' },
  { label: 'You Got This', icon: '🌟' },
  { label: 'I Understand', icon: '💬' },
];

export function HoverDiscussionPanel({ post, onClose, onQuickReply, arrowTop = 40 }) {
  const { commentsByPost, fetchComments, createComment, reactToComment } = useComments();
  const { currentUser } = useAuth();

  const [newCommentText, setNewCommentText] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (post?.id) {
      fetchComments(post.id, 'Latest');
    }
  }, [post?.id, fetchComments]);

  const commentsList = commentsByPost[post?.id] || [];

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment(post.id, newCommentText.trim(), post.username);
      setNewCommentText('');
      setShowStickerPicker(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInsertEmoji = (emoji) => {
    setNewCommentText(prev => prev + emoji);
  };

  const handleInsertSticker = (sticker) => {
    const stickerTag = `[${sticker.icon} ${sticker.label}] `;
    setNewCommentText(prev => prev + stickerTag);
    setShowStickerPicker(false);
  };

  if (!post) return null;

  const pointerY = Math.max(20, Math.min(arrowTop, 450));

  return (
    <aside
      className="hover-discussion-panel"
      style={{
        position: 'sticky',
        top: '84px',
        width: '380px',
        height: 'calc(100vh - 104px)',
        maxHeight: 'calc(100vh - 104px)',
        background: '#F5F2F1',
        border: '1.5px solid #9F9794',
        borderRadius: '16px',
        boxShadow: '0 6px 24px rgba(45,29,21,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        zIndex: 40,
        alignSelf: 'flex-start',
      }}
    >
      {/* ── SPEECH BUBBLE POINTER ARROW (POINTING DIRECTLY TO HOVERED POST CARD) ── */}
      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: `${pointerY}px`,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderRight: '12px solid #9F9794',
          transition: 'top 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 41,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-9.5px',
          top: `${pointerY}px`,
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderRight: '10px solid #ffffff',
          transition: 'top 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 42,
        }}
      />

      {/* ── INNER CONTAINER WITH FULL HEIGHT SCROLL ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── HEADER (UPDATED MATCHING COUNT) ── */}
        <div
          style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #D4CECC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} color="#6F405F" />
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>
              Live Discussion ({commentsList.length})
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8C8385',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── POST PREVIEW SNIPPET ── */}
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(111,64,95,0.05)',
            borderBottom: '1px solid #E1DCDB',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F' }}>
            {post.username} • {post.topic}
          </span>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: '#2D1D15',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {post.title || post.content}
          </p>
        </div>

        {/* ── SCROLLABLE COMMENTS LIST (10–15 COMMENTS) ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {commentsList.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: '#8C8385',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={20} color="#6F405F" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D1D15' }}>
                No comments yet. Start the conversation!
              </span>
            </div>
          ) : (
            commentsList.map((comment) => (
              <SpeechBubbleComment
                key={comment.id}
                comment={comment}
                onReact={(cId, emoji) => reactToComment(cId, post.id, emoji)}
                onQuickReply={onQuickReply}
              />
            ))
          )}
        </div>

        {/* ── EMOJI & STICKER PICKER POPOVER ── */}
        {showStickerPicker && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              bottom: '56px',
              left: '12px',
              right: '12px',
              background: '#ffffff',
              border: '1.5px solid #6F405F',
              borderRadius: '12px',
              padding: '10px 12px',
              boxShadow: '0 8px 24px rgba(45,29,21,0.16)',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', textTransform: 'uppercase' }}>
                Stickers &amp; Emojis
              </span>
              <button
                type="button"
                onClick={() => setShowStickerPicker(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C8385', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Expressive Stickers */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STICKER_LIST.map((stk) => (
                <button
                  key={stk.label}
                  type="button"
                  onClick={() => handleInsertSticker(stk)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    border: '1px solid #D4CECC',
                    background: '#F5F2F1',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#2D1D15',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6F405F'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D4CECC'}
                >
                  <span>{stk.icon}</span>
                  <span>{stk.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Emojis Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', borderTop: '1px solid #E1DCDB', paddingTop: '6px' }}>
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(111,64,95,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PINNED QUICK COMMENT COMPOSER AT BOTTOM ── */}
        <form
          onSubmit={handlePostComment}
          style={{
            padding: '10px 12px',
            background: '#ffffff',
            borderTop: '1px solid #D4CECC',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Sticker & Emoji Button */}
          <button
            type="button"
            onClick={() => setShowStickerPicker(prev => !prev)}
            style={{
              padding: '6px',
              borderRadius: '50%',
              border: `1px solid ${showStickerPicker ? '#6F405F' : '#9F9794'}`,
              background: showStickerPicker ? 'rgba(111,64,95,0.1)' : '#F5F2F1',
              color: showStickerPicker ? '#6F405F' : '#8C8385',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Add Sticker or Emoji"
          >
            <Smile size={16} />
          </button>

          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={currentUser ? 'Write a comment...' : 'Login to comment...'}
            disabled={!currentUser}
            style={{
              flex: 1,
              padding: '7px 12px',
              fontSize: '12px',
              borderRadius: '18px',
              border: '1px solid #9F9794',
              background: '#F5F2F1',
              outline: 'none',
              color: '#2D1D15',
            }}
          />

          <button
            type="submit"
            disabled={!newCommentText.trim() || submitting}
            style={{
              padding: '7px 12px',
              borderRadius: '18px',
              background: newCommentText.trim() ? '#6F405F' : '#9F9794',
              color: '#ffffff',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <Send size={11} /> Send
          </button>
        </form>
      </div>
    </aside>
  );
}
