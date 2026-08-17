import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { AdminReportTable } from '../../components/admin/AdminReportTable.jsx';
import { AdminActionModal } from '../../components/admin/AdminActionModal.jsx';
import { useReports } from '../../context/ReportContext.jsx';

export function AdminReportsPage({ onNavigate }) {
  const { adminQueue, performAdminAction, refreshReports } = useReports();
  const [filterType, setFilterType] = useState('All'); // All, Posts, Comments, Replies, Images, Profiles, High Risk, Closed
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);

  const filters = ['All', 'Posts', 'Comments', 'Replies', 'Images', 'Profiles', 'High Risk'];

  const reportsList = adminQueue.filter((report) => {
    if (filterType === 'All') return true;
    if (filterType === 'Posts') return report.contentType === 'POST';
    if (filterType === 'Comments') return report.contentType === 'COMMENT';
    return true;
  });

  const handleExecuteAction = async (reportId, actionType, actionReason, adminNotes) => {
    await performAdminAction(reportId, actionType, actionReason, adminNotes);
    refreshReports();
  };

  return (
    <AdminLayout activeRoute="/admin/reports" onNavigate={onNavigate} onRefresh={refreshReports}>
      <div className="flex-col gap-md">
        <div className="flex-row justify-between items-center flex-wrap gap-sm">
          <div>
            <h1 className="page-heading">Reports Queue</h1>
            <p className="secondary-text">Review and take moderation action on user-submitted content reports.</p>
          </div>

          <div className="flex-row gap-xs flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className="badge"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontWeight: filterType === f ? 600 : 400,
                  background: filterType === f ? 'var(--eclipse)' : 'var(--pure-white)',
                  color: filterType === f ? 'var(--swiss-coffee)' : 'var(--eclipse)',
                  border: '1px solid var(--border-light)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <AdminReportTable
          reports={reportsList}
          onSelectReport={(r) => onNavigate(`/admin/reports/${r.id}`)}
          onActionClick={(r) => setSelectedReportForAction(r)}
        />
      </div>

      <AdminActionModal
        isOpen={!!selectedReportForAction}
        onClose={() => setSelectedReportForAction(null)}
        report={selectedReportForAction}
        onExecuteAction={handleExecuteAction}
      />
    </AdminLayout>
  );
}
