import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileText, PlusSquare } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function MyPostsPage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();

  const myPosts = posts.filter((p) => p.userId === currentUser?.id || p.username === currentUser?.username);

  return (
    <UserLayout activeRoute="/my-posts" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">My Published Posts</h1>
          <p className="secondary-text">Manage your published thoughts, confessions, and questions.</p>
        </div>

        {myPosts.length === 0 ? (
          <EmptyState
            title="No Published Posts Yet"
            description="You haven't written any posts under this anonymous handle yet."
            icon={FileText}
            actionText="Write a Post"
            onAction={() => onNavigate('/create-post')}
          />
        ) : (
          <div className="flex-col gap-md">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
