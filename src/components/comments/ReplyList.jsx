import React, { useState } from 'react';
import { ReplyCard } from './ReplyCard.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ReplyList({ replies = [], postId, commentId, onNavigate }) {
  const [showReplies, setShowReplies] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  if (!replies || replies.length === 0) return null;

  const visibleReplies = replies.slice(0, visibleCount);
  const hasMore = replies.length > visibleCount;

  return (
    <div className="flex-col gap-sm" style={{ marginTop: '10px', paddingLeft: '20px' }}>
      <div className="flex-row items-center gap-xs">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex-row items-center gap-xs secondary-text"
          style={{ fontSize: '13px', fontWeight: 500, color: 'var(--deep-plum)' }}
        >
          {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>
            {showReplies ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
          </span>
        </button>
      </div>

      {showReplies && (
        <div className="flex-col gap-sm">
          {visibleReplies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              postId={postId}
              commentId={commentId}
              onNavigate={onNavigate}
            />
          ))}

          {hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="secondary-text"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--deep-plum)', textAlign: 'left', marginTop: '4px' }}
            >
              Load more replies ({replies.length - visibleCount} remaining)...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
