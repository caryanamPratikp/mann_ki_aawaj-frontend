import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { apiAdminService } from '../../services/apiAdminService.js';
import { AvatarThumbnail } from '../../components/avatar/AvatarThumbnail.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { API_BASE_URL, getMediaUrl } from '../../config/env.js';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  X,
  Eye,
  Send,
  Loader2,
  CheckCircle,
  Ban,
  Trash2,
  ExternalLink,
  MessageSquare,
  Globe,
  Languages
} from 'lucide-react';

export function AdminUsersPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTab, setUserTab] = useState('posts'); // 'posts' | 'blocked'
  const [userPosts, setUserPosts] = useState([]);
  const [userBlockedItems, setUserBlockedItems] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [previewBlocked, setPreviewBlocked] = useState(null);

  // Auto-translated English content state for Admin
  const [englishPostContent, setEnglishPostContent] = useState('');
  const [englishBlockedContent, setEnglishBlockedContent] = useState('');
  const [translatingContent, setTranslatingContent] = useState(false);

  // Warning Modal State
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningLevel, setWarningLevel] = useState('FIRST');
  const [warningMessage, setWarningMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);

  const { addToast } = useToast();
  const { translateTextAsync } = useLanguage();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery.trim()) {
        res = await apiAdminService.searchUsers(searchQuery);
      } else {
        res = await apiAdminService.getUsers({ page: 0, size: 50 });
      }
      const raw = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setUsers(raw);
    } catch (err) {
      console.warn('Failed to load users list:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleOpenUserDetail = async (user) => {
    setSelectedUser(user);
    setUserTab('posts');
    setLoadingPosts(true);
    try {
      const [postsRes, blockedRes] = await Promise.allSettled([
        apiAdminService.getUserPosts(user.id, { page: 0, size: 20 }),
        apiAdminService.getBlockedContent('ALL', { page: 0, size: 100 }),
      ]);

      if (postsRes.status === 'fulfilled' && postsRes.value) {
        const rawPosts = postsRes.value.data?.content || (Array.isArray(postsRes.value.data) ? postsRes.value.data : []);
        setUserPosts(rawPosts);
      } else {
        setUserPosts([]);
      }

      if (blockedRes.status === 'fulfilled' && blockedRes.value) {
        const rawBlocked = blockedRes.value.data?.content || (Array.isArray(blockedRes.value.data) ? blockedRes.value.data : []);
        const cleanUserHandle = (user.username || '').toLowerCase().replace(/^@/, '');
        const filteredBlocked = rawBlocked.filter((b) => {
          if (b.userId && String(b.userId) === String(user.id)) return true;
          const bUname = (b.authorUsername || b.authorEmail || '').toLowerCase().replace(/^@/, '');
          return cleanUserHandle && bUname && (bUname === cleanUserHandle || bUname.includes(cleanUserHandle));
        });
        setUserBlockedItems(filteredBlocked);
      } else {
        setUserBlockedItems([]);
      }
    } catch (err) {
      setUserPosts([]);
      setUserBlockedItems([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Auto-translate preview post content to English for Admin
  useEffect(() => {
    if (!previewPost) {
      setEnglishPostContent('');
      return;
    }
    const orig = previewPost.originalContent || previewPost.content || previewPost.description || previewPost.summary || '';
    setEnglishPostContent(orig);
    if (translateTextAsync && orig) {
      setTranslatingContent(true);
      translateTextAsync(orig, 'EN')
        .then((tText) => {
          if (tText) setEnglishPostContent(tText);
        })
        .catch(() => {})
        .finally(() => setTranslatingContent(false));
    }
  }, [previewPost, translateTextAsync]);

  // Auto-translate preview blocked item content to English for Admin
  useEffect(() => {
    if (!previewBlocked) {
      setEnglishBlockedContent('');
      return;
    }
    const orig = previewBlocked.originalContent || previewBlocked.content || previewBlocked.flaggedReason || '';
    setEnglishBlockedContent(orig);
    if (translateTextAsync && orig) {
      setTranslatingContent(true);
      translateTextAsync(orig, 'EN')
        .then((tText) => {
          if (tText) setEnglishBlockedContent(tText);
        })
        .catch(() => {})
        .finally(() => setTranslatingContent(false));
    }
  }, [previewBlocked, translateTextAsync]);

  const handleToggleBlock = async (user) => {
    try {
      if (user.active) {
        await apiAdminService.blockUser(user.id);
        addToast(`Blocked account for @${user.username}`, 'info');
      } else {
        await apiAdminService.unblockUser(user.id);
        addToast(`Unblocked account for @${user.username}`, 'success');
      }
      loadUsers();
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser({ ...selectedUser, active: !user.active });
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !selectedUser) return;
    setSendingWarning(true);
    try {
      await apiAdminService.sendWarning(selectedUser.id, warningLevel, warningMessage);
      addToast(`Warning notice sent to @${selectedUser.username}`, 'success');
      setWarningModalOpen(false);
      setWarningMessage('');
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Failed to send warning', 'error');
    } finally {
      setSendingWarning(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post from the platform?')) return;
    try {
      await apiAdminService.deletePost(postId);
      addToast('Post deleted successfully by admin', 'success');
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
      setPreviewPost(null);
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Failed to delete post', 'error');
    }
  };

  return (
    <AdminLayout activeRoute="/admin/users" onNavigate={onNavigate} onRefresh={loadUsers}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
              Platform Users Directory
            </h1>
            <p style={{ fontSize: '13.5px', color: '#666666', margin: '4px 0 0 0' }}>
              View registered accounts, inspect posts & blocked messages, issue warnings, and moderate.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9F9794' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by handle or email..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '24px',
                border: '1px solid #E1DCDB',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                color: '#2D1D15',
              }}
            />
          </div>
        </div>

        {/* ── USERS TABLE ───────────────────────────────────────────────────── */}
        <div
          className="table-responsive"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E1DCDB',
            boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
            overflowX: 'auto',
          }}
        >
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6F405F', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading platform users...</span>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9F9794', fontSize: '14px' }}>
              No platform users found matching your search.
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F5F3', borderBottom: '1px solid #E1DCDB', color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>User Handle</th>
                  <th style={{ padding: '14px 20px' }}>Posts Count</th>
                  <th style={{ padding: '14px 20px' }}>Warnings Issued</th>
                  <th style={{ padding: '14px 20px' }}>Account Status</th>
                  <th style={{ padding: '14px 20px' }}>Joined Date</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const cleanHandle = u.username ? (u.username.startsWith('@') ? u.username : `@${u.username}`) : `@user_${u.id}`;
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid #F4EFEF', transition: 'background 0.15s', cursor: 'pointer' }}
                      onClick={() => handleOpenUserDetail(u)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF7F6')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <AvatarThumbnail username={cleanHandle} size={32} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#2D1D15', fontSize: '14px' }}>
                              {cleanHandle}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9F9794' }}>
                              ID: #{u.id} {u.role === 'ADMIN' ? '• Admin' : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#2D1D15' }}>
                          <FileText size={15} style={{ color: '#6F405F' }} />
                          <span>{u.postCount != null ? u.postCount : 0} posts</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: u.warningCount > 0 ? 'rgba(239, 68, 68, 0.1)' : '#F8F5F3',
                            color: u.warningCount > 0 ? '#ef4444' : '#666666',
                          }}
                        >
                          ⚠️ {u.warningCount != null ? u.warningCount : 0} Warnings
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: u.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: u.active ? '#10b981' : '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {u.active ? <ShieldCheck size={13} /> : <Ban size={13} />}
                          {u.active ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', color: '#666666', fontSize: '12.5px' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenUserDetail(u)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            border: '1px solid #6F405F',
                            backgroundColor: '#6F405F',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── USER DETAILS MODAL ────────────────────────────────────────────── */}
        {selectedUser && (
          <Modal isOpen={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} title={`User Profile: @${selectedUser.username}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* User Identity Header Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F8F5F3', borderRadius: '16px', border: '1px solid #E1DCDB' }}>
                <AvatarThumbnail username={selectedUser.username} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2D1D15' }}>
                    @{selectedUser.username.replace('@', '')}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                    Member ID: #{selectedUser.id} • Registered {formatDate(selectedUser.createdAt)}
                  </span>
                </div>

                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: selectedUser.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: selectedUser.active ? '#10b981' : '#ef4444',
                  }}
                >
                  {selectedUser.active ? 'ACTIVE ACCOUNT' : 'BLOCKED ACCOUNT'}
                </span>
              </div>

              {/* Stats Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#FAF7F6', border: '1px solid #E1DCDB', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#6F405F' }}>{selectedUser.postCount != null ? selectedUser.postCount : 0}</div>
                  <div style={{ fontSize: '11px', color: '#666666', fontWeight: 600 }}>Posts Published</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#FAF7F6', border: '1px solid #E1DCDB', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>{userBlockedItems.length}</div>
                  <div style={{ fontSize: '11px', color: '#666666', fontWeight: 600 }}>Blocked Messages</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#FAF7F6', border: '1px solid #E1DCDB', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#eab308' }}>{selectedUser.warningCount != null ? selectedUser.warningCount : 0}</div>
                  <div style={{ fontSize: '11px', color: '#666666', fontWeight: 600 }}>Warnings Issued</div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setWarningModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    color: '#854d0e',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} /> Send Warning Notice
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBlock(selectedUser)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${selectedUser.active ? '#ef4444' : '#10b981'}`,
                    backgroundColor: selectedUser.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: selectedUser.active ? '#ef4444' : '#10b981',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedUser.active ? <Ban size={15} /> : <ShieldCheck size={15} />}
                  {selectedUser.active ? 'Block Account' : 'Unblock Account'}
                </button>
              </div>

              {/* TABS: Published Posts vs Blocked Messages/Footprints */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E1DCDB', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setUserTab('posts')}
                  style={{
                    padding: '8px 4px',
                    fontSize: '13.5px',
                    fontWeight: userTab === 'posts' ? 800 : 500,
                    color: userTab === 'posts' ? '#6F405F' : '#666666',
                    borderBottom: userTab === 'posts' ? '2.5px solid #6F405F' : 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Published Posts ({userPosts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setUserTab('blocked')}
                  style={{
                    padding: '8px 4px',
                    fontSize: '13.5px',
                    fontWeight: userTab === 'blocked' ? 800 : 500,
                    color: userTab === 'blocked' ? '#ef4444' : '#666666',
                    borderBottom: userTab === 'blocked' ? '2.5px solid #ef4444' : 'none',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldAlert size={15} /> Blocked Messages &amp; Content ({userBlockedItems.length})
                </button>
              </div>

              {/* TAB CONTENT 1: Published Posts */}
              {userTab === 'posts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {loadingPosts ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666666', fontSize: '13px' }}>
                      Loading user posts...
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9F9794', fontSize: '13px', backgroundColor: '#FAF7F6', borderRadius: '12px' }}>
                      This user has not published any posts yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                      {userPosts.map((p) => {
                        const postBody = p.originalContent || p.content || p.description || p.summary || '';
                        return (
                          <div
                            key={p.id}
                            onClick={() => setPreviewPost(p)}
                            style={{
                              padding: '12px 14px',
                              backgroundColor: '#FAF7F6',
                              borderRadius: '12px',
                              border: '1px solid #E1DCDB',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease-in-out',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>
                                {p.title || 'Untitled Post'}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Eye size={12} /> View Post
                              </span>
                            </div>

                            <div style={{ fontSize: '12.5px', color: '#4A3E3D', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {postBody}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#8C8385' }}>
                              <span>Topic: {p.topic || 'General'} • Published {formatDate(p.createdAt)}</span>
                              {p.imageUrl && <span style={{ color: '#10b981', fontWeight: 600 }}>📷 Image Attached</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 2: Blocked Messages & Footprints */}
              {userTab === 'blocked' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {loadingPosts ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666666', fontSize: '13px' }}>
                      Loading blocked messages...
                    </div>
                  ) : userBlockedItems.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9F9794', fontSize: '13px', backgroundColor: '#FAF7F6', borderRadius: '12px' }}>
                      No auto-blocked messages recorded for this user.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                      {userBlockedItems.map((b) => {
                        const cType = (b.contentType || 'CHAT').toUpperCase();
                        return (
                          <div
                            key={b.id}
                            onClick={() => setPreviewBlocked(b)}
                            style={{
                              padding: '12px 14px',
                              backgroundColor: '#FEF2F2',
                              borderRadius: '12px',
                              border: '1px solid #FCA5A5',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldAlert size={14} /> BLOCKED {cType}: {b.flaggedReason || 'Abusive Wording'}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Eye size={12} /> Inspect &amp; Warn
                              </span>
                            </div>

                            <div style={{ fontSize: '13px', color: '#991B1B', marginTop: '6px', fontWeight: 600 }}>
                              "{b.originalContent || 'Blocked message'}"
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#9F9794' }}>
                              <span>Blocked at {formatDate(b.blockedAt)}</span>
                              <span style={{ color: '#ef4444', fontWeight: 700 }}>Action Required</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </Modal>
        )}

        {/* ── POST PREVIEW MODAL WITH AUTO-TRANSLATION TO ENGLISH ─────────────── */}
        {previewPost && (
          <Modal isOpen={Boolean(previewPost)} onClose={() => setPreviewPost(null)} title={`Post #${previewPost.id} Preview (Translated to English)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AvatarThumbnail username={selectedUser?.username} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#2D1D15', fontSize: '14px' }}>
                      @{selectedUser?.username?.replace('@', '') || previewPost.username}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8C8385' }}>
                      Published {formatDate(previewPost.createdAt)}
                    </div>
                  </div>
                </div>

                <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#F8F5F3', fontSize: '11.5px', fontWeight: 700, color: '#6F405F' }}>
                  Topic: {previewPost.topic || 'General'}
                </span>
              </div>

              {/* Translation Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#6F405F', backgroundColor: 'rgba(111, 64, 95, 0.08)', padding: '6px 12px', borderRadius: '8px' }}>
                <Globe size={14} />
                <span>Automatically Translated to English for Admin Review</span>
                {translatingContent && <Loader2 size={12} className="animate-spin" style={{ marginLeft: 'auto' }} />}
              </div>

              {previewPost.title && (
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#2D1D15' }}>
                  {previewPost.title}
                </h3>
              )}

              <div style={{ fontSize: '14px', color: '#2D1D15', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: '#FAF7F6', padding: '14px', borderRadius: '12px', border: '1px solid #E1DCDB' }}>
                {englishPostContent || previewPost.originalContent || previewPost.content || 'No text content.'}
              </div>

              {previewPost.imageUrl && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E1DCDB', maxHeight: '300px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={getMediaUrl(previewPost.imageUrl)} alt="Post attachment" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E1DCDB' }}>
                <button
                  type="button"
                  onClick={() => handleDeletePost(previewPost.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Delete Post from Platform
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPost(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    backgroundColor: '#F8F5F3',
                    color: '#2D1D15',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ── BLOCKED ITEM PREVIEW MODAL WITH WARNING ACTION ─────────────────── */}
        {previewBlocked && (
          <Modal isOpen={Boolean(previewBlocked)} onClose={() => setPreviewBlocked(null)} title={`Blocked Message Preview (Translated to English)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#991B1B' }}>
                    Reason Flagged: {previewBlocked.flaggedReason || 'Abusive Content'}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#7F1D1D' }}>
                    Author: @{previewBlocked.authorUsername || selectedUser?.username} • Blocked {formatDate(previewBlocked.blockedAt)}
                  </span>
                </div>
              </div>

              {/* Translation Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#6F405F', backgroundColor: 'rgba(111, 64, 95, 0.08)', padding: '6px 12px', borderRadius: '8px' }}>
                <Globe size={14} />
                <span>Original Message Auto-Translated to English</span>
                {translatingContent && <Loader2 size={12} className="animate-spin" style={{ marginLeft: 'auto' }} />}
              </div>

              <div style={{ fontSize: '14px', color: '#2D1D15', lineHeight: 1.5, whiteSpace: 'pre-wrap', backgroundColor: '#FAF7F6', padding: '14px', borderRadius: '12px', border: '1px solid #E1DCDB' }}>
                {englishBlockedContent || previewBlocked.originalContent || 'No message content.'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E1DCDB' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewBlocked(null);
                    setWarningModalOpen(true);
                    setWarningMessage(`Your message "${previewBlocked.originalContent || 'blocked text'}" was flagged and blocked by AI for: ${previewBlocked.flaggedReason || 'Abusive wording'}.`);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    color: '#854d0e',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} /> Issue Warning Notice for this Message
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewBlocked(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    backgroundColor: '#F8F5F3',
                    color: '#2D1D15',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ── SEND WARNING MODAL ────────────────────────────────────────────── */}
        {warningModalOpen && selectedUser && (
          <Modal isOpen={warningModalOpen} onClose={() => setWarningModalOpen(false)} title={`Send Warning to @${selectedUser.username}`}>
            <form onSubmit={handleSendWarning} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Warning Notice Level *</label>
                <select
                  value={warningLevel}
                  onChange={(e) => setWarningLevel(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="FIRST">First Warning (Notice)</option>
                  <option value="SECOND">Second Warning (Strong Notice)</option>
                  <option value="FINAL">Final Warning (Account Action Imminent)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15' }}>Warning Message *</label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Explain the reason for this warning notice..."
                  rows={4}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWarningModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #E1DCDB',
                    backgroundColor: '#F8F5F3',
                    color: '#2D1D15',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingWarning}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: sendingWarning ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} /> {sendingWarning ? 'Sending...' : 'Send Warning Notice'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
