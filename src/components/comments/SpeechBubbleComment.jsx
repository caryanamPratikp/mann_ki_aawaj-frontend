
import React, { useState, useEffect } from 'react';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { CornerDownLeft, Pin, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReplyList } from './ReplyList.jsx';

const EMOJI_REACTIONS = ['😀', '❤️', '👍', '🔥', '💯', '🤝'];

const keyMap = {
  'relate': '❤️',
  'helpful': '🔥',
  'wellSaid': '👍',
  'stayStrong': '🤝',
  'madeMeThink': '💯',
  'happy': '😀'
};

const emojiMap = {
  '❤️': 'relate',
  '🔥': 'helpful',
  '👍': 'wellSaid',
  '🤝': 'stayStrong',
  '💯': 'madeMeThink',
  '😀': 'relate'
};

export function SpeechBubbleComment({
  comment,
  onReact,
  onQuickReply,
  isPinned,
  onPinToggle,
  onNavigate,
}) {
  const { currentUser } = useAuth();
  const { currentLanguage, translateTextAsync } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [translatedCommentText, setTranslatedCommentText] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const srcText = comment.originalContent || comment.content;
    if (srcText && currentLanguage) {
      translateTextAsync(srcText, currentLanguage).then((res) => {
        if (isMounted && res) setTranslatedCommentText(res);
      });
    } else {
      setTranslatedCommentText(null);
    }
    return () => { isMounted = false; };
  }, [currentLanguage, comment.originalContent, comment.content]);

  const [activeEmojis, setActiveEmojis] = useState(() => {
    const list = [];
    const r = comment.reactions || {};
    if (r.relate > 0) list.push('❤️');
    if (r.helpful > 0) list.push('🔥');
    if (r.wellSaid > 0) list.push('👍');
    if (r.stayStrong > 0) list.push('🤝');
    if (r.madeMeThink > 0) list.push('💯');
    const userR = comment.userReaction;
    if (userR && keyMap[userR]) {
      const emoji = keyMap[userR];
      return [emoji, ...list.filter(x => x !== emoji)];
    }
    return list;
  });

  const handleEmojiClick = (emoji, e) => {
    if (e) e.stopPropagation();
    setActiveEmojis(prev => {
      const exists = prev.includes(emoji);
      if (exists) {
        return prev.filter(x => x !== emoji);
      } else {
        return [emoji, ...prev]; // Latest first!
      }
    });

    const key = emojiMap[emoji] || 'relate';
    if (onReact) onReact(comment.id, key);
  };

  const handleLikeToggle = (e) => {
    if (e) e.stopPropagation();
    handleEmojiClick('❤️');
  };

  const userLiked = activeEmojis.includes('❤️');
  const reactionCount = (comment.reactions?.relate || 0) + (comment.reactions?.helpful || 0) || 0;

  const handleAddReply = async (replyText) => {
    if (onQuickReply) {
      await onQuickReply(comment.postId || comment.targetPostId, replyText, comment.username);
    }
    setShowReplyBox(false);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-fade-in"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        padding: '6px 0',
        backgroundColor: 'transparent',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {/* ── FLOATING HOVER EMOJI BAR & QUICK REPLY ── */}
      {isHovered && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '-26px',
            left: '44px',
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
              setShowReplyBox((prev) => !prev);
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

          <div style={{ width: '1px', height: '14px', background: '#9F9794', margin: '0 2px' }} />

          {onPinToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle();
              }}
              style={{
                background: isPinned ? 'rgba(111,64,95,0.10)' : 'none',
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
              onMouseLeave={(e) => e.currentTarget.style.background = isPinned ? 'rgba(111,64,95,0.10)' : 'none'}
              title={isPinned ? 'Unpin Discussion' : 'Pin Discussion'}
            >
              <Pin size={11} style={{ fill: isPinned ? '#6F405F' : 'none' }} /> {isPinned ? 'Unpin' : 'Pin'}
            </button>
          )}
        </div>
      )}

      {/* Left Avatar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onNavigate && comment.username) onNavigate(`/profile/${comment.username.replace('@', '')}`);
        }}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
        title={`View ${comment.username}'s profile`}
      >
        <AvatarThumbnail
          username={comment.username}
          initials={comment.avatarInitials}
          config={comment.avatarConfig}
          size={32}
        />
      </button>

      {/* Middle Inline Text Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'inline', fontSize: '13.5px', lineHeight: 1.4, color: '#2D1D15' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigate && comment.username) onNavigate(`/profile/${comment.username.replace('@', '')}`);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginRight: '6px',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#6F405F',
              display: 'inline',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {comment.username}
          </button>
          {isPinned && (
            <span style={{
              fontSize: '8.5px',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#6F405F',
              padding: '1px 4px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              marginRight: '6px',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}>
              Pinned
            </span>
          )}
          <span style={{ whiteSpace: 'pre-line' }}>{translatedCommentText || comment.translatedContent || comment.content || comment.originalContent}</span>
        </div>

        {/* Action / Meta row below text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '11px', color: 'var(--hurricane)' }}>
          <span>{formatDate(comment.createdAt)}</span>

          {reactionCount > 0 && (
            <span style={{ fontWeight: 600 }}>{reactionCount} {reactionCount === 1 ? 'like' : 'likes'}</span>
          )}

          <button
            type="button"
            onClick={() => setShowReplyBox((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--hurricane)',
              padding: 0,
            }}
          >
            Reply
          </button>
        </div>

        {/* Nested Replies List */}
        <ReplyList
          replies={comment.replies || []}
          postId={comment.postId || comment.targetPostId}
          commentId={comment.id}
          onNavigate={onNavigate}
          showReplyComposer={showReplyBox}
          onCancelReplyComposer={() => setShowReplyBox(false)}
          onSubmitReply={handleAddReply}
          targetUsername={comment.username}
          onReplyTrigger={(username) => {
            setShowReplyBox(true);
          }}
        />
      </div>

      {/* Far Right Active Emojis Display */}
      {activeEmojis.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          alignSelf: 'flex-start',
          marginTop: '4px',
          flexShrink: 0
        }}>
          {activeEmojis.map((emoji, index) => (
            <span key={index} style={{ fontSize: '14px' }}>{emoji}</span>
          ))}
        </div>
      )}
    </div>
  );
}
