import React, { useState, useEffect } from 'react';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { MessageSquare, X } from 'lucide-react';

export function SleekCommentSidePanel({ post, onClose, onNavigate }) {
  const { commentsByPost, createComment } = useComments();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!post) return null;

  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);
  const displayTitle = post.originalTitle || post.title || 'Discussion';

  // Desktop side panel content & mobile slide-up sheet
  const panelContent = (
    <aside
      className="animate-fade-in sleek-comment-panel"
      style={
        isMobile
          ? {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              maxHeight: '82vh',
              height: '82vh',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -8px 32px rgba(45,29,21,0.25)',
              padding: '16px 16px 24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 1100,
              overflowY: 'auto',
            }
          : {
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
            }
      }
    >
      {/* Mobile Drawer Pull Indicator Handle */}
      {isMobile && (
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#D4CECC',
            alignSelf: 'center',
            marginBottom: '4px',
          }}
        />
      )}

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
            background: '#F5F2F0',
            border: 'none',
            color: '#2D1D15',
            cursor: 'pointer',
            padding: '6px',
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

  if (isMobile) {
    return (
      <>
        {/* Semi-transparent Backdrop for Mobile Overlay */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1099,
          }}
        />
        {panelContent}
      </>
    );
  }

  return panelContent;
}
