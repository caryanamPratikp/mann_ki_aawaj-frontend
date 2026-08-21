import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { SleekCommentSidePanel } from '../../components/posts/SleekCommentSidePanel.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { FileText, PlusCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function MyPostsPage({ onNavigate }) {
  const { posts, refreshPosts, loading } = usePosts();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);

  // Trigger API fetch on mount
  useEffect(() => {
    if (refreshPosts) {
      refreshPosts();
    }
  }, [refreshPosts]);

  // Get active username handle from currentUser or user-scoped profile
  let activeUsername = currentUser?.username || '';
  if (!activeUsername && currentUser?.id) {
    try {
      const stored = localStorage.getItem(`user_profile_${currentUser.id}`) || localStorage.getItem('user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        activeUsername = parsed?.username || '';
      }
    } catch (e) { /* fallback */ }
  }

  const cleanActive = (activeUsername || '').replace(/^@/, '').toLowerCase();
  const currentUserId = currentUser?.id || currentUser?.userId;

  // Filter posts created strictly by current user (by isOwnPost, ID, or handle match)
  const myPosts = posts.filter((p) => {
    if (!currentUser) return false;
    if (p.isOwnPost) return true;
    const postUserId = p.userId || p.authorId;
    if (currentUserId && postUserId && String(postUserId) === String(currentUserId)) {
      return true;
    }
    const postUname = (p.username || p.authorUsername || p.handle || '').replace(/^@/, '').toLowerCase();
    const cleanAuthUname = (currentUser?.username || '').replace(/^@/, '').toLowerCase();
    return Boolean(
      (cleanActive && postUname && postUname === cleanActive) ||
      (cleanAuthUname && postUname && postUname === cleanAuthUname)
    );
  });

  const handleToggleComments = (post) => {
    if (activeCommentsPost && activeCommentsPost.id === post.id) {
      setActiveCommentsPost(null);
    } else {
      setActiveCommentsPost(post);
    }
  };

  return (
    <UserLayout activeRoute="/my-posts" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 className="page-heading">{t('myPosts', 'My Thoughts')} ({myPosts.length})</h1>
            <p className="secondary-text">{t('manageThoughtsDesc', 'Manage your published thoughts, confessions, and questions.')}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/home?create=true')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: '#6F405F',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PlusCircle size={15} /> {t('createThought', '+ Create Thought')}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8C8385' }}>
            <Loader2 size={24} className="spin-animation" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <span>{t('loadingThoughts', 'Loading your published thoughts...')}</span>
          </div>
        ) : myPosts.length === 0 ? (
          <EmptyState
            title={t('noPostsYet', 'No Published Posts Yet')}
            description={t('noPostsDesc', "You haven't written any posts under this anonymous handle yet.")}
            icon={FileText}
            actionText={t('createThought', '+ Create Thought')}
            onAction={() => onNavigate('/home?create=true')}
          />
        ) : (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* ── LEFT/MAIN COLUMN: POSTS LIST ── */}
            <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{ ...post, isOwnPost: true }}
                  onNavigate={onNavigate}
                  onToggleComments={handleToggleComments}
                  activeCommentsPostId={activeCommentsPost?.id}
                />
              ))}
            </div>

            {/* ── RIGHT COLUMN: SLEEK MINIMALISTIC COMMENTS SIDE PANEL ── */}
            {activeCommentsPost && (
              <SleekCommentSidePanel
                post={activeCommentsPost}
                onClose={() => setActiveCommentsPost(null)}
                onNavigate={onNavigate}
              />
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
