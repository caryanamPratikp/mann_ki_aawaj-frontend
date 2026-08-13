import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { ReportCard } from '../../components/reports/ReportCard.jsx';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ReportStatusBadge } from '../../components/reports/ReportStatusBadge.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function MyReportsPage({ onNavigate }) {
  const { myReports } = useReports();
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <UserLayout activeRoute="/my-reports" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">{t('myContentReports')}</h1>
          <p className="secondary-text">{t('trackReportsDesc')}</p>
        </div>

        {myReports.length === 0 ? (
          <EmptyState
            title={t('noActiveReports')}
            description={t('noActiveReportsDesc')}
            icon={ShieldAlert}
          />
        ) : (
          <div className="flex-col gap-md">
            {myReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title={`Report Reference: ${selectedReport?.id}`}>
        {selectedReport && (
          <div className="flex-col gap-md">
            <div className="flex-row justify-between items-center">
              <span className="badge badge-neutral">Target: {selectedReport.contentType}</span>
              <ReportStatusBadge status={selectedReport.status} />
            </div>

            <div className="mka-panel flex-col gap-xs">
              <span className="caption-text bold">Report Reason:</span>
              <p className="bold">{selectedReport.reason}</p>
            </div>

            <div className="mka-panel flex-col gap-xs">
              <span className="caption-text bold">Content Preview:</span>
              <p className="secondary-text" style={{ fontStyle: 'italic' }}>
                "{selectedReport.reportedContent}"
              </p>
            </div>

            {selectedReport.explanation && (
              <div className="mka-panel flex-col gap-xs">
                <span className="caption-text bold">Your Submitted Explanation:</span>
                <p className="body-text">{selectedReport.explanation}</p>
              </div>
            )}

            {selectedReport.adminNotes && (
              <div className="mka-panel flex-col gap-xs" style={{ background: 'var(--deep-plum-light)' }}>
                <span className="caption-text bold" style={{ color: 'var(--deep-plum)' }}>Moderation Response:</span>
                <p className="body-text">{selectedReport.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </UserLayout>
  );
}
