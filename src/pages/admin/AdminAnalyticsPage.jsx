import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard.jsx';
import {
  Users,
  FileText,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Activity
} from 'lucide-react';

export function AdminAnalyticsPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await apiAdminService.getDashboard();
      const raw = res.data || res;
      setStats(raw);
    } catch (err) {
      console.warn('Failed to fetch analytics stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout activeRoute="/admin/analytics" onNavigate={onNavigate} onRefresh={loadStats}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
            Platform Moderation & Usage Analytics
          </h1>
          <p style={{ fontSize: '13.5px', color: '#666666', margin: '4px 0 0 0' }}>
            Real-time analytics, platform user volume, post distribution, and AI moderation enforcement metrics.
          </p>
        </div>

        {/* ── KPI METRICS GRID ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
          <AdminMetricCard
            title="Total Registered Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="#6F405F"
            subtitle={`${stats?.activeUsers || 0} active • ${stats?.totalBlockedUsers || 0} blocked`}
            loading={loading}
          />
          <AdminMetricCard
            title="Total Published Posts"
            value={stats?.totalPosts || 0}
            icon={FileText}
            color="#2563eb"
            subtitle={`${stats?.todayPostsCount || 0} posts created today`}
            loading={loading}
          />
          <AdminMetricCard
            title="Pending Moderation Queue"
            value={stats?.totalPendingReports || 0}
            icon={AlertTriangle}
            color="#eab308"
            subtitle="Reports awaiting review"
            loading={loading}
          />
          <AdminMetricCard
            title="AI Moderation Gate"
            value={stats?.totalPendingReviewQueue || 0}
            icon={ShieldAlert}
            color="#ef4444"
            subtitle="Auto-blocked violations"
            loading={loading}
          />
        </div>

        {/* ── ANALYTICS BREAKDOWN ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Moderation Resolution Breakdown Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E1DCDB',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#2D1D15' }}>
                Moderation Queue Resolution Rate
              </h3>
              <Activity size={18} style={{ color: '#6F405F' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#2D1D15', marginBottom: '6px' }}>
                  <span>Resolved Reports</span>
                  <span>{stats?.totalResolvedReports || 0} items</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F8F5F3', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((stats?.totalResolvedReports || 0) / (stats?.totalPendingReports || 1)) * 100)}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#2D1D15', marginBottom: '6px' }}>
                  <span>Dismissed / Rejected Reports</span>
                  <span>{stats?.totalRejectedReports || 0} items</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F8F5F3', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((stats?.totalRejectedReports || 0) / (stats?.totalPendingReports || 1)) * 100)}%`, height: '100%', backgroundColor: '#6F405F', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#2D1D15', marginBottom: '6px' }}>
                  <span>Pending Human Review</span>
                  <span>{stats?.totalPendingReports || 0} items</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F8F5F3', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((stats?.totalPendingReports || 0) / (stats?.totalPendingReports || 1)) * 100)}%`, height: '100%', backgroundColor: '#eab308', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Intelligence Metric Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E1DCDB',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#2D1D15' }}>
                AI Pre-Publish Pre-Gate Safety
              </h3>
              <CheckCircle size={18} style={{ color: '#10b981' }} />
            </div>

            <p style={{ fontSize: '13px', color: '#666666', margin: 0 }}>
              All user post submissions (Text, Images, Multimodal) are passed through OpenAI Model Moderation before database entry.
            </p>

            <div style={{ padding: '16px', backgroundColor: '#F8F5F3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666666', fontWeight: 600 }}>Fail-Closed Pipeline</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>100% Enforced</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6F405F', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '16px', border: '1px solid #E1DCDB' }}>
                omni-moderation-latest
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
