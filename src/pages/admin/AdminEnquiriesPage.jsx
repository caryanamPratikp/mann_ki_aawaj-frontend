import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { 
  Inbox, CheckCircle2, Clock, Trash2, Mail, MessageSquare, 
  Search, RefreshCw, Filter, ShieldAlert, ChevronDown, Check, AlertCircle 
} from 'lucide-react';

export function AdminEnquiriesPage({ onNavigate }) {
  const { addToast } = useToast();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchEnquiries = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiAdminService.getEnquiries();
      const raw = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(raw) ? raw : (raw?.content || []);
      setEnquiries(list);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      addToast('Failed to fetch user enquiries', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);


  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await apiAdminService.updateEnquiryStatus(id, newStatus, adminNoteInput);
      addToast(`Enquiry status updated to ${newStatus}`, 'success');
      setEditingId(null);
      setAdminNoteInput('');
      fetchEnquiries(true);
    } catch (err) {
      addToast('Failed to update enquiry status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user enquiry?')) return;
    setActionLoading(id);
    try {
      await apiAdminService.deleteEnquiry(id);
      addToast('Enquiry deleted successfully', 'success');
      setEnquiries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      addToast('Failed to delete enquiry', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEnquiries = enquiries.filter(item => {
    const matchesSearch = 
      (item.ticketId && item.ticketId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = enquiries.filter(e => e.status === 'PENDING').length;
  const resolvedCount = enquiries.filter(e => e.status === 'RESOLVED').length;

  return (
    <AdminLayout
      activeRoute="/admin/enquiries"
      onNavigate={onNavigate}
      onRefresh={() => fetchEnquiries(true)}
      refreshing={refreshing}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Title Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#17151A', margin: 0 }}>
              User Enquiries Portal
            </h1>
            <p style={{ fontSize: '13.5px', color: '#766D68', margin: '4px 0 0 0' }}>
              Manage contact messages & support inquiries submitted from the landing page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchEnquiries(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: '#FFFDFC',
              border: '1px solid #E8DDD5',
              fontSize: '13px',
              fontWeight: 600,
              color: '#332821',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh List
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '18px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 52, 79, 0.1)', color: '#63344F', display: 'grid', placeItems: 'center' }}>
              <Inbox size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#17151A' }}>{enquiries.length}</div>
              <div style={{ fontSize: '12.5px', color: '#766D68', fontWeight: 600 }}>Total Enquiries</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '18px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#D97706', display: 'grid', placeItems: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#17151A' }}>{pendingCount}</div>
              <div style={{ fontSize: '12.5px', color: '#766D68', fontWeight: 600 }}>Pending Review</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '18px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(41, 150, 90, 0.12)', color: '#29965A', display: 'grid', placeItems: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#17151A' }}>{resolvedCount}</div>
              <div style={{ fontSize: '12.5px', color: '#766D68', fontWeight: 600 }}>Resolved Enquiries</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '18px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '12px', padding: '8px 14px', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} color="#766D68" />
            <input
              type="text"
              placeholder="Search ticket, name, email or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13.5px', color: '#17151A' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['ALL', 'PENDING', 'RESOLVED'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === st ? '#63344F' : '#FFF8F2',
                  color: statusFilter === st ? '#FFFFFF' : '#766D68',
                  transition: 'all 0.2s ease',
                }}
              >
                {st === 'ALL' ? 'All Enquiries' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries Grid Matrix */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#766D68' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <div>Loading enquiries from database...</div>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Inbox size={44} color="#A0A5BD" />
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#17151A' }}>No Enquiries Found</div>
            <p style={{ fontSize: '13.5px', color: '#766D68', margin: 0, maxWidth: '400px' }}>
              {searchQuery ? 'No user enquiries match your current search filter.' : 'No landing page inquiries have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredEnquiries.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFDFC',
                  border: '1.5px solid #E8DDD5',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(70,45,35,0.04)',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ backgroundColor: '#63344F', color: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em' }}>
                      #{item.ticketId || `MKA-INQ-${item.id}`}
                    </span>
                    <span style={{ backgroundColor: 'rgba(242,176,141,0.2)', color: '#332821', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      {item.category || 'General Inquiry'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: item.status === 'RESOLVED' ? 'rgba(41,150,90,0.15)' : 'rgba(234,179,8,0.15)',
                      color: item.status === 'RESOLVED' ? '#29965A' : '#D97706',
                    }}>
                      ● {item.status || 'PENDING'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoading === item.id}
                      style={{ padding: '6px', borderRadius: '8px', color: '#ef4444', background: 'none', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                      title="Delete Enquiry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* User Details & Subject */}
                <div style={{ borderBottom: '1px solid #F0E7E0', paddingBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#17151A' }}>
                    {item.subject}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', color: '#766D68', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#332821' }}>👤 {item.name}</span>
                    <span>✉️ <a href={`mailto:${item.email}`} style={{ color: '#63344F', textDecoration: 'underline' }}>{item.email}</a></span>
                    <span>🕒 {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently'}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '16px', fontSize: '14px', color: '#332821', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {item.message}
                </div>

                {/* Attached Image Reference if present */}
                {item.imageUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#63344F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📷 Attached Reference Screenshot
                    </span>
                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" style={{ width: 'fit-content', display: 'block' }}>
                      <img
                        src={item.imageUrl}
                        alt="User Enquiry Attachment"
                        style={{
                          maxWidth: '280px',
                          maxHeight: '180px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1.5px solid #E8DDD5',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                        }}
                      />
                    </a>
                  </div>
                )}


                {/* Admin Notes if present */}
                {item.adminNotes && (
                  <div style={{ backgroundColor: 'rgba(99,52,79,0.06)', border: '1px solid rgba(99,52,79,0.2)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#63344F' }}>
                    <strong>Admin Note:</strong> {item.adminNotes}
                  </div>
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <input
                        type="text"
                        placeholder="Add admin note..."
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid #E8DDD5', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#29965A', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Save & Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: '#E8DDD5', color: '#332821', border: 'none', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                          disabled={actionLoading === item.id}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#29965A',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <CheckCircle2 size={15} /> Mark Resolved
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setAdminNoteInput(item.adminNotes || '');
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#FFF8F2',
                          border: '1px solid #E8DDD5',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#332821',
                          cursor: 'pointer',
                        }}
                      >
                        {item.adminNotes ? 'Edit Note' : 'Add Note'}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
