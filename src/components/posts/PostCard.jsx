import React, { useState, useEffect } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ReactionsBar } from './ReactionsBar.jsx';
import { PostMenu } from './PostMenu.jsx';
import { MessageSquare, Bookmark, Globe, Languages } from 'lucide-react';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';

export function PostCard({ post, onNavigate, onPostHover, isHoverActive = false }) {
  const { reactToPost, toggleSavePost, savedPostIds } = usePosts();
  const { commentsByPost, fetchComments } = useComments();
  const { blockUser } = useReports();
  const { currentLanguage, translateText } = useLanguage();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  useEffect(() => {
    if (post?.id) {
      fetchComments(post.id, 'Latest');
    }
  }, [post?.id, fetchComments]);

  if (hidden) {
    return (
      <div className="mka-card" style={{ padding: '12px 16px', background: '#F5F2F1', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: '#8C8385' }}>Post hidden from feed.</span>
      </div>
    );
  }

  const isSaved = savedPostIds.includes(post.id);
  const isAutoTranslating = currentLanguage !== 'English' && currentLanguage !== post.language;
  const isTranslated = manualToggle ? !isAutoTranslating : isAutoTranslating;

  const displayTitle = isTranslated ? translateText(post.title) : post.title;
  const displayContent = isTranslated ? translateText(post.content) : post.content;

  // Real-time matched comment count
  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);

  return (
    <article
      className="post-discussion-card"
      onMouseEnter={(e) => {
        if (onPostHover) {
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeTop = rect.top - 84;
          onPostHover(post, Math.max(30, relativeTop + 24));
        }
      }}
      style={{
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        border: `1.5px solid ${isHoverActive ? '#6F405F' : '#9F9794'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: isHoverActive
          ? '0 6px 24px rgba(111,64,95,0.12), 0 2px 6px rgba(0,0,0,0.06)'
          : '0 2px 8px rgba(45,29,21,0.04)',
        transform: isHoverActive ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* ── POST HEADER (Avatar, Username, Category/Topic, Timestamp) ── */}
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/profile/${post.username.replace('@', '')}`);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <InitialAvatar username={post.username} initials={post.avatarInitials} size={34} />
          </button>

          <div className="flex-col" style={{ gap: '1px' }}>
            <div className="flex-row items-center gap-xs">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#2D1D15' }}>
                {post.username}
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(111,64,95,0.10)',
                  color: '#6F405F',
                }}
              >
                {post.topic || post.postType}
              </span>
            </div>
            <div className="flex-row items-center gap-xs" style={{ fontSize: '11.5px', color: '#8C8385' }}>
              <span>{formatDate(post.createdAt)}</span>
              {post.language && (
                <>
                  <span>•</span>
                  <span className="flex-row items-center gap-xs">
                    <Globe size={10} /> {post.language}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex-row items-center gap-xs" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setManualToggle(!manualToggle)}
            title={isTranslated ? 'Show original text' : `Translate to ${currentLanguage}`}
            style={{
              padding: '5px 7px',
              borderRadius: '50%',
              border: `1px solid ${isTranslated ? '#6F405F' : '#9F9794'}`,
              background: isTranslated ? 'rgba(111,64,95,0.1)' : 'transparent',
              color: isTranslated ? '#6F405F' : '#8C8385',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Languages size={14} />
          </button>

          <PostMenu
            isSaved={isSaved}
            onSave={() => toggleSavePost(post.id)}
            onHide={() => setHidden(true)}
            onMute={() => setHidden(true)}
            onBlock={() => blockUser(post.username)}
            onReport={() => setReportModalOpen(true)}
          />
        </div>
      </div>

      {/* ── POST BODY CONTENT ── */}
      <div className="flex-col" style={{ gap: '4px' }}>
        {displayTitle && (
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#2D1D15', margin: 0, lineHeight: 1.3 }}>
            {displayTitle}
          </h2>
        )}
        <p
          style={{
            fontSize: '13.5px',
            lineHeight: 1.45,
            color: '#2D1D15',
            margin: 0,
            whiteSpace: 'pre-line',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayContent}
        </p>
      </div>

      {/* Optional Image */}
      {post.imageUrl && (
        <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '220px', marginTop: '2px' }}>
          <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* ── POST REACTIONS & ACTION BAR (WITH REAL-TIME MATCHED COMMENT COUNT) ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid #E1DCDB',
          paddingTop: '10px',
          marginTop: '4px',
        }}
      >
        <ReactionsBar
          reactions={post.reactions}
          userReaction={post.userReaction}
          onReact={(type) => reactToPost(post.id, type)}
          compact
        />

        <div className="flex-row justify-between items-center" style={{ paddingTop: '2px' }}>
          <span
            className="flex-row items-center gap-xs"
            style={{ fontSize: '12.5px', color: '#6F405F', fontWeight: 600 }}
          >
            <MessageSquare size={14} />
            <span>{matchedCommentCount} Comments</span>
          </span>

          <button
            type="button"
            onClick={() => toggleSavePost(post.id)}
            className="flex-row items-center gap-xs"
            style={{
              fontSize: '12.5px',
              color: isSaved ? '#6F405F' : '#8C8385',
              fontWeight: isSaved ? 600 : 400,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Bookmark size={14} style={{ fill: isSaved ? '#6F405F' : 'none' }} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="POST"
        targetId={post.id}
        postId={post.id}
        reportedContent={post.content}
        authorUsername={post.username}
      />
    </article>
  );
}
