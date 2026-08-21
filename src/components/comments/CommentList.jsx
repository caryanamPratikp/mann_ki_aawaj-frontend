import React, { useState, useEffect, useRef } from 'react';
import { CommentCard } from './CommentCard.jsx';
import { CommentSort } from './CommentSort.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { MessageSquare } from 'lucide-react';

export function CommentList({ postId, postAuthorUsername, onNavigate }) {
  const { commentsByPost, fetchComments } = useComments();
  const [sortBy, setSortBy] = useState('Latest');
  const commentsEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchComments(postId, sortBy);
  }, [postId, sortBy, fetchComments]);

  const rawComments = commentsByPost[postId] || commentsByPost[String(postId)] || commentsByPost[Number(postId)] || [];
  
  // Chat-style sorting: Oldest at top, Newest at bottom (so new comments appear at the bottom above the input box)
  const comments = [...rawComments].sort((a, b) => {
    if (sortBy === 'Latest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Auto-scroll to bottom on new comments or initial load
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  return (
    <div className="flex-col gap-sm" style={{ marginTop: '6px' }}>
      {comments.length > 0 && (
        <div className="flex-row justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '8px' }}>
          <h3 className="card-heading" style={{ fontSize: '13px', fontWeight: 700, color: '#6F405F' }}>
            💬 Comments ({comments.length})
          </h3>
          <CommentSort
            currentSort={sortBy}
            onSortChange={(newSort) => {
              setSortBy(newSort);
              fetchComments(postId, newSort);
            }}
          />
        </div>
      )}

      {comments.length === 0 ? (
        <div
          style={{
            padding: '10px 14px',
            fontSize: '12px',
            color: '#8C8385',
            textAlign: 'center',
            background: '#FAF8F7',
            borderRadius: '10px',
            border: '1px dashed #E5DFDE',
            margin: '4px 0',
          }}
        >
          <span>No comments yet. Be the first to share your thoughts below! 👇</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-col gap-md hide-scrollbar"
          style={{
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorUsername={postAuthorUsername}
              onNavigate={onNavigate}
            />
          ))}
          <div ref={commentsEndRef} />
        </div>
      )}
    </div>
  );
}
