import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { Flag, FileCheck, MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function AdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiAdminService.getDashboard().then((response) => setStats(response.data)).catch(console.error);
  }, []);

  const pendingReports = stats?.totalPendingReports || 0;
  const postsHeld = stats?.totalPosts || 0;
  const blockedUsers = stats?.totalBlockedUsers || 0;
  const totalUsers = stats?.totalUsers || 0;

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
          <AdminMetricCard title="AI Blocked Content" value={stats?.totalBlockedContent || 0} icon={ShieldAlert} color="var(--error)" />
          <AdminMetricCard title="Total Posts" value={postsHeld} icon={FileCheck} color="var(--deep-plum)" />
          <AdminMetricCard title="Registered Users" value={totalUsers} icon={MessageSquare} color="var(--deep-plum)" />
        </div>

        {/* Quick Actions */}
        <div className="mka-card flex-col gap-md">
          <h3 className="card-heading">Quick Actions</h3>
          <div className="flex-row gap-md flex-wrap">
            <Button variant="primary" onClick={() => onNavigate('/admin/reports')}>
              Review Reports Queue ({pendingReports})
            </Button>
            <Button variant="danger" onClick={() => onNavigate('/admin/blocked-content')} icon={ShieldAlert}>
              AI Blocked Content & Logs
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
