import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ShieldAlert, RefreshCw, Filter, User, Clock } from 'lucide-react';

export function AdminBlockedContentPage({ onNavigate }) {
  const { addToast } = useToast();
  const [footprints, setFootprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlockedFootprints = async () => {
    setLoading(true);
    try {
      const res = await apiAdminService.getBlockedContent({
        contentType: selectedType === 'ALL' ? null : selectedType,
        page,
        size: 10,
      });

      if (res?.success && res?.data) {
        setFootprints(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setFootprints([]);
      }
    } catch (err) {
      console.error('Failed to load blocked footprints:', err);
      addToast('Could not fetch blocked content footprints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedFootprints();
  }, [selectedType, page]);

  return (
    <AdminLayout activeRoute="/admin/blocked-content" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center justify-between">
          <div>
            <h1 className="page-heading flex-row items-center gap-sm">
              <ShieldAlert className="text-error" size={28} />
              Blocked Content Footprints
            </h1>
            <p className="secondary-text">
              Real-time audit log of posts, comments, replies, and messages blocked by AI Moderation due to foul words or abusive language.
            </p>
          </div>

          <button
            className="btn btn-secondary flex-row items-center gap-xs"
            onClick={fetchBlockedFootprints}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Log
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex-row items-center gap-sm flex-wrap">
          <span className="secondary-text flex-row items-center gap-xs">
            <Filter size={16} /> Filter by:
          </span>
          {['ALL', 'POST', 'COMMENT', 'REPLY', 'MESSAGE'].map((type) => (
            <button
              key={type}
              className={`btn btn-sm ${selectedType === type ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setSelectedType(type);
                setPage(0);
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Content Footprints List */}
        {loading ? (
          <div className="card text-center py-lg secondary-text">Loading moderation footprints...</div>
        ) : footprints.length === 0 ? (
          <EmptyState
            title="No Blocked Footprints Found"
            description="There are currently no recorded moderation blocks matching your filter criteria."
            icon={ShieldAlert}
          />
        ) : (
          <div className="flex-col gap-md">
            {footprints.map((item) => (
              <div key={item.id} className="card flex-col gap-sm" style={{ borderLeft: '4px solid var(--error, #ef4444)' }}>
                <div className="flex-row items-center justify-between">
                  <div className="flex-row items-center gap-sm">
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          item.contentType === 'POST'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : item.contentType === 'COMMENT'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          item.contentType === 'POST'
                            ? '#3b82f6'
                            : item.contentType === 'COMMENT'
                            ? '#10b981'
                            : '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.contentType}
                    </span>

                    <span className="secondary-text flex-row items-center gap-xs">
                      <User size={14} />
                      {item.authorUsername || item.authorEmail || 'Anonymous User'}
                    </span>
                  </div>

                  <span className="secondary-text text-sm flex-row items-center gap-xs">
                    <Clock size={14} />
                    {item.blockedAt ? new Date(item.blockedAt).toLocaleString() : 'Just now'}
                  </span>
                </div>

                <div
                  className="p-md"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    wordBreak: 'break-word',
                  }}
                >
                  "{item.originalContent}"
                </div>

                <div className="flex-row items-center gap-xs text-error text-sm font-semibold">
                  <ShieldAlert size={16} />
                  <span>Flag Reason: {item.flaggedReason}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex-row items-center justify-between mt-md">
            <button
              className="btn btn-sm btn-secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="secondary-text">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-secondary"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
