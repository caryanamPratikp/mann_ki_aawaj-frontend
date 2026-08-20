import React, { useState, useEffect } from 'react';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ReactionsBar } from './ReactionsBar.jsx';
import { PostMenu } from './PostMenu.jsx';
import { Modal } from '../common/Modal.jsx';
import { MessageSquare, Bookmark, Globe, Languages, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';

export function PostCard({ post, onNavigate, onPostHover, isHoverActive = false, onToggleComments, activeCommentsPostId }) {
  const { reactToPost, toggleSavePost, savedPostIds, deletePost } = usePosts();
  const { commentsByPost, createComment, fetchComments } = useComments();
  const { currentUser } = useAuth();
  const { blockUser, muteUser } = useReports();
  const { currentLanguage, translateText, translateTextAsync, t } = useLanguage();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(false);

  if (hidden) {
    return (
      <div className="mka-card" style={{ padding: '10px 14px', background: '#F5F2F1', textAlign: 'center', borderRadius: '12px' }}>
        <span style={{ fontSize: '12px', color: '#8C8385' }}>Thought hidden.</span>
      </div>
    );
  }

  const [dynamicTitleTranslation, setDynamicTitleTranslation] = useState(null);
  const [dynamicContentTranslation, setDynamicContentTranslation] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const titleText = post.title || post.originalTitle;
    const contentText = post.originalContent || post.content || post.description;

    if (titleText && currentLanguage) {
      translateTextAsync(titleText, currentLanguage).then((res) => {
        if (isMounted && res) setDynamicTitleTranslation(res);
      });
    } else {
      setDynamicTitleTranslation(null);
    }

    if (contentText && currentLanguage) {
      translateTextAsync(contentText, currentLanguage).then((res) => {
        if (isMounted && res) setDynamicContentTranslation(res);
      });
    } else {
      setDynamicContentTranslation(null);
    }

    return () => { isMounted = false; };
  }, [currentLanguage, post.title, post.originalTitle, post.originalContent, post.content, post.description]);

  const isSaved = savedPostIds.includes(post.id);
  const isOwner = Boolean(
    post.isOwnPost ||
    (currentUser?.id && (post.userId === currentUser?.id || post.authorId === currentUser?.id))
  );
  const isTranslated = Boolean(
    !manualToggle && 
    (
      (dynamicTitleTranslation && dynamicTitleTranslation !== (post.originalTitle || post.title)) ||
      (dynamicContentTranslation && dynamicContentTranslation !== (post.originalContent || post.content)) ||
      post.isTranslated
    )
  );

  const displayTitle = manualToggle
    ? (post.originalTitle || post.title)
    : (dynamicTitleTranslation || post.translatedTitle || post.title || post.originalTitle);

  const displayContent = manualToggle
    ? (post.originalContent || post.content)
    : (dynamicContentTranslation || post.translatedContent || post.content || post.originalContent);

  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);

  return (
    <article
      className="post-discussion-card"
      onMouseEnter={(e) => {
        if (onPostHover) {
          const rect = e.currentTarget.getBoundingClientRect();
          onPostHover(post, Math.max(30, rect.top - 84 + 24));
        }
      }}
      style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 18px',
        borderRadius: '16px',
        border: `1.5px solid ${isHoverActive ? 'var(--deep-plum)' : '#E8E2E0'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.2s ease',
        boxShadow: isHoverActive
          ? '0 8px 24px rgba(111,64,95,0.14)'
          : '0 4px 16px rgba(45,29,21,0.06)',
      }}
    >
      {/* ── HEADER: Avatar, Username, Topic Tag, Time, Language & Translate Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/profile/${post.username.replace('@', '')}`);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
          >
            <AvatarThumbnail
              username={post.username}
              initials={post.avatarInitials}
              config={post.avatarConfig}
              size={32}
            />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(`/profile/${post.username.replace('@', '')}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#2D1D15',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {isOwner ? 'My Thoughts' : post.username}
              </button>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6F405F 0%, #8E527A 100%)',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(111,64,95,0.22)',
                  letterSpacing: '0.02em',
                }}
              >
                🏷️ {post.topic || post.postType}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8C8385' }}>
              <span>{formatDate(post.createdAt)}</span>
              {post.language && (
                <>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Globe size={10} /> {post.language}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS: Options Menu ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <PostMenu

            isSaved={isSaved}
            isOwner={isOwner}
            onDelete={async () => {
              try {
                await deletePost(post.id);
              } catch (e) {
                console.error(e);
              }
            }}
            onSave={() => toggleSavePost(post.id)}
            onHide={() => setHidden(true)}
            onMute={() => {
              muteUser(post.username);
              setHidden(true);
            }}
            onBlock={() => blockUser(post.username)}

            onReport={() => setReportModalOpen(true)}
          />
        </div>
      </div>

      {/* ── CONTENT SNIPPET / FULL BODY ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {displayTitle && (
          <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#000000', margin: 0, lineHeight: 1.3 }}>
            {displayTitle}
          </h4>
        )}
        <p
          style={{
            fontSize: '14.5px',
            lineHeight: 1.5,
            color: '#111111',
            fontWeight: 500,
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          {displayContent}
        </p>
        {post.imageUrl && (
          <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAE6E5' }}>
            <img
              src={getMediaUrl(post.imageUrl)}
              alt="Post attachment"
              style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
      </div>

      {/* ── REACTIONS & COMMENTS BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
        <ReactionsBar
          reactions={post.reactions}
          userReaction={post.userReaction}
          onReact={(type) => reactToPost(post.id, type)}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowInlineComments(!showInlineComments);
            if (onToggleComments) {
              onToggleComments(post);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: showInlineComments ? '#6F405F' : '#524644',
            backgroundColor: showInlineComments ? 'rgba(111,64,95,0.1)' : '#F6F3F2',
            border: showInlineComments ? '1.5px solid #6F405F' : '1px solid #E5E0DF',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <MessageSquare size={14} style={{ color: showInlineComments ? '#6F405F' : '#7A6E6B' }} />
          <span>{t('comments') || 'Comments'} ({matchedCommentCount})</span>
        </button>
      </div>

      {/* ── EXPANDABLE INLINE COMMENT SECTION DIRECTLY BELOW THE POST ── */}
      {showInlineComments && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '14px',
            borderTop: '1.5px solid #EAE4E4',
            marginTop: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CommentComposer
            postId={post.id}
            postAuthorUsername={post.username}
            onSubmit={async (text) => {
              await createComment(post.id, text, post.username);
            }}
            onNavigate={onNavigate}
            placeholder="Write a comment..."
          />
          <CommentList
            postId={post.id}
            postAuthorUsername={post.username}
            onNavigate={onNavigate}
          />
        </div>
      )}



      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="POST"
          targetId={post.id}
          targetUsername={post.username}
        />
      )}
    </article>
  );
}
