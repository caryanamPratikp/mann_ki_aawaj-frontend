import React from 'react';
import { Button } from '../common/Button.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { CheckCircle, XCircle } from 'lucide-react';

export function ContentReviewCard({ item, onApprove, onReject }) {
  return (
    <div className="mka-card flex-col gap-sm animate-fade-in" style={{ borderLeft: '4px solid var(--warning)' }}>
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-xs">
          <span className="badge badge-warning">{item.contentType} HELD FOR REVIEW</span>
          <span className="caption-text">• {formatDate(item.createdAt)}</span>
        </div>
        <span className="caption-text bold">Author: {item.username}</span>
      </div>

      <div className="mka-panel">
        <p className="body-text" style={{ fontSize: '15px' }}>
          {item.title && <strong style={{ display: 'block', marginBottom: '4px' }}>{item.title}</strong>}
          {item.content}
        </p>
      </div>

      {item.moderationCategory && (
        <div className="caption-text" style={{ color: 'var(--warning)', fontWeight: 500 }}>
          Flagged Category: {item.moderationCategory} (Risk: {item.moderationRisk || 'MEDIUM'})
        </div>
      )}

      <div className="flex-row justify-end gap-sm" style={{ borderTop: '1px solid var(--swiss-coffee)', paddingTop: '10px' }}>
        <Button variant="secondary" size="sm" onClick={() => onReject(item.contentType, item.id, 'Violates safety guidelines')} icon={XCircle}>
          Reject & Remove
        </Button>
        <Button variant="primary" size="sm" onClick={() => onApprove(item.contentType, item.id)} icon={CheckCircle}>
          Approve & Publish
        </Button>
      </div>
    </div>
  );
}
