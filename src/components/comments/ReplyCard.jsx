import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';
import { MoreHorizontal, Edit, Trash2, Flag, Heart } from 'lucide-react';
import { Dropdown, DropdownItem } from '../common/Dropdown.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';

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

export function ReplyCard({ reply, postId, commentId, onNavigate, onReplyTrigger }) {
  const { currentUser } = useAuth();
  const { updateReply, deleteReply, reactToReply } = useComments();
  const { blockUser } = useReports();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  const displayContent = manualToggle ? (reply.originalContent || reply.content) : reply.content;
  const isTranslated = !manualToggle && Boolean(
    (reply.originalLanguage && reply.displayLanguage && reply.originalLanguage.toLowerCase() !== reply.displayLanguage.toLowerCase()) ||
    (reply.translatedContent && reply.originalContent && reply.translatedContent !== reply.originalContent)
  );

  const [activeEmojis, setActiveEmojis] = useState(() => {
    const list = [];
    const r = reply.reactions || {};
    if (r.relate > 0) list.push('❤️');
    if (r.helpful > 0) list.push('🔥');
    if (r.wellSaid > 0) list.push('👍');
    if (r.stayStrong > 0) list.push('🤝');
    if (r.madeMeThink > 0) list.push('💯');
    const userR = reply.userReaction;
    if (userR && keyMap[userR]) {
      const emoji = keyMap[userR];
      return [emoji, ...list.filter(x => x !== emoji)];
    }
    return list;
  });

  const isOwner = currentUser?.username === reply.username;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      updateReply(reply.id, postId, editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    deleteReply(reply.id, postId);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.content);
    addToast('Reply copied to clipboard.', 'info');
  };

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
    if (reactToReply) reactToReply(reply.id, commentId, postId, key);
  };

  const handleLikeToggle = (e) => {
    if (e) e.stopPropagation();
    handleEmojiClick('❤️');
  };

  const userLiked = activeEmojis.includes('❤️');
  const reactionCount = Object.values(reply.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-fade-in"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
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
            left: '32px',
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
                fontSize: '13px',
                padding: '2px 3px',
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
        onClick={() => onNavigate(`/profile/${reply.username.replace('@', '')}`)}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, flexShrink: 0, marginTop: '2px' }}
      >
        <InitialAvatar username={reply.username} initials={reply.avatarInitials} size={24} />
      </button>

      {/* Middle Inline Text Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex-col gap-xs" style={{ width: '100%' }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '13px',
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
          <div style={{ display: 'inline', fontSize: '13.5px', lineHeight: 1.4, color: 'var(--eclipse)' }}>
            <button
              type="button"
              onClick={() => onNavigate(`/profile/${reply.username.replace('@', '')}`)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginRight: '6px',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--eclipse)',
                display: 'inline',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {reply.username}
            </button>
            <span style={{ whiteSpace: 'pre-line' }}>{displayContent}</span>
          </div>
        )}

        {/* Action / Meta row below Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '11px', color: 'var(--hurricane)' }}>
          <span>{formatDate(reply.createdAt)}</span>
          
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
              fontSize: '11px',
              fontWeight: userLiked ? 700 : 500,
              color: userLiked ? 'var(--deep-plum)' : 'var(--hurricane)',
              padding: 0,
            }}
          >
            {userLiked ? 'Liked' : 'Like'}
          </button>

          <button
            type="button"
            onClick={onReplyTrigger}
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

          <button
            type="button"
            onClick={() => setManualToggle(!manualToggle)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--deep-plum)',
              padding: 0,
            }}
          >
            {isTranslated ? t('showOriginal') : t('translate')}
          </button>

          {/* More actions menu link inside action bar */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Dropdown trigger={<MoreHorizontal size={12} style={{ color: 'var(--hurricane)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} />}>
              {isOwner ? (
                <>
                  <DropdownItem icon={Edit} onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem icon={Trash2} onClick={handleDelete} danger>
                    Delete
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem icon={Flag} onClick={() => setReportModalOpen(true)} danger>
                    Report Reply
                  </DropdownItem>
                  <DropdownItem icon={Flag} onClick={() => blockUser(reply.username)} danger>
                    Block User
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>
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
            <span key={index} style={{ fontSize: '12px' }}>{emoji}</span>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="REPLY"
        targetId={reply.id}
        postId={postId}
        reportedContent={reply.content}
        authorUsername={reply.username}
      />
    </div>
  );
}
