import React, { useState } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ReactionsBar } from './ReactionsBar.jsx';
import { PostMenu } from './PostMenu.jsx';
import { MessageSquare, Bookmark, Globe, Languages } from 'lucide-react';
import { usePosts } from '../../context/PostContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';

export function PostCard({ post, onNavigate, onPostClick }) {
  const { reactToPost, toggleSavePost, savedPostIds } = usePosts();
  const { blockUser } = useReports();
  const { currentLanguage, translateText, t } = useLanguage();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  if (hidden) {
    return (
      <div className="mka-card" style={{ padding: '16px', background: 'var(--soft-white)', textAlign: 'center' }}>
        <span className="secondary-text">Post hidden from your feed.</span>
      </div>
    );
  }

  const isSaved = savedPostIds.includes(post.id);

  // Automatic real-time translation if active navbar language differs or if manually toggled
  const isAutoTranslating = currentLanguage !== 'English' && currentLanguage !== post.language;
  const isTranslated = manualToggle ? !isAutoTranslating : isAutoTranslating;

  const displayTitle = isTranslated ? translateText(post.title) : post.title;
  const displayContent = isTranslated ? translateText(post.content) : post.content;

  return (
    <article
      className="mka-card mka-card-interactive flex-col gap-md animate-fade-in"
      onClick={() => {
        if (onPostClick) onPostClick(post.id);
        else onNavigate(`/post/${post.id}`);
      }}
      style={{ cursor: 'pointer', background: 'var(--pure-white)' }}
    >
      {/* Post Header */}
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/profile/${post.username.replace('@', '')}`);
            }}
          >
            <InitialAvatar username={post.username} initials={post.avatarInitials} size={40} />
          </button>

          <div className="flex-col">
            <div className="flex-row items-center gap-xs">
              <span className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                {post.username}
              </span>
              <span className="badge badge-plum">{post.postType}</span>
            </div>
            <div className="flex-row items-center gap-xs caption-text">
              <span>{post.topic}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
              {post.language && (
                <>
                  <span>•</span>
                  <span className="flex-row items-center gap-xs">
                    <Globe size={11} /> {post.language}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-row items-center gap-xs" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setManualToggle(!manualToggle)}
            className="flex-row items-center gap-xs badge badge-neutral"
            style={{ fontSize: '12px', cursor: 'pointer' }}
          >
            <Languages size={13} style={{ color: 'var(--deep-plum)' }} />
            <span>{isTranslated ? t('showOriginal') : `${t('translate')} (${currentLanguage})`}</span>
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

      {/* Post Title & Text */}
      <div className="flex-col gap-xs">
        {displayTitle && (
          <h2 className="card-heading" style={{ fontSize: '19px', color: 'var(--eclipse)' }}>
            {displayTitle}
          </h2>
        )}
        <p
          className="body-text"
          style={{
            whiteSpace: 'pre-line',
            color: 'var(--eclipse)',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayContent}
        </p>
      </div>

      {/* Optional Post Image */}
      {post.imageUrl && (
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '360px' }}>
          <img src={post.imageUrl} alt="Post Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Reactions Bar & Actions */}
      <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--swiss-coffee)', paddingTop: '12px' }}>
        <ReactionsBar
          reactions={post.reactions}
          userReaction={post.userReaction}
          onReact={(type) => reactToPost(post.id, type)}
          compact
        />

        <div className="flex-row justify-between items-center" style={{ marginTop: '4px' }}>
          <div className="flex-row items-center gap-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/post/${post.id}`);
              }}
              className="flex-row items-center gap-xs secondary-text"
              style={{ fontSize: '13px' }}
            >
              <MessageSquare size={16} />
              <span>{post.commentCount || 0} {t('comments')}</span>
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavePost(post.id);
            }}
            className="flex-row items-center gap-xs secondary-text"
            style={{ fontSize: '13px', color: isSaved ? 'var(--deep-plum)' : 'var(--hurricane)' }}
          >
            <Bookmark size={16} style={{ fill: isSaved ? 'var(--deep-plum)' : 'none' }} />
            <span>{isSaved ? 'Saved' : t('save')}</span>
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
