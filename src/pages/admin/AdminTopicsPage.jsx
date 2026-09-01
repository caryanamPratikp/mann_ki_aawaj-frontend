import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { 
  Hash, Search, RefreshCw, Trash2, Loader2, MessageSquare, 
  Layers, User, Calendar, AlertCircle, CheckCircle2 
} from 'lucide-react';

const PARENT_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'GENERAL', label: 'General / Technology' },
  { id: 'SPORTS', label: 'Sports & Cricket' },
  { id: 'ENTERTAINMENT', label: 'Entertainment & Bollywood' },
  { id: 'SOCIETY_POLITICS', label: 'Society & Politics' },
  { id: 'LIFE_WORK', label: 'Life & Work' },
  { id: 'FEELINGS', label: 'Feelings & Emotions' },
];

export function AdminTopicsPage({ onNavigate }) {
  const { addToast } = useToast();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedParent, setSelectedParent] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTopics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        page,
        size: 15,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedParent !== 'ALL') params.parentTopic = selectedParent;

      const res = await apiAdminService.getTopics(params);
      const data = res?.data !== undefined ? res.data : res;
      const content = data?.content || (Array.isArray(data) ? data : []);
      setTopics(content);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || content.length);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      addToast('Failed to load topic management list', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, debouncedSearch, selectedParent, addToast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleDelete = async (topic) => {
    if (!window.confirm(`Are you sure you want to delete topic #${topic.name}? All opinions attached to this topic will be affected.`)) {
      return;
    }

    setDeletingId(topic.id);
    try {
      await apiAdminService.deleteTopic(topic.id);
      addToast(`Topic #${topic.name} deleted successfully`, 'success');
      fetchTopics(true);
    } catch (err) {
      console.error('Delete topic error:', err);
      addToast(err?.message || 'Failed to delete topic', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout activeRoute="/admin/topics" onNavigate={onNavigate}>
      <div className="admin-page-container" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2D1D15', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hash size={24} color="#6F405F" /> Topic Management
            </h1>
            <p style={{ fontSize: '13.5px', color: '#736B69', margin: '4px 0 0 0' }}>
              Review, moderate, and inspect user-created topics and discussion streams ({totalElements} total).
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchTopics(true)}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E5DFDC',
              fontSize: '13px',
              fontWeight: 700,
              color: '#432E3C',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} color="#8C8385" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic name or creator handle..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E5DFDC',
                fontSize: '13.5px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#736B69" />
            <select
              value={selectedParent}
              onChange={(e) => {
                setSelectedParent(e.target.value);
                setPage(0);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid #E5DFDC',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#2D1D15',
                cursor: 'pointer',
              }}
            >
              {PARENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} color="#6F405F" className="spin-animation" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '14px', color: '#736B69' }}>Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px dashed #E5DFDC' }}>
            <Hash size={40} color="#C4BCB9" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1D15', margin: '0 0 6px 0' }}>No topics found</h3>
            <p style={{ fontSize: '13px', color: '#736B69', margin: 0 }}>
              {debouncedSearch || selectedParent !== 'ALL'
                ? 'No topics match the current filter criteria.'
                : 'No user-created topics exist in the system yet.'}
            </p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E5DFDC', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6F8', borderBottom: '1.5px solid #E5DFDC' }}>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase' }}>Topic</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase' }}>Created By</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase' }}>Created Date</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase' }}>Opinions</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#5A4652', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #F0EAE8' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{t.icon || '💡'}</span>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#2D1D15', display: 'block' }}>
                            #{t.name}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#736B69' }}>
                            {t.label || t.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#F3EBF0',
                          color: '#6F405F',
                          textTransform: 'uppercase',
                        }}
                      >
                        {t.parentTopic || 'GENERAL'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#432E3C', fontWeight: 600 }}>
                      {t.createdByUsername || '@anonymous'}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12.5px', color: '#736B69' }}>
                      {t.createdAt ? formatDate(t.createdAt) : 'Recently'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>
                        <MessageSquare size={14} color="#6F405F" />
                        <span>{t.commentCount ?? t.postCount ?? 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        disabled={deletingId === t.id}
                        title="Delete topic"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FFF0F0',
                          color: '#C62828',
                          border: '1px solid #FFCDD2',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: deletingId === t.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>{deletingId === t.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #E5DFDC', backgroundColor: '#FAF6F8' }}>
                <span style={{ fontSize: '12.5px', color: '#736B69' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E5DFDC',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E5DFDC',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
