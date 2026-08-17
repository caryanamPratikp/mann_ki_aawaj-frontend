import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ShieldAlert, RefreshCw, Filter, User, Clock, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { API_BASE_URL, getMediaUrl } from '../../config/env.js';

export function AdminBlockedContentPage({ onNavigate }) {
  const { addToast } = useToast();
  const [footprints, setFootprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Warning Modal State
  const [selectedItemForWarn, setSelectedItemForWarn] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningLevel, setWarningLevel] = useState('FIRST');
  const [issuingWarn, setIssuingWarn] = useState(false);

  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!selectedItemForWarn || !warningMessage.trim()) return;

    setIssuingWarn(true);
    try {
      await apiAdminService.sendWarningForBlockedContent(
        selectedItemForWarn.id,
        warningLevel,
        warningMessage.trim()
      );
      addToast('Warning issued successfully and content status updated!', 'success');
      setSelectedItemForWarn(null);
      setWarningMessage('');
      setWarningLevel('FIRST');
      fetchBlockedFootprints();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to issue warning', 'error');
    } finally {
      setIssuingWarn(false);
    }
  };

  const fetchBlockedFootprints = async () => {
    setLoading(true);
    try {
      const res = await apiAdminService.getBlockedContent({
        contentType: selectedType === 'ALL' ? null : selectedType,
        page,
        size: 10,
      });

      const rawData = res?.data || res;
      const list = rawData?.content || (Array.isArray(rawData) ? rawData : (Array.isArray(res) ? res : []));
      setFootprints(list);
      setTotalPages(rawData?.totalPages || 1);
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
    <AdminLayout activeRoute="/admin/blocked-content" onNavigate={onNavigate} onRefresh={fetchBlockedFootprints} refreshing={loading}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center justify-between" style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div>
            <h1 className="page-heading flex-row items-center gap-sm" style={{ margin: 0, fontSize: '24px', color: 'var(--eclipse)' }}>
              <ShieldAlert className="text-error" size={28} />
              Blocked Content Footprints
            </h1>
            <p className="secondary-text" style={{ marginTop: '4px', margin: 0 }}>
              Real-time audit log of posts, comments, replies, and images blocked by AI Moderation due to foul words or abusive language.
            </p>
          </div>

          <button
            className="btn btn-secondary flex-row items-center gap-xs"
            onClick={fetchBlockedFootprints}
            disabled={loading}
            style={{ borderRadius: '10px', fontWeight: 600 }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Log
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid #E1DCDB',
            boxShadow: '0 2px 10px rgba(45, 29, 21, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1D15', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <Filter size={16} style={{ color: '#6F405F' }} /> Filter Footprints:
          </span>

          {[
            { type: 'ALL', label: 'All Content' },
            { type: 'POST', label: 'Posts' },
            { type: 'POST_IMAGE', label: 'Uploaded Images' },
            { type: 'COMMENT', label: 'Comments' },
            { type: 'REPLY', label: 'Replies' },
            { type: 'MESSAGE', label: 'Direct Messages' },
          ].map((item) => {
            const isActive = selectedType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  setSelectedType(item.type);
                  setPage(0);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #6F405F' : '1px solid #E1DCDB',
                  backgroundColor: isActive ? '#6F405F' : '#F8F5F3',
                  color: isActive ? '#ffffff' : '#2D1D15',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(111, 64, 95, 0.3)' : 'none',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content Footprints List */}
        {loading ? (
          <div className="card text-center py-lg secondary-text" style={{ padding: '40px', background: '#ffffff', borderRadius: '16px' }}>Loading moderation footprints...</div>
        ) : footprints.length === 0 ? (
          <EmptyState
            title="No Blocked Footprints Found"
            description="There are currently no recorded moderation blocks matching your filter criteria."
            icon={ShieldAlert}
          />
        ) : (
          <div className="flex-col gap-md">
            {footprints.map((item) => {
              const isImage = item.contentType === 'POST_IMAGE' || (item.originalContent && (item.originalContent.startsWith('data:image') || item.originalContent.includes('/uploads/') || item.originalContent.match(/\.(jpg|jpeg|png|webp|gif)/i)));

              let mediaUrl = null;
              if (isImage && item.originalContent) {
                if (item.originalContent.startsWith('data:image')) {
                  mediaUrl = item.originalContent;
                } else if (item.originalContent.startsWith('http') || item.originalContent.startsWith('/uploads')) {
                  mediaUrl = getMediaUrl(item.originalContent);
                } else {
                  const match = item.originalContent.match(/([a-zA-Z0-9_\-]+\.(webp|jpg|jpeg|png|gif))/i);
                  if (match && match[1]) {
                    mediaUrl = getMediaUrl(`/uploads/${match[1]}`);
                  }
                }
              }

              return (
                <div
                  key={item.id}
                  className="card flex-col gap-sm"
                  style={{
                    borderLeft: '4px solid var(--error, #ef4444)',
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '14px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div className="flex-row items-center justify-between">
                    <div className="flex-row items-center gap-sm">
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            item.contentType === 'POST'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : item.contentType === 'POST_IMAGE'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : item.contentType === 'COMMENT'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            item.contentType === 'POST'
                              ? '#3b82f6'
                              : item.contentType === 'POST_IMAGE'
                              ? '#a855f7'
                              : item.contentType === 'COMMENT'
                              ? '#10b981'
                              : '#ef4444',
                          fontWeight: 'bold',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        {item.contentType}
                      </span>

                      <span className="secondary-text flex-row items-center gap-xs font-semibold" style={{ fontSize: '13.5px', color: 'var(--eclipse)' }}>
                        <User size={15} color="var(--deep-plum)" />
                        {item.authorUsername || item.authorEmail || 'Anonymous User'}
                      </span>
                    </div>

                    <span className="secondary-text text-sm flex-row items-center gap-xs">
                      <Clock size={14} />
                      {item.blockedAt ? new Date(item.blockedAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  {/* Content Preview Block */}
                  {isImage && mediaUrl ? (
                    <div className="flex-col gap-xs p-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: '10px', border: '1px solid var(--border-light)', padding: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hurricane)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ImageIcon size={14} /> Uploaded Blocked Media File:
                      </span>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
                        <img
                          src={mediaUrl}
                          alt="Blocked Uploaded Media"
                          style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="flex-col gap-xs" style={{ flex: 1 }}>
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="btn btn-secondary flex-row items-center gap-xs"
                            style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 700, width: 'fit-content', borderRadius: '8px', background: 'var(--deep-plum)', color: '#ffffff', textDecoration: 'none' }}
                          >
                            <Download size={16} /> Download Flagged Media
                          </a>
                          <span style={{ fontSize: '11.5px', color: 'var(--hurricane)', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '4px' }}>
                            Path: {item.originalContent}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-md"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.025)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.55,
                        color: 'var(--eclipse)',
                        border: '1px solid var(--border-light)',
                        padding: '14px',
                      }}
                    >
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--hurricane)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        <FileText size={13} style={{ display: 'inline', marginRight: '4px' }} /> Full Submitted Text:
                      </div>
                      {item.originalContent}
                    </div>
                  )}

                  <div className="flex-row items-center justify-between" style={{ marginTop: '8px', borderTop: '1px solid var(--border-light, #E5E0DF)', paddingTop: '10px' }}>
                    <div className="flex-row items-center gap-xs text-error text-sm font-semibold">
                      <ShieldAlert size={16} />
                      <span>Flag Reason: {item.flaggedReason}</span>
                    </div>
                    <div>
                      {item.status === 'WARNING_ISSUED' ? (
                        <span className="badge badge-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgba(16, 185, 129, 1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                          Warning Issued
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setSelectedItemForWarn(item)}
                          icon={ShieldAlert}
                          style={{ borderRadius: '8px' }}
                        >
                          Issue Warning
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex-row items-center justify-between mt-md" style={{ background: '#ffffff', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <button
              className="btn btn-sm btn-secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="secondary-text font-semibold">
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

      {/* ── ISSUE WARNING MODAL ───────────────────────────────────── */}
      {selectedItemForWarn && (
        <Modal
          isOpen={!!selectedItemForWarn}
          onClose={() => setSelectedItemForWarn(null)}
          title={`Issue Warning to User (${selectedItemForWarn.authorUsername})`}
          maxWidth="520px"
        >
          <form onSubmit={handleIssueWarning} className="flex-col gap-md">
            <div className="mka-panel flex-col gap-xs" style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--error, #EF4444)', padding: '12px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--eclipse)' }}>Blocked Content Snippet:</span>
              <p style={{ fontSize: '13px', margin: 0, fontStyle: 'italic', color: 'var(--eclipse)', whiteSpace: 'pre-wrap' }}>
                "{selectedItemForWarn.originalContent}"
              </p>
            </div>

            <div className="flex-col gap-xs">
              <label style={{ fontSize: '13.5px', fontWeight: 600 }}>Warning Level *</label>
              <select
                value={warningLevel}
                onChange={(e) => setWarningLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E5E0DF)',
                  fontSize: '14px',
                  background: 'var(--pure-white, #FFFFFF)',
                }}
              >
                <option value="FIRST">First Warning</option>
                <option value="SECOND">Second Warning</option>
                <option value="FINAL">Final Warning (Account Suspension Imminent)</option>
              </select>
            </div>

            <div className="flex-col gap-xs">
              <label style={{ fontSize: '13.5px', fontWeight: 600 }}>Warning Message *</label>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="State the violation and instructions (e.g. Please refrain from using abusive words on community feed)..."
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #E5E0DF)',
                  fontSize: '13.5px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="flex-row justify-end gap-sm" style={{ marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedItemForWarn(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={issuingWarn || !warningMessage.trim()} icon={ShieldAlert}>
                {issuingWarn ? 'Sending...' : 'Send Warning'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
