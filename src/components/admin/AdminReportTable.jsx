import React from 'react';
import { ReportStatusBadge } from '../reports/ReportStatusBadge.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { Button } from '../common/Button.jsx';
import { Eye, ShieldAlert } from 'lucide-react';

export function AdminReportTable({ reports = [], onSelectReport, onActionClick }) {
  if (!reports.length) {
    return (
      <div className="mka-card p-lg text-center secondary-text" style={{ padding: '32px' }}>
        No reports found for the selected filter.
      </div>
    );
  }

  return (
    <div className="mka-card" style={{ overflowX: 'auto', padding: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: 'var(--soft-white)', borderBottom: '1px solid var(--border-light)' }}>
            <th style={{ padding: '12px 16px' }}>Report ID</th>
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Reported Content</th>
            <th style={{ padding: '12px 16px' }}>Author</th>
            <th style={{ padding: '12px 16px' }}>Reporter (Admin)</th>
            <th style={{ padding: '12px 16px' }}>Reason</th>
            <th style={{ padding: '12px 16px' }}>Risk</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} style={{ borderBottom: '1px solid var(--swiss-coffee)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>{report.reportId || `#${report.id}`}</td>
              <td style={{ padding: '12px 16px' }}>
                <span className="badge badge-neutral">{report.contentType}</span>
              </td>
              <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {report.reportedContent || report.description || `Item #${report.contentId}`}
                </div>
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 500 }}>{report.authorUsername || 'Member'}</td>
              <td style={{ padding: '12px 16px', color: 'var(--hurricane)', fontSize: '13px' }}>
                {report.reporterUsername || 'Member'}
              </td>
              <td style={{ padding: '12px 16px' }}>{report.reason}</td>
              <td style={{ padding: '12px 16px' }}>
                <span
                  className="badge"
                  style={{
                    background: (report.riskLevel === 'HIGH' || report.riskLevel === 'CRITICAL') ? 'var(--error-bg)' : 'var(--warning-bg)',
                    color: (report.riskLevel === 'HIGH' || report.riskLevel === 'CRITICAL') ? 'var(--error)' : 'var(--warning)',
                  }}
                >
                  {report.riskLevel || 'MEDIUM'}
                </span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <ReportStatusBadge status={report.status} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <div className="flex-row items-center justify-end gap-xs">
                  <Button variant="secondary" size="sm" onClick={() => onSelectReport(report)}>
                    <Eye size={14} /> View
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onActionClick(report)}>
                    <ShieldAlert size={14} /> Action
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
