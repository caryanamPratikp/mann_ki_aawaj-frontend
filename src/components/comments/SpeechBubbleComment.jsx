import React, { useState } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { Heart, CornerDownLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const EMOJI_REACTIONS = ['😀', '❤️', '👍', '🔥', '💯', '🤝'];

export function SpeechBubbleComment({
  comment,
  onReact,
  onQuickReply,
}) {
  const { currentUser } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [userLiked, setUserLiked] = useState(comment.userReaction === 'relate');
  const [likeCount, setLikeCount] = useState(
    (comment.reactions?.relate || 0) + (comment.reactions?.helpful || 0) || 0
  );

  const handleLikeToggle = (e) => {
    if (e) e.stopPropagation();
    const newLiked = !userLiked;
    setUserLiked(newLiked);
    setLikeCount(prev => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (onReact) onReact(comment.id, 'relate');
  };

  const handleEmojiClick = (emoji, e) => {
    e.stopPropagation();
    if (onReact) onReact(comment.id, emoji);
    handleLikeToggle();
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onQuickReply) {
      onQuickReply(comment.postId || comment.targetPostId, replyText.trim(), comment.username);
    }
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '10px 12px',
        borderRadius: '12px',
        background: '#ffffff',
        border: `1.5px solid ${isHovered ? '#6F405F' : '#D4CECC'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        transition: 'all 0.15s ease',
        boxShadow: isHovered ? '0 3px 12px rgba(111,64,95,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* ── FLOATING HOVER EMOJI BAR & QUICK REPLY ── */}
      {isHovered && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '-30px',
            left: '12px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#ffffff',
            padding: '3px 8px',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(45,29,21,0.16)',
            border: '1.5px solid #6F405F',
          }}
        >
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => handleEmojiClick(emoji, e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px 4px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          <div style={{ width: '1px', height: '14px', background: '#9F9794', margin: '0 2px' }} />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReplyBox(prev => !prev);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              color: '#6F405F',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(111,64,95,0.10)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <CornerDownLeft size={11} /> Quick Reply
          </button>
        </div>
      )}

      {/* ── HEADER: Avatar, Username, Time (Left) & Like Reaction (Right) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <InitialAvatar username={comment.username} initials={comment.avatarInitials} size={22} />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#6F405F' }}>
            {comment.username}
          </span>
          <span style={{ fontSize: '11px', color: '#8C8385' }}>
            • {formatDate(comment.createdAt)}
          </span>
        </div>

        {/* Like Reaction Count on Right Side */}
        <button
          type="button"
          onClick={handleLikeToggle}
          style={{
            background: userLiked ? 'rgba(111,64,95,0.12)' : 'transparent',
            border: `1px solid ${userLiked ? '#6F405F' : 'transparent'}`,
            borderRadius: '12px',
            padding: '2px 7px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            color: userLiked ? '#6F405F' : '#8C8385',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={12} style={{ fill: userLiked ? '#6F405F' : 'none' }} />
          {likeCount > 0 && <span style={{ fontWeight: 700 }}>{likeCount}</span>}
        </button>
      </div>

      {/* ── COMMENT TEXT BELOW HEADER ── */}
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: 1.45,
          color: '#2D1D15',
          whiteSpace: 'pre-line',
        }}
      >
        {comment.content}
      </p>

      {/* ── INLINE QUICK REPLY BOX ── */}
      {showReplyBox && (
        <form
          onSubmit={handleReplySubmit}
          style={{
            marginTop: '4px',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.username}...`}
            autoFocus
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '12px',
              borderRadius: '16px',
              border: '1.5px solid #6F405F',
              background: '#ffffff',
              outline: 'none',
              color: '#2D1D15',
            }}
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              background: replyText.trim() ? '#6F405F' : '#9F9794',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: replyText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Send size={11} /> Reply
          </button>
        </form>
      )}
    </div>
  );
}
