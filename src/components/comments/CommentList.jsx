import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard.jsx';
import { CommentSort } from './CommentSort.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { MessageSquare } from 'lucide-react';

export function CommentList({ postId, postAuthorUsername, onNavigate }) {
  const { commentsByPost, fetchComments } = useComments();
  const [sortBy, setSortBy] = useState('Latest');

  useEffect(() => {
    fetchComments(postId, sortBy);
  }, [postId, sortBy, fetchComments]);

  const rawComments = commentsByPost[postId] || [];
  const comments = [...rawComments].sort((a, b) => {
    if (sortBy === 'Latest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0;
  });

  return (
    <div className="flex-col gap-md" style={{ marginTop: '20px' }}>
      <div className="flex-row justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
        <h3 className="card-heading" style={{ fontSize: '18px' }}>
          Comments ({comments.length})
        </h3>
        <CommentSort
          currentSort={sortBy}
          onSortChange={(newSort) => {
            setSortBy(newSort);
            fetchComments(postId, newSort);
          }}
        />
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Be the first to share a respectful thought or add to the conversation."
          icon={MessageSquare}
        />
      ) : (
        <div className="flex-col gap-md">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorUsername={postAuthorUsername}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
