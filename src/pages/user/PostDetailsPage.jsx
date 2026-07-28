import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { CommentComposer } from '../../components/comments/CommentComposer.jsx';
import { CommentList } from '../../components/comments/CommentList.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function PostDetailsPage({ postId, onNavigate }) {
  const { posts } = usePosts();
  const { createComment } = useComments();

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <UserLayout activeRoute={`/post/${postId}`} onNavigate={onNavigate}>
        <div className="flex-col gap-md">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/home')} icon={ArrowLeft}>
            Back to Feed
          </Button>
          <EmptyState
            title="Post Not Found"
            description="The post you are looking for may have been removed or does not exist."
            actionText="Go to Home Feed"
            onAction={() => onNavigate('/home')}
          />
        </div>
      </UserLayout>
    );
  }

  const handleAddComment = async (commentText) => {
    await createComment(post.id, commentText, post.username);
  };

  return (
    <UserLayout activeRoute={`/post/${postId}`} onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/home')} icon={ArrowLeft}>
            Back to Feed
          </Button>
        </div>

        {/* Full Main Post */}
        <PostCard post={post} onNavigate={onNavigate} />

        {/* Comment Section Header */}
        <div className="flex-col gap-sm" style={{ marginTop: '12px' }}>
          <h3 className="section-heading" style={{ fontSize: '24px' }}>
            Conversation
          </h3>

          {post.allowComments !== false ? (
            <CommentComposer
              postId={post.id}
              postAuthorUsername={post.username}
              onSubmit={handleAddComment}
              onNavigate={onNavigate}
              placeholder="Write a respectful comment..."
            />
          ) : (
            <div className="mka-card p-md secondary-text text-center">
              Comments have been disabled by the author for this post.
            </div>
          )}

          {/* Comment List */}
          <CommentList
            postId={post.id}
            postAuthorUsername={post.username}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </UserLayout>
  );
}
