import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { AdminReportDetails } from '../../components/admin/AdminReportDetails.jsx';
import { AdminActionModal } from '../../components/admin/AdminActionModal.jsx';
import { useReports } from '../../context/ReportContext.jsx';

export function AdminReportDetailsPage({ reportId, onNavigate }) {
  const { performAdminAction, refreshReports, adminQueue } = useReports();
  const report = adminQueue.find((r) => String(r.id) === String(reportId));

  const [actionModalOpen, setActionModalOpen] = useState(false);

  const handleExecuteAction = async (rId, actionType, actionReason, adminNotes) => {
    await performAdminAction(rId, actionType, actionReason, adminNotes);
    refreshReports();
  };

  return (
    <AdminLayout activeRoute="/admin/reports" onNavigate={onNavigate}>
      <AdminReportDetails
        report={report}
        onBack={() => onNavigate('/admin/reports')}
        onActionClick={() => setActionModalOpen(true)}
      />

      <AdminActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        report={report}
        onExecuteAction={handleExecuteAction}
      />
    </AdminLayout>
  );
}
