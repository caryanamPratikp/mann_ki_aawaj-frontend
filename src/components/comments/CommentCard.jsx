import React, { useState } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { CommentReactions } from './CommentReactions.jsx';
import { CommentMenu } from './CommentMenu.jsx';
import { ReplyComposer } from './ReplyComposer.jsx';
import { ReplyList } from './ReplyList.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';
import { Reply, Languages, Heart } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

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

export function CommentCard({ comment, postId, postAuthorUsername, onNavigate }) {
  const { currentUser } = useAuth();
  const { updateComment, deleteComment, createReply, reactToComment } = useComments();
  const { blockUser } = useReports();
  const { currentLanguage, translateText, t } = useLanguage();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  if (hidden) {
    return (
      <div className="mka-panel" style={{ padding: '12px', textAlign: 'center' }}>
        <span className="secondary-text">Comment hidden.</span>
      </div>
    );
  }

  const isOwner = currentUser?.username === comment.username;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      updateComment(comment.id, postId, editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    deleteComment(comment.id, postId);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(comment.content);
    addToast('Comment copied to clipboard.', 'info');
  };

  const handleAddReply = async (replyText) => {
    await createReply(comment.id, postId, replyText, comment.username);
    setShowReplyComposer(false);
  };

  const isAutoTranslating = currentLanguage !== 'English';
  const isTranslated = manualToggle ? !isAutoTranslating : isAutoTranslating;

  const displayContent = isTranslated ? translateText(comment.content) : comment.content;

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
    if (reactToComment) reactToComment(comment.id, key);
  };

  const handleLikeToggle = (e) => {
    if (e) e.stopPropagation();
    handleEmojiClick('❤️');
  };

  const userLiked = activeEmojis.includes('❤️');
  const reactionCount = Object.values(comment.reactions || {}).reduce((sum, count) => sum + count, 0);

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
      {/* ── FLOATING HOVER EMOJI BAR ── */}
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
        </div>
      )}

      {/* Left Avatar */}
      <button
        onClick={() => onNavigate(`/profile/${comment.username.replace('@', '')}`)}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, flexShrink: 0, marginTop: '2px' }}
      >
        <InitialAvatar username={comment.username} initials={comment.avatarInitials} size={32} />
      </button>

      {/* Middle Content Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex-col gap-xs" style={{ width: '100%' }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <div className="flex-row gap-xs justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="caption-text"
                style={{ color: 'var(--hurricane)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="caption-text bold"
                style={{ color: 'var(--deep-plum)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'inline', fontSize: '14px', lineHeight: 1.4, color: 'var(--eclipse)' }}>
            <button
              type="button"
              onClick={() => onNavigate(`/profile/${comment.username.replace('@', '')}`)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginRight: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--eclipse)',
                display: 'inline',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {comment.username}
            </button>
            {postAuthorUsername && comment.username === postAuthorUsername && (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--deep-plum)',
                backgroundColor: 'var(--deep-plum-light)',
                padding: '1px 4px',
                borderRadius: '3px',
                textTransform: 'uppercase',
                marginRight: '6px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}>
                Author
              </span>
            )}
            <span style={{ whiteSpace: 'pre-line' }}>{displayContent}</span>
          </div>
        )}

        {/* Action / Meta row below text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '12px', color: 'var(--hurricane)' }}>
          <span>{formatDate(comment.createdAt)}</span>
          
          {reactionCount > 0 && (
            <span style={{ fontWeight: 600 }}>{reactionCount} {reactionCount === 1 ? 'like' : 'likes'}</span>
          )}

          <button
            type="button"
            onClick={handleLikeToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: userLiked ? 700 : 500,
              color: userLiked ? 'var(--deep-plum)' : 'var(--hurricane)',
              padding: 0,
            }}
          >
            {userLiked ? 'Liked' : 'Like'}
          </button>

          <button
            type="button"
            onClick={() => setShowReplyComposer(!showReplyComposer)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--hurricane)',
              padding: 0,
            }}
          >
            Reply
          </button>

          <button
            onClick={() => setManualToggle(!manualToggle)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--deep-plum)',
              padding: 0,
            }}
          >
            {isTranslated ? t('showOriginal') : t('translate')}
          </button>

          {/* More options menu link inside action bar */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <CommentMenu
              isOwner={isOwner}
              onReply={() => setShowReplyComposer(!showReplyComposer)}
              onCopy={handleCopy}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              onReport={() => setReportModalOpen(true)}
              onMute={() => setHidden(true)}
              onBlock={() => blockUser(comment.username)}
            />
          </div>
        </div>

        {/* 1-Level Nested Replies List & Composer nested inside it */}
        <ReplyList
          replies={comment.replies || []}
          postId={postId}
          commentId={comment.id}
          onNavigate={onNavigate}
          showReplyComposer={showReplyComposer}
          onCancelReplyComposer={() => setShowReplyComposer(false)}
          onSubmitReply={handleAddReply}
          targetUsername={comment.username}
          onReplyTrigger={(username) => {
            setShowReplyComposer(true);
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

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="COMMENT"
        targetId={comment.id}
        postId={postId}
        reportedContent={comment.content}
        authorUsername={comment.username}
      />
    </div>
  );
}
