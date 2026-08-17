import React, { useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, PlusCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function MyPostsPage({ onNavigate }) {
  const { posts, refreshPosts, loading } = usePosts();
  const { currentUser } = useAuth();

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

  // Filter posts created strictly by current user (by ID or handle match)
  const myPosts = posts.filter((p) => {
    if (!currentUser) return false;
    const postUserId = p.userId || p.authorId;
    if (currentUserId && postUserId && String(postUserId) === String(currentUserId)) {
      return true;
    }
    const postUname = (p.username || '').replace(/^@/, '').toLowerCase();
    return Boolean(cleanActive && postUname && postUname === cleanActive);
  });

  return (
    <UserLayout activeRoute="/my-posts" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 className="page-heading">My Thoughts ({myPosts.length})</h1>
            <p className="secondary-text">Manage your published thoughts, confessions, and questions.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/home')}
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
            <PlusCircle size={15} /> Write New Thought
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8C8385' }}>
            <Loader2 size={24} className="spin-animation" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <span>Loading your published thoughts...</span>
          </div>
        ) : myPosts.length === 0 ? (
          <EmptyState
            title="No Published Posts Yet"
            description="You haven't written any posts under this anonymous handle yet."
            icon={FileText}
            actionText="Write a Thought"
            onAction={() => onNavigate('/home')}
          />
        ) : (
          <div className="flex-col gap-md">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={{ ...post, isOwnPost: true }} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
