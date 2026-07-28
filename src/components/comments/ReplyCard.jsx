import React, { useState } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { CommentReactions } from './CommentReactions.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';
import { MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';
import { Dropdown, DropdownItem } from '../common/Dropdown.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function ReplyCard({ reply, postId, commentId, onNavigate }) {
  const { currentUser } = useAuth();
  const { updateReply, deleteReply, reactToReply } = useComments();
  const { blockUser } = useReports();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [reportModalOpen, setReportModalOpen] = useState(false);

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

  return (
    <div
      className="flex-col gap-xs animate-fade-in"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--soft-white)',
        borderLeft: '2px solid var(--deep-plum)',
        fontSize: '14px',
      }}
    >
      {/* Reply Header */}
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-xs">
          <button
            onClick={() => onNavigate(`/profile/${reply.username.replace('@', '')}`)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <InitialAvatar username={reply.username} initials={reply.avatarInitials} size={28} />
          </button>
          <span className="bold" style={{ fontSize: '13px', color: 'var(--eclipse)' }}>
            {reply.username}
          </span>
          <span className="caption-text">• {formatDate(reply.createdAt)}</span>
          {reply.isEdited && <span className="caption-text">(edited)</span>}
        </div>

        <Dropdown trigger={<MoreHorizontal size={16} style={{ color: 'var(--hurricane)' }} />}>
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

      {/* Reply Body */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex-col gap-xs" style={{ marginTop: '6px' }}>
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
              Save Edit
            </button>
          </div>
        </form>
      ) : (
        <p className="body-text" style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>
          {reply.content}
        </p>
      )}

      {/* Reactions Bar */}
      <div style={{ marginTop: '4px' }}>
        <CommentReactions
          reactions={reply.reactions}
          userReaction={reply.userReaction}
          onReact={(type) => reactToReply(reply.id, postId, type)}
        />
      </div>

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
