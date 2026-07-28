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
import { Reply, Languages } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

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

  // Automatic real-time translation if active navbar language differs
  const isAutoTranslating = currentLanguage !== 'English';
  const isTranslated = manualToggle ? !isAutoTranslating : isAutoTranslating;

  const displayContent = isTranslated ? translateText(comment.content) : comment.content;

  return (
    <div
      className="mka-panel flex-col gap-sm animate-fade-in"
      style={{
        background: 'var(--pure-white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        padding: '14px 16px',
      }}
    >
      {/* Comment Header */}
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <button onClick={() => onNavigate(`/profile/${comment.username.replace('@', '')}`)}>
            <InitialAvatar username={comment.username} initials={comment.avatarInitials} size={32} />
          </button>
          <div className="flex-col">
            <div className="flex-row items-center gap-xs">
              <span className="bold" style={{ fontSize: '14px', color: 'var(--eclipse)' }}>
                {comment.username}
              </span>
              {comment.isEdited && <span className="caption-text">(edited)</span>}
            </div>
            <span className="caption-text">{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        <div className="flex-row items-center gap-xs">
          <button
            onClick={() => setManualToggle(!manualToggle)}
            className="caption-text flex-row items-center gap-xs"
            style={{ color: 'var(--deep-plum)', fontWeight: 500 }}
          >
            <Languages size={12} />
            <span>{isTranslated ? t('showOriginal') : t('translate')}</span>
          </button>

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

      {/* Comment Text / Edit form */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex-col gap-xs" style={{ marginTop: '6px' }}>
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
            }}
          />
          <div className="flex-row gap-xs justify-between">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="caption-text"
              style={{ color: 'var(--hurricane)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="caption-text bold"
              style={{ color: 'var(--deep-plum)' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <p className="body-text" style={{ fontSize: '15px', whiteSpace: 'pre-line' }}>
          {displayContent}
        </p>
      )}

      {/* Reactions Bar & Reply Trigger */}
      <div className="flex-row justify-between items-center flex-wrap gap-xs" style={{ marginTop: '4px' }}>
        <CommentReactions
          reactions={comment.reactions}
          userReaction={comment.userReaction}
          onReact={(type) => reactToComment(comment.id, postId, type)}
        />

        <button
          onClick={() => setShowReplyComposer(!showReplyComposer)}
          className="flex-row items-center gap-xs secondary-text"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <Reply size={14} />
          <span>{t('reply')}</span>
        </button>
      </div>

      {/* Reply Composer if open */}
      {showReplyComposer && (
        <ReplyComposer
          commentId={comment.id}
          postId={postId}
          onSubmit={handleAddReply}
          onCancel={() => setShowReplyComposer(false)}
        />
      )}

      {/* 1-Level Nested Replies List */}
      <ReplyList
        replies={comment.replies || []}
        postId={postId}
        commentId={comment.id}
        onNavigate={onNavigate}
      />

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
