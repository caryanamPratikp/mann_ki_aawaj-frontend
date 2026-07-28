import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { ContentReviewCard } from '../../components/admin/ContentReviewCard.jsx';
import { mockModerationService } from '../../services/mockModerationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { FileCheck } from 'lucide-react';

export function AdminContentReviewPage({ onNavigate }) {
  const { addToast } = useToast();
  const [heldQueue, setHeldQueue] = useState(() => mockModerationService.getHeldContentQueue());

  const refreshQueue = () => {
    setHeldQueue(mockModerationService.getHeldContentQueue());
  };

  const handleApprove = (contentType, contentId) => {
    mockModerationService.approveContent(contentType, contentId);
    addToast(`${contentType} approved and published.`, 'success');
    refreshQueue();
  };

  const handleReject = (contentType, contentId, reason) => {
    mockModerationService.rejectContent(contentType, contentId, reason);
    addToast(`${contentType} rejected and removed.`, 'warning');
    refreshQueue();
  };

  return (
    <AdminLayout activeRoute="/admin/content-review" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">Content Review Queue</h1>
          <p className="secondary-text">Review posts, comments, and replies held in PENDING_REVIEW state before public display.</p>
        </div>

        {heldQueue.length === 0 ? (
          <EmptyState
            title="Content Queue Clear"
            description="There are currently no posts, comments, or replies held for moderator review."
            icon={FileCheck}
          />
        ) : (
          <div className="flex-col gap-md">
            {heldQueue.map((item) => (
              <ContentReviewCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
