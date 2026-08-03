import React, { useState, useEffect } from 'react';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ReactionsBar } from './ReactionsBar.jsx';
import { PostMenu } from './PostMenu.jsx';
import { Modal } from '../common/Modal.jsx';
import { MessageSquare, Bookmark, Globe, Languages, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';

export function PostCard({ post, onNavigate, onPostHover, isHoverActive = false }) {
  const { reactToPost, toggleSavePost, savedPostIds, deletePost } = usePosts();
  const { commentsByPost, fetchComments } = useComments();
  const { currentUser } = useAuth();
  const { blockUser } = useReports();
  const { currentLanguage, translateText } = useLanguage();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  if (hidden) {
    return (
      <div className="mka-card" style={{ padding: '10px 14px', background: '#F5F2F1', textAlign: 'center', borderRadius: '12px' }}>
        <span style={{ fontSize: '12px', color: '#8C8385' }}>Thought hidden.</span>
      </div>
    );
  }

  const isSaved = savedPostIds.includes(post.id);
  const isAutoTranslating = currentLanguage !== 'English' && currentLanguage !== post.language;
  const isTranslated = manualToggle ? !isAutoTranslating : isAutoTranslating;

  const displayTitle = isTranslated ? translateText(post.title) : post.title;
  const displayContent = isTranslated ? translateText(post.content) : post.content;

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
        background: isHoverActive ? '#FFFFFF' : '#FFFFFF',
        padding: '12px 14px',
        borderRadius: '14px',
        border: `1.5px solid ${isHoverActive ? '#6F405F' : '#E5E0DF'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: isHoverActive
          ? '0 6px 20px rgba(111,64,95,0.12)'
          : '0 2px 6px rgba(45,29,21,0.03)',
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
                {post.username}
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

        {/* ── ACTION BUTTONS: Translate & Options Menu ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setManualToggle(!manualToggle)}
            title={isTranslated ? 'Show original text' : `Translate to ${currentLanguage}`}
            style={{
              padding: '4px 6px',
              borderRadius: '12px',
              border: `1px solid ${isTranslated ? '#6F405F' : '#D4CECC'}`,
              background: isTranslated ? 'rgba(111,64,95,0.1)' : '#FAFAFA',
              color: isTranslated ? '#6F405F' : '#6E625F',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Languages size={12} />
            <span>Translate</span>
          </button>

          <PostMenu
            isSaved={isSaved}
            isOwner={
              Boolean(
                post.isOwnPost ||
                post.isOwner ||
                (currentUser?.id && post.userId === currentUser?.id) ||
                ((currentUser?.username || '').replace(/^@/, '').toLowerCase() === (post.username || '').replace(/^@/, '').toLowerCase()) ||
                (post.username === '@anonymous' || post.username === 'anonymous')
              )
            }
            onDelete={async () => {
              try {
                await deletePost(post.id);
              } catch (e) {
                console.error(e);
              }
            }}
            onSave={() => toggleSavePost(post.id)}
            onHide={() => setHidden(true)}
            onMute={() => setHidden(true)}
            onBlock={() => blockUser(post.username)}
            onReport={() => setReportModalOpen(true)}
          />
        </div>
      </div>

      {/* ── CONTENT SNIPPET / FULL BODY ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {displayTitle && (
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#2D1D15', margin: 0, lineHeight: 1.3 }}>
            {displayTitle}
          </h4>
        )}
        <p
          style={{
            fontSize: '12.5px',
            lineHeight: 1.4,
            color: '#4A3E3D',
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          {displayContent}
        </p>
      </div>

      {/* ── REACTIONS BAR ── */}
      <ReactionsBar
        reactions={post.reactions}
        userReaction={post.userReaction}
        onReact={(type) => reactToPost(post.id, type)}
      />

      {/* ── 1-2 COMMENT PREVIEWS INSIDE EXPANDED VIEW ── */}
      {isHoverActive && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingTop: '8px',
            borderTop: '1px solid #EDE8E6',
            marginTop: '2px',
          }}
        >
          {postComments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8C8385', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                LATEST COMMENTS ({postComments.length}):
              </div>
              {postComments.slice(0, 2).map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                  <AvatarThumbnail username={c.username} initials={c.avatarInitials} config={c.avatarConfig} size={18} />
                  <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: 700, color: '#6F405F', marginRight: '4px' }}>{c.username}:</span>
                    <span style={{ color: '#2D1D15' }}>{c.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#8C8385', marginTop: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#6F405F' }}>
              <MessageSquare size={12} /> {matchedCommentCount} Comments in discussion
            </span>
            <span style={{ fontSize: '10.5px', color: '#A09794' }}>Click to view live discussion</span>
          </div>
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
