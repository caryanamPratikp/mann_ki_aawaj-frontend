import React from 'react';
import { ReportStatusBadge } from '../reports/ReportStatusBadge.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../common/Button.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function AdminReportDetails({ report, onBack, onActionClick }) {
  if (!report) return null;

  return (
    <div className="flex-col gap-md animate-fade-in">
      <div className="flex-row items-center gap-md">
        <Button variant="secondary" size="sm" onClick={onBack} icon={ArrowLeft}>
          Back to Reports
        </Button>
        <h2 className="page-heading">Report Details: {report.id}</h2>
      </div>

      <div className="mka-card flex-col gap-md">
        <div className="flex-row justify-between items-center border-b" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex-row items-center gap-sm">
            <span className="badge badge-plum">{report.contentType}</span>
            <ReportStatusBadge status={report.status} />
          </div>
          <span className="caption-text">Submitted: {formatDate(report.createdAt)}</span>
        </div>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="mka-panel">
            <span className="caption-text bold">Reported Author:</span>
            <p className="bold" style={{ color: 'var(--eclipse)', marginTop: '4px' }}>{report.authorUsername}</p>
          </div>
          <div className="mka-panel">
            <span className="caption-text bold">Reporter (Visible Only to Admin):</span>
            <p className="bold" style={{ color: 'var(--deep-plum)', marginTop: '4px' }}>{report.reporterUsername}</p>
          </div>
          <div className="mka-panel">
            <span className="caption-text bold">Report Reason & Risk:</span>
            <p style={{ marginTop: '4px', fontSize: '14px' }}>
              <strong>{report.reason}</strong> (Risk: <span style={{ color: 'var(--error)' }}>{report.riskLevel}</span>)
            </p>
          </div>
        </div>

        <div className="mka-panel flex-col gap-xs">
          <span className="caption-text bold">Reported Content:</span>
          <p className="body-text" style={{ background: 'var(--pure-white)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            {report.reportedContent || '[No content text]'}
          </p>
        </div>

        {report.explanation && (
          <div className="mka-panel flex-col gap-xs">
            <span className="caption-text bold">Reporter Explanation:</span>
            <p className="secondary-text">{report.explanation}</p>
          </div>
        )}

        {report.adminAction && (
          <div className="mka-panel flex-col gap-xs" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
            <span className="caption-text bold" style={{ color: 'var(--success)' }}>Action Applied:</span>
            <p className="body-text" style={{ fontWeight: 600 }}>{report.adminAction}</p>
            {report.adminNotes && <p className="caption-text">Notes: {report.adminNotes}</p>}
          </div>
        )}

        <div className="flex-row justify-end gap-md" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <Button variant="danger" onClick={() => onActionClick(report)} icon={ShieldAlert}>
            Take Moderation Action
          </Button>
        </div>
      </div>
    </div>
  );
}
