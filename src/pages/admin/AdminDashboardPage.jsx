import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { mockModerationService } from '../../services/mockModerationService.js';
import { Flag, FileCheck, MessageSquare, AlertTriangle, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function AdminDashboardPage({ onNavigate }) {
  const { adminQueue } = useReports();
  const heldContent = mockModerationService.getHeldContentQueue();

  const pendingReports = adminQueue.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const postsHeld = heldContent.filter((h) => h.contentType === 'POST').length;
  const commentsHeld = heldContent.filter((h) => h.contentType === 'COMMENT').length;
  const repliesHeld = heldContent.filter((h) => h.contentType === 'REPLY').length;
  const highRiskCases = adminQueue.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

  return (
    <AdminLayout activeRoute="/admin/dashboard" onNavigate={onNavigate}>
      <div className="flex-col gap-lg">
        <div>
          <h1 className="page-heading">Moderation Overview</h1>
          <p className="secondary-text">Platform activity monitoring & content review queues.</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <AdminMetricCard title="Pending Reports" value={pendingReports} icon={Flag} color="var(--warning)" />
          <AdminMetricCard title="Posts Held for Review" value={postsHeld} icon={FileCheck} color="var(--deep-plum)" />
          <AdminMetricCard title="Comments Held for Review" value={commentsHeld} icon={MessageSquare} color="var(--deep-plum)" />
          <AdminMetricCard title="Replies Held for Review" value={repliesHeld} icon={MessageSquare} color="var(--deep-plum)" />
          <AdminMetricCard title="High-Risk Cases" value={highRiskCases} icon={ShieldAlert} color="var(--error)" />
        </div>

        {/* Quick Actions */}
        <div className="mka-card flex-col gap-md">
          <h3 className="card-heading">Quick Actions</h3>
          <div className="flex-row gap-md flex-wrap">
            <Button variant="primary" onClick={() => onNavigate('/admin/reports')}>
              Review Reports Queue ({pendingReports})
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('/admin/content-review')}>
              Review Held Content Queue ({heldContent.length})
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
