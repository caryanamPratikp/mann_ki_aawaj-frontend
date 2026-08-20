import React from 'react';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { MessageSquare, X } from 'lucide-react';

export function SleekCommentSidePanel({ post, onClose, onNavigate }) {
  const { commentsByPost, createComment } = useComments();
  const { t } = useLanguage();

  if (!post) return null;

  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);

  const displayTitle = post.originalTitle || post.title || 'Discussion';

  return (
    <aside
      className="animate-fade-in"
      style={{
        width: '360px',
        maxWidth: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EDE8E6',
        boxShadow: '0 4px 24px rgba(45,29,21,0.08)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'sticky',
        top: '84px',
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      {/* ── HEADER: Title & Close Button ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '10px',
          borderBottom: '1px solid #EDE8E6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={16} style={{ color: '#6F405F' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
            {t('comments') || 'Comments'} ({matchedCommentCount})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#8C8385',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close Comments"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── POST PREVIEW BADGE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '10px',
          backgroundColor: '#FAF7F6',
          border: '1px solid #EFEAE8',
        }}
      >
        <AvatarThumbnail username={post.username} initials={post.avatarInitials} size={24} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', display: 'block' }}>
            {post.username}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: '#2D1D15',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {displayTitle}
          </span>
        </div>
      </div>

      {/* ── COMPACT COMMENT COMPOSER ── */}
      <CommentComposer
        postId={post.id}
        postAuthorUsername={post.username}
        onSubmit={async (text) => {
          await createComment(post.id, text, post.username);
        }}
        onNavigate={onNavigate}
        placeholder="Write a comment..."
      />

      {/* ── COMMENT LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CommentList
          postId={post.id}
          postAuthorUsername={post.username}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}
