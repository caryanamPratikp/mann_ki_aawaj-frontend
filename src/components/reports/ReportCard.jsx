import React from 'react';
import { ReportStatusBadge } from './ReportStatusBadge.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { ShieldAlert, ChevronRight } from 'lucide-react';

export function ReportCard({ report, onClick }) {
  return (
    <div
      className="mka-card mka-card-interactive flex-col gap-sm animate-fade-in"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', padding: '16px' }}
    >
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <ShieldAlert size={18} style={{ color: 'var(--deep-plum)' }} />
          <span className="bold" style={{ fontSize: '15px' }}>
            {report.id}
          </span>
          <span className="badge badge-neutral">{report.contentType}</span>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="flex-col gap-xs">
        <div className="flex-row items-center gap-xs caption-text">
          <span>Reason: <strong style={{ color: 'var(--eclipse)' }}>{report.reason}</strong></span>
          <span>•</span>
          <span>Submitted {formatDate(report.createdAt)}</span>
        </div>

        {report.reportedContent && (
          <p className="secondary-text" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            "{report.reportedContent.slice(0, 120)}{report.reportedContent.length > 120 ? '...' : ''}"
          </p>
        )}
      </div>

      {report.adminNotes && (
        <div className="mka-panel" style={{ padding: '8px 12px', background: 'var(--soft-white)' }}>
          <span className="caption-text bold" style={{ color: 'var(--deep-plum)' }}>Moderator Note:</span>
          <p className="caption-text">{report.adminNotes}</p>
        </div>
      )}

      {onClick && (
        <div className="flex-row justify-between items-center" style={{ borderTop: '1px solid var(--swiss-coffee)', paddingTop: '8px', marginTop: '4px' }}>
          <span className="caption-text" style={{ color: 'var(--deep-plum)', fontWeight: 500 }}>View Report Details</span>
          <ChevronRight size={16} style={{ color: 'var(--hurricane)' }} />
        </div>
      )}
    </div>
  );
}
