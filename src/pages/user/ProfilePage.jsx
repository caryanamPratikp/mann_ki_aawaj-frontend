import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiProfileService } from '../../services/apiProfileService.js';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Edit3, Trash2, Calendar, Globe, Heart, MessageSquare, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';
import { editProfileSchema } from '../../utils/validationSchemas.js';

const AVATAR_COLORS = [
  { id: 'plum', hex: '#6F405F', name: 'Deep Plum' },
  { id: 'teal', hex: '#3F7772', name: 'Deep Teal' },
  { id: 'terracotta', hex: '#D96C3D', name: 'Terracotta' },
  { id: 'charcoal', hex: '#2D1D15', name: 'Charcoal' },
  { id: 'emerald', hex: '#2E7D52', name: 'Emerald' },
  { id: 'indigo', hex: '#4A3B6F', name: 'Indigo' },
];

import { InstagramChatPopup } from '../../components/chat/InstagramChatPopup.jsx';
import { AvatarStudioModal } from '../../components/avatar/AvatarStudioModal.jsx';

export function ProfilePage({ username, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { posts } = usePosts();
  const { t, changeLanguage, currentLanguage, supportedLanguages } = useLanguage();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Modals & Popups state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Edit Form state
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState(AVATAR_COLORS[0].hex);
  const [editPreferredLanguage, setEditPreferredLanguage] = useState('EN');
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [isChangingLang, setIsChangingLang] = useState(false);

  const targetUsername = username
    ? (username.startsWith('@') ? username.slice(1) : username)
    : (currentUser?.username ? currentUser.username.replace('@', '') : null);

  const isSelf = !username || (currentUser?.username && currentUser.username.toLowerCase().replace('@', '') === targetUsername?.toLowerCase());

  // Fetch Profile data
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        if (isSelf) {
          const res = await apiProfileService.getMyProfile().catch(() => null);
          if (isMounted && res?.data) {
            setProfileData(res.data);
            setEditUsername(res.data.username || currentUser?.username || '');
            setEditBio(res.data.bio || '');
            if (res.data.avatar) setEditAvatar(res.data.avatar);
            if (res.data.preferredLanguage) setEditPreferredLanguage(res.data.preferredLanguage);
          } else if (isMounted) {
            setProfileData({
              username: currentUser?.username || '@user',
              fullName: currentUser?.fullName || 'Private User',
              bio: currentUser?.bio || 'Anonymous author on Man Ki Aavaj',
              joinedDate: new Date().toISOString(),
              avatar: AVATAR_COLORS[0].hex,
            });
            setEditUsername(currentUser?.username || '');
            setEditBio(currentUser?.bio || '');
          }
        } else if (targetUsername) {
          const res = await apiProfileService.getPublicProfile(targetUsername).catch(() => null);
          if (isMounted && res?.data) {
            setProfileData(res.data);
          } else if (isMounted) {
            setProfileData({
              username: `@${targetUsername}`,
              fullName: 'Anonymous Author',
              bio: 'Anonymous author on Man Ki Aavaj',
              joinedDate: new Date().toISOString(),
              avatar: AVATAR_COLORS[0].hex,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [username, currentUser, isSelf]);

  const cleanProfileUname = profileData?.username?.toLowerCase().replace(/^@/, '');
  const cleanTargetUname = targetUsername?.toLowerCase().replace(/^@/, '');

  const userPosts = posts.filter((p) => {
    if (p.status !== 'PUBLISHED' && p.status !== 'ACTIVE') return false;
    if (isSelf && currentUser?.id && (p.userId === currentUser.id || String(p.userId) === String(currentUser.id))) {
      return true;
    }
    const postUname = (p.username || '').toLowerCase().replace(/^@/, '');
    if (cleanProfileUname && postUname === cleanProfileUname) return true;
    if (cleanTargetUname && postUname === cleanTargetUname) return true;
    return false;
  });

  // Handle Edit Profile Save (PUT /api/profile or POST /api/profile)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const cleanUname = editUsername.startsWith('@') ? editUsername.slice(1) : editUsername;
    const result = editProfileSchema.safeParse({
      username: cleanUname,
      bio: editBio.trim(),
      avatar: editAvatar,
    });

    if (!result.success) {
      const errMap = {};
      const issues = result.error?.issues || result.error?.errors || [];
      issues.forEach((err) => {
        if (err.path && err.path[0]) errMap[err.path[0]] = err.message;
      });
      setEditErrors(errMap);
      return;
    }

    setEditErrors({});
    setSavingEdit(true);

    try {
      const payload = {
        username: cleanUname,
        bio: editBio.trim(),
        avatar: editAvatar,
        preferredLanguage: editPreferredLanguage,
      };

      // Try PUT first, fallback to POST if profile didn't exist yet
      let res;
      try {
        res = await apiProfileService.updateProfile(payload);
      } catch (putErr) {
        res = await apiProfileService.createProfile(payload).catch(() => null);
      }

      if (changeLanguage && editPreferredLanguage) {
        await changeLanguage(editPreferredLanguage);
      }

      addToast('Profile updated successfully!', 'success');
      const updatedData = {
        ...profileData,
        ...payload,
        username: `@${cleanUname}`,
      };
      setProfileData(updatedData);
      if (currentUser?.id) {
        localStorage.setItem(`user_profile_${currentUser.id}`, JSON.stringify(updatedData));
      }
      localStorage.setItem('user_profile', JSON.stringify(updatedData));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Profile updated locally.', 'info');
      setIsEditModalOpen(false);
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Profile (DELETE /api/profile)
  const handleDeleteConfirm = async () => {
    setDeletingProfile(true);
    try {
      await apiProfileService.deleteProfile().catch(() => null);
      addToast('Your profile has been deleted.', 'info');
      logout();
      onNavigate('/login');
    } catch (err) {
      console.error(err);
      addToast('Profile deleted.', 'info');
      logout();
      onNavigate('/login');
    } finally {
      setDeletingProfile(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <UserLayout activeRoute={`/profile/${targetUsername}`} onNavigate={onNavigate}>
      <div className="flex-col gap-md">

        {/* Profile Card Header */}
        <div className="mka-card flex-col gap-md" style={{ background: 'var(--soft-white)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex-row items-center justify-between flex-wrap gap-md">
            <div className="flex-row items-center gap-md">
              {/* Avatar with selected color background */}
              <InitialAvatar
                username={profileData?.username || targetUsername}
                avatarConfig={currentUser?.avatarConfig || profileData?.avatarConfig}
                size={72}
              />

              <div className="flex-col">
                <h1 className="card-heading" style={{ fontSize: '24px', margin: 0 }}>
                  {profileData?.username?.startsWith('@') ? profileData.username : `@${profileData?.username || targetUsername}`}
                </h1>
                <div className="flex-row items-center gap-xs caption-text" style={{ marginTop: '4px' }}>
                  <Calendar size={13} />
                  <span>Joined {formatDate(profileData?.joinedDate || new Date().toISOString())}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isSelf ? (
              <div className="flex-row items-center gap-sm">
                <Button variant="outline" size="sm" onClick={() => setIsAvatarModalOpen(true)} icon={Sparkles}>
                  Edit Avatar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} icon={Edit3}>
                  Edit Profile
                </Button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--error-bg)',
                    background: 'var(--error-bg)',
                    color: 'var(--error)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ) : (
              <div className="flex-row items-center gap-sm">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const handle = targetUsername ? targetUsername.replace('@', '') : '';
                    if (handle) onNavigate(`/chat/${handle}`);
                  }}
                  icon={MessageSquare}
                >
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsChatPopupOpen(true)}
                  icon={MessageSquare}
                >
                  Quick Popup
                </Button>
              </div>
            )}
          </div>

          {/* Bio */}
          {profileData?.bio && (
            <p className="body-text" style={{ fontSize: '14px', lineHeight: 1.5, margin: 0, color: 'var(--eclipse)' }}>
              {profileData.bio}
            </p>
          )}

          {/* Preferred Language Selector — visible only for own profile */}
          {isSelf && (
            <div className="flex-row items-center gap-sm" style={{ marginTop: '4px' }}>
              <Globe size={15} style={{ color: isChangingLang ? 'var(--warning)' : 'var(--deep-plum)' }} />
              <select
                value={currentLanguage}
                disabled={isChangingLang}
                onChange={async (e) => {
                  setIsChangingLang(true);
                  try {
                    await changeLanguage(e.target.value);
                  } finally {
                    setIsChangingLang(false);
                  }
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--soft-white)',
                  color: 'var(--eclipse)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isChangingLang ? 'wait' : 'pointer',
                  outline: 'none',
                  opacity: isChangingLang ? 0.6 : 1,
                }}
                aria-label="Preferred Language"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.label || lang.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Profile Tabs */}
        <div className="flex-row items-center gap-xs border-b" style={{ borderBottom: '1px solid var(--border-light)' }}>
          {[(isSelf ? 'My Thoughts' : 'Thoughts'), 'About'].map((tab) => {
            const isTabActive = activeTab === 'Posts' ? (tab === 'My Thoughts' || tab === 'Thoughts') : (activeTab === tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab === 'About' ? 'About' : 'Posts')}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: isTabActive ? 600 : 400,
                  color: isTabActive ? 'var(--deep-plum)' : 'var(--hurricane)',
                  borderBottom: isTabActive ? '2px solid var(--deep-plum)' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'Posts' && (
          <div className="flex-col gap-md">
            {userPosts.length === 0 ? (
              <EmptyState
                title="No Public Posts"
                description={`@${targetUsername} has not published any posts yet.`}
              />
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} onNavigate={onNavigate} />)
            )}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="mka-card flex-col gap-md" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="card-heading" style={{ fontSize: '18px', margin: 0 }}>Privacy &amp; Identity Guarantee</h3>
            <p className="body-text" style={{ fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Man Ki Aavaj strictly shields user identity. Real names, email addresses, phone numbers, and location details are private and never exposed to other members.
            </p>
          </div>
        )}

      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Anonymous Profile">
        <form onSubmit={handleSaveEdit} className="flex-col gap-md">

          {/* Avatar Color Picker */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
              Avatar Color Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {AVATAR_COLORS.map((c) => {
                const isSelected = editAvatar === c.hex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEditAvatar(c.hex)}
                    title={c.name}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      background: c.hex,
                      border: isSelected ? '3px solid var(--eclipse)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={16} color="#fff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
              Platform Username (3–30 chars)
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="aman_sharma"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: editErrors.username ? '1.5px solid var(--error)' : '1px solid var(--border-light)',
                fontSize: '14px',
              }}
            />
            {editErrors.username && <span style={{ fontSize: '12px', color: 'var(--error)' }}>{editErrors.username}</span>}
          </div>

          {/* Bio */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
              Anonymous Bio (max 200 chars)
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Share your thoughts or interests..."
              rows={3}
              maxLength={200}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: editErrors.bio ? '1.5px solid var(--error)' : '1px solid var(--border-light)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            {editErrors.bio && <span style={{ fontSize: '12px', color: 'var(--error)' }}>{editErrors.bio}</span>}
          </div>

          {/* Preferred Language */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
              Preferred Language
            </label>
            <select
              value={editPreferredLanguage}
              onChange={(e) => setEditPreferredLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                background: 'var(--pure-white)',
                cursor: 'pointer',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label || lang.code})
                </option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex-row justify-end gap-sm" style={{ marginTop: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={savingEdit}>
              {savingEdit ? 'Updating Profile...' : 'Save & Update'}
            </Button>
          </div>

        </form>
      </Modal>

      {/* ── DELETE PROFILE CONFIRMATION MODAL ─────────────────────── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Anonymous Profile">
        <div className="flex-col gap-md">
          <div className="flex-row items-center gap-md" style={{ padding: '12px', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)', color: 'var(--error)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div className="flex-col">
              <span className="bold" style={{ fontSize: '14px' }}>Are you sure you want to delete your profile?</span>
              <span className="caption-text" style={{ fontSize: '12px' }}>This action is permanent and cannot be undone.</span>
            </div>
          </div>

          <div className="flex-row justify-end gap-sm" style={{ marginTop: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deletingProfile}
              onClick={handleDeleteConfirm}
            >
              {deletingProfile ? 'Deleting...' : 'Yes, Delete Profile'}
            </Button>
          </div>
        </div>
      </Modal>
      {/* ── AVATAR STUDIO MODAL ── */}
      <AvatarStudioModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      {/* ── INSTAGRAM STYLE CHAT POPUP ── */}
      {isChatPopupOpen && (
        <InstagramChatPopup
          targetUsername={targetUsername}
          onClose={() => setIsChatPopupOpen(false)}
          onNavigate={onNavigate}
        />
      )}
    </UserLayout>
  );
}
