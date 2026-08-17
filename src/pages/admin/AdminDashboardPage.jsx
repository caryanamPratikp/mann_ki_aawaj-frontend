import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { Flag, ShieldAlert, FileText, User, ChevronRight, RefreshCw, AlertCircle, FileCheck, BarChart3, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export function AdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentBlocked, setRecentBlocked] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashRes, blockedRes, reportsRes] = await Promise.allSettled([
        apiAdminService.getDashboard(),
        apiAdminService.getBlockedContent({ page: 0, size: 5 }),
        apiAdminService.getReports({ page: 0, size: 5 }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setStats(dashRes.value.data || dashRes.value);
      }

      if (blockedRes.status === 'fulfilled' && blockedRes.value) {
        const raw = blockedRes.value.data || blockedRes.value;
        const list = raw?.content || (Array.isArray(raw) ? raw : []);
        setRecentBlocked(list.slice(0, 5));
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value) {
        const raw = reportsRes.value.data || reportsRes.value;
        const list = raw?.content || (Array.isArray(raw) ? raw : []);
        setRecentReports(list.slice(0, 5));
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching dashboard data:', err);
      setError('Unable to load full intelligence data. Please retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const pendingReports = stats?.totalPendingReports || 0;
  const postsHeld = stats?.totalPosts || 0;
  const blockedCount = stats?.totalBlockedContent || 0;
  const totalUsers = stats?.totalUsers || 0;

  // Build Recent Activity Event Stream from real APIs
  const activityList = [];

  recentBlocked.forEach((b) => {
    const raw = b.authorUsername || b.authorEmail || 'member';
    const handle = raw.startsWith('@') ? raw.substring(1) : raw;
    const cleanUser = handle.includes('@') ? handle.split('@')[0] : handle;
    const cType = (b.contentType || 'content').toLowerCase();
    const typeLabel = cType === 'chat' || cType === 'message' || cType === 'msg'
      ? 'Message'
      : cType === 'comment'
      ? 'Comment'
      : cType === 'post'
      ? 'Post'
      : 'Content';
    activityList.push({
      id: `blocked-${b.id}`,
      title: `${typeLabel} auto-blocked by AI (${cleanUser})`,
      time: b.blockedAt ? getRelativeTime(b.blockedAt) : 'Recently',
      rawTime: b.blockedAt ? new Date(b.blockedAt).getTime() : 0,
      icon: ShieldAlert,
      iconColor: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    });
  });

  recentReports.forEach((r) => {
    const raw = r.reporterUsername || 'member';
    const handle = raw.startsWith('@') ? raw.substring(1) : raw;
    const cleanUser = handle.includes('@') ? handle.split('@')[0] : handle;
    activityList.push({
      id: `report-${r.id}`,
      title: `Report submitted by ${cleanUser}`,
      time: r.createdAt ? getRelativeTime(r.createdAt) : 'Recently',
      rawTime: r.createdAt ? new Date(r.createdAt).getTime() : 0,
      icon: Flag,
      iconColor: '#eab308',
      bg: 'rgba(234, 179, 8, 0.1)',
    });
  });

  activityList.sort((a, b) => b.rawTime - a.rawTime);
  const displayActivities = activityList.slice(0, 5);

  function getRelativeTime(dateStr) {
    if (!dateStr) return 'Recently';
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} d ago`;
  }

  return (
    <AdminLayout
      activeRoute="/admin/dashboard"
      onNavigate={onNavigate}
      onRefresh={() => loadDashboardData(true)}
      refreshing={refreshing}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Error Fallback Banner if API fails */}
        {error && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadDashboardData()}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── 1. FOUR LARGE KPI CARDS ACROSS THE TOP ────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          <AdminMetricCard
            title="Pending User Reports"
            value={pendingReports}
            icon={Flag}
            color="#ef4444"
            subtitle="Action required"
            loading={loading}
          />
          <AdminMetricCard
            title="AI Blocked Content"
            value={blockedCount}
            icon={ShieldAlert}
            color="#10b981"
            subtitle="Auto-blocked items"
            loading={loading}
          />
          <AdminMetricCard
            title="Total Platform Posts"
            value={postsHeld}
            icon={FileText}
            color="#6F405F"
            subtitle="Active & archived"
            loading={loading}
          />
          <AdminMetricCard
            title="Registered Accounts"
            value={totalUsers}
            icon={User}
            color="#2D1D15"
            subtitle="Community members"
            loading={loading}
          />
        </div>

        {/* ── 2. CONTENT INTELLIGENCE TREND & RECENT ACTIVITY GRID ─────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Content Intelligence Trend Chart Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #E1DCDB',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
              gridColumn: 'span 2',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D1D15' }}>
                  Content Intelligence Trend
                </h3>
                <span style={{ fontSize: '12px', color: '#9F9794', marginTop: '2px' }}>
                  Real-time pattern tracking of reports, AI blocks, and reviews
                </span>
              </div>

              <select
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E1DCDB',
                  backgroundColor: '#F8F5F3',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#2D1D15',
                  outline: 'none',
                }}
              >
                <option value="week">This Week ▾</option>
                <option value="month">This Month ▾</option>
              </select>
            </div>

            {/* SVG Trend Graph matching Option 1 */}
            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#F8F5F3" strokeWidth="1.5" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#F8F5F3" strokeWidth="1.5" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#F8F5F3" strokeWidth="1.5" />
                <line x1="0" y1="190" x2="600" y2="190" stroke="#E1DCDB" strokeWidth="1.5" />

                {/* Line 1: Reports (Purple #6F405F) */}
                <path
                  d="M 20 160 Q 100 120 180 140 T 340 80 T 500 60 L 580 30"
                  fill="none"
                  stroke="#6F405F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="580" cy="30" r="5" fill="#6F405F" />

                {/* Line 2: AI Blocked (Coral/Orange #eab308) */}
                <path
                  d="M 20 180 Q 100 150 180 160 T 340 120 T 500 100 L 580 90"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="580" cy="90" r="4" fill="#f97316" />

                {/* Line 3: Reviewed (Teal #10b981) */}
                <path
                  d="M 20 190 Q 100 180 180 185 T 340 160 T 500 140 L 580 135"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="580" cy="135" r="4" fill="#10b981" />
              </svg>

              {/* Day Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11.5px', color: '#9F9794', fontWeight: 600 }}>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F8F5F3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#2D1D15' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6F405F' }} />
                Reports
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#2D1D15' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                AI Blocked
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#2D1D15' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Reviewed
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #E1DCDB',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D1D15' }}>
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/admin/blocked-content')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6F405F',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayActivities.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#9F9794', fontSize: '13px' }}>
                  No recent activity recorded.
                </div>
              ) : (
                displayActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: '#F8F5F3',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: act.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: act.iconColor,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#2D1D15',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {act.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#9F9794', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        {act.time}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── 3. QUICK ACTIONS GRID ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #E1DCDB',
            padding: '28px',
            boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800, color: '#2D1D15' }}>
            Quick Actions
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Action Tile 1 */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/admin/reports')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#F8F5F3',
                border: '1px solid #E1DCDB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Flag size={20} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>Review Reports</span>
            </button>

            {/* Action Tile 2 */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/admin/blocked-content')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#F8F5F3',
                border: '1px solid #E1DCDB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <ShieldAlert size={20} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>AI Blocked Items</span>
            </button>

            {/* Action Tile 3 */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/admin/content-review')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#F8F5F3',
                border: '1px solid #E1DCDB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(111, 64, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6F405F' }}>
                <FileCheck size={20} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>Content Review</span>
            </button>

            {/* Action Tile 4 */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/admin/dashboard')}
              style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#F8F5F3',
                border: '1px solid #E1DCDB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(45, 29, 21, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D1D15' }}>
                <BarChart3 size={20} />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2D1D15' }}>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
