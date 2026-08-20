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
import { useReports } from '../../context/ReportContext.jsx';
import { Edit3, Trash2, Calendar, Globe, Heart, AlertTriangle, Check, Sparkles, Volume2, VolumeX, ShieldOff, Clock, Flame, MessageSquare, RefreshCw, Info } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { validateUsernameString, getSuggestedNumberVariants } from '../../utils/usernameValidation.js';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { LanguageSelectorDropdown } from '../../components/common/LanguageSelectorDropdown.jsx';
import { SleekCommentSidePanel } from '../../components/posts/SleekCommentSidePanel.jsx';
import { editProfileSchema } from '../../utils/validationSchemas.js';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { AnimatedTopicActivityPanel } from '../../components/topics/AnimatedTopicActivityPanel.jsx';
import { AvatarStudioModal } from '../../components/avatar/AvatarStudioModal.jsx';
import { SYSTEM_TOPICS } from '../../utils/topicUtils.js';

const AVATAR_COLORS = [
  { id: 'plum', hex: '#6F405F', name: 'Deep Plum' },
  { id: 'teal', hex: '#3F7772', name: 'Deep Teal' },
  { id: 'terracotta', hex: '#D96C3D', name: 'Terracotta' },
  { id: 'charcoal', hex: '#2D1D15', name: 'Charcoal' },
  { id: 'emerald', hex: '#2E7D52', name: 'Emerald' },
  { id: 'indigo', hex: '#4A3B6F', name: 'Indigo' },
];

export function ProfilePage({ username, onNavigate }) {
  const { currentUser, updateProfile, deleteAccount, logout } = useAuth();
  const { posts } = usePosts();
  const { addToast } = useToast();
  const { mutedUsers = [], unmuteUser } = useReports();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editAvatarConfig, setEditAvatarConfig] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Avatar Studio Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);

  // Side Panel Comments State
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const targetUsername = username || currentUser?.username?.replace(/^@/, '');
  const isSelf = !username || username.toLowerCase() === currentUser?.username?.toLowerCase().replace(/^@/, '');
  const isTopicRoute = Boolean(targetUsername) && SYSTEM_TOPICS.some((t) => t.toLowerCase() === targetUsername.toLowerCase());

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        if (isSelf) {
          if (currentUser) {
            setProfileData({
              username: currentUser.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@user',
              fullName: currentUser.fullName || 'Private User',
              bio: currentUser.bio || 'Anonymous author on Man Ki Aavaj',
              joinedDate: currentUser.createdAt || new Date().toISOString(),
              avatar: currentUser.avatar || AVATAR_COLORS[0].hex,
              avatarConfig: currentUser.avatarConfig || null,
            });
            setEditUsername(currentUser.username ? currentUser.username.replace(/^@/, '') : '');
            setEditBio(currentUser.bio || '');
            setEditAvatar(currentUser.avatar || AVATAR_COLORS[0].hex);
            setEditAvatarConfig(currentUser.avatarConfig || null);
          } else {
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
          const isTopicRoute = SYSTEM_TOPICS.some((t) => t.toLowerCase() === targetUsername.toLowerCase());
          if (isTopicRoute) {
            if (isMounted) {
              setProfileData({
                username: `#${targetUsername.toUpperCase()}`,
                fullName: `${targetUsername.toUpperCase()} Stream`,
                bio: 'Topic discussion stream on Man Ki Aavaj',
                joinedDate: new Date().toISOString(),
                avatar: AVATAR_COLORS[0].hex,
              });
            }
          } else {
            const res = await apiProfileService.getPublicProfile(targetUsername).catch(() => null);
            if (isMounted && res?.data) {
              setProfileData(res.data);
            } else if (isMounted) {
              setProfileData({
                username: `@${targetUsername}`,
                fullName: 'Public Profile',
                bio: 'Member profile on Man Ki Aavaj',
                joinedDate: new Date().toISOString(),
                avatar: AVATAR_COLORS[0].hex,
              });
            }
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
  }, [username, currentUser, isSelf, targetUsername]);

  const cleanProfileUname = profileData?.username?.toLowerCase().replace(/^@/, '');
  const cleanTargetUname = targetUsername?.toLowerCase().replace(/^@/, '');

  // Filter posts matching topic name or user username
  const userPosts = posts.filter((p) => {
    if (p.status !== 'PUBLISHED' && p.status !== 'ACTIVE') return false;
    if (isSelf && currentUser?.id && (p.userId === currentUser.id || String(p.userId) === String(currentUser.id))) {
      return true;
    }
    const pAuthor = (p.username || p.authorUsername || p.handle || '').toLowerCase().replace(/^@/, '');
    const pTopic = (p.topic || '').toLowerCase();

    if (cleanTargetUname && (pAuthor === cleanTargetUname || pTopic === cleanTargetUname)) {
      return true;
    }
    if (cleanProfileUname && (pAuthor === cleanProfileUname || pTopic === cleanProfileUname)) {
      return true;
    }
    return false;
  });

  const lastPostTime = userPosts.length > 0 && userPosts[0].createdAt
    ? formatDate(userPosts[0].createdAt)
    : 'Recently updated';

  const getDaysLeftForChange = () => {
    const userId = currentUser?.id || currentUser?.userId;
    const lastChangeStr = currentUser?.lastUsernameChangeDate || (userId ? localStorage.getItem(`last_username_change_${userId}`) : null);
    if (!lastChangeStr) return 0;
    const lastChange = new Date(lastChangeStr).getTime();
    if (isNaN(lastChange)) return 0;
    const elapsedDays = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(14 - elapsedDays);
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeftForChange = getDaysLeftForChange();

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const result = editProfileSchema.safeParse({
      username: editUsername,
      bio: editBio,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });
      setEditErrors(fieldErrors);
      return;
    }

    setEditErrors({});
    setSavingEdit(true);

    try {
      const updatedUser = await updateProfile({
        username: editUsername.trim(),
        bio: editBio.trim(),
        avatar: editAvatar,
        avatarConfig: editAvatarConfig,
      });

      setProfileData((prev) => ({
        ...prev,
        username: `@${updatedUser.username}`,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        avatarConfig: updatedUser.avatarConfig,
      }));

      setIsEditModalOpen(false);
      addToast('Profile details updated successfully.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProfile = async () => {
    setDeletingProfile(true);
    try {
      await deleteAccount();
      addToast('Profile deleted successfully.', 'success');
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
    <UserLayout activeRoute={`/profile/${targetUsername}`} onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName={targetUsername || 'GENERAL'}>
        <div className="flex-col gap-md" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

          {/* ── 1. TOPIC OR USER PROFILE DETAIL BANNER ── */}
          <div
            style={{
              padding: '24px 20px',
              backgroundColor: '#3D2B24',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #4D3830',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <InitialAvatar
                username={targetUsername || 'USER'}
                avatarConfig={profileData?.avatarConfig}
                size={68}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                    {isTopicRoute
                      ? `#${t((targetUsername || 'GENERAL').toUpperCase(), (targetUsername || 'GENERAL').toUpperCase())}`
                      : (targetUsername ? `@${targetUsername.replace(/^@/, '')}` : '@user')}
                  </h1>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: isTopicRoute ? '#D96C3D' : '#3F7772', color: '#FFFFFF', textTransform: 'uppercase' }}>
                    {isTopicRoute ? t('trendingTopic', 'Trending Topic') : t('authorProfile', 'Author Profile')}
                  </span>
                </div>

                {!isTopicRoute && profileData?.bio && (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    {profileData.bio}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.92)', marginTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} />
                    <span>{t('lastPost', 'Last post')} {lastPostTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Flame size={14} />
                    <span>{userPosts.length} {t('thoughtsShared', 'Thoughts shared')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Topic Create button for Topics, Edit/Mute buttons for User Profiles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isTopicRoute ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate(`/home?create=true&topic=${encodeURIComponent((targetUsername || 'GENERAL').toUpperCase())}`)}
                >
                  {t('addYourThought', '+ Add Your Thought')}
                </Button>
              ) : (
                isSelf ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LanguageSelectorDropdown compact={false} />
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '20px',
                        background: '#FFFFFF',
                        color: '#6F405F',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Edit3 size={15} />
                      <span>{t('editProfile', 'Edit Profile')}</span>
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToast(`Muted posts from @${targetUsername}`, 'info')}
                    style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFF' }}
                  >
                    Mute Handle
                  </Button>
                )
              )}
            </div>
          </div>

          {/* ── 2. FULL-WIDTH POSTS FEED (RIGHT SIDE COMMENT BOX & EXTRA TOPICS STREAM REMOVED) ── */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1.5px solid #EDE8E6',
                paddingBottom: '2px',
                height: '38px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setActiveTab('Posts')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === 'Posts' ? 700 : 500,
                  color: activeTab === 'Posts' ? '#6F405F' : '#6E625F',
                  borderBottom: activeTab === 'Posts' ? '2.5px solid #6F405F' : 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isTopicRoute ? `${t('topicPosts', 'Topic Posts')} (${userPosts.length})` : `${t('myPosts', 'User Thoughts')} (${userPosts.length})`}
              </button>

              {isSelf && (
                <button
                  onClick={() => setActiveTab('Muted')}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: activeTab === 'Muted' ? 700 : 500,
                    color: activeTab === 'Muted' ? '#6F405F' : '#6E625F',
                    borderBottom: activeTab === 'Muted' ? '2.5px solid #6F405F' : 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Muted Handles ({mutedUsers.length})
                </button>
              )}
            </div>

            {/* Tab Content: Posts Stream */}
            {activeTab === 'Posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {userPosts.length === 0 ? (
                  <EmptyState
                    title={t('noThoughtsTopicYet', 'No thoughts under this topic yet')}
                    description={t('beFirstAuthor', 'Be the first author to post a thought under this topic category.')}
                    icon={Calendar}
                  />
                ) : (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onNavigate={onNavigate}
                      onToggleComments={() => {
                        if (activeCommentsPost?.id === post.id) setActiveCommentsPost(null);
                        else setActiveCommentsPost(post);
                      }}
                      activeCommentsPostId={activeCommentsPost?.id}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'Muted' && isSelf && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {mutedUsers.length === 0 ? (
                  <EmptyState title="No muted handles" description="Handles you mute will appear here." icon={VolumeX} />
                ) : (
                  mutedUsers.map((handle) => (
                    <div
                      key={handle}
                      className="mka-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--eclipse)' }}>
                        {handle.startsWith('@') ? handle : `@${handle}`}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => unmuteUser(handle)}>
                        Unmute
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </TopicBackgroundRotator>


      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleSaveEdit} className="flex-col gap-md">
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', display: 'block', marginBottom: '6px' }}>
              Anonymous Handle (Editable Input Field)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px', fontWeight: 800, color: '#6F405F' }}>@</span>
                  <input
                    type="text"
                    value={editUsername}
                    disabled={daysLeftForChange > 0}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^@/, '');
                      setEditUsername(val);
                      const err = validateUsernameString(val, currentUser?.fullName);
                      setEditErrors((prev) => ({ ...prev, username: err }));
                    }}
                    placeholder="captainamerica or cyberninja"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 28px',
                      borderRadius: '10px',
                      border: editErrors.username ? '1.5px solid #B33A3A' : '1.5px solid #6F405F',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      backgroundColor: daysLeftForChange > 0 ? '#F5EFF3' : '#FFFFFF',
                      color: daysLeftForChange > 0 ? '#8C8385' : '#2D1D15',
                      cursor: daysLeftForChange > 0 ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
                <button
                  type="button"
                  disabled={daysLeftForChange > 0}
                  onClick={() => {
                    if (daysLeftForChange > 0) {
                      addToast(`Handle can only be changed once every 14 days. Available in ${daysLeftForChange} days.`, 'info');
                      return;
                    }
                    const newSuggestions = generateUsernameSuggestions(1);
                    if (newSuggestions.length > 0) {
                      const uname = newSuggestions[0].replace('@', '');
                      setEditUsername(uname);
                      setEditErrors((prev) => ({ ...prev, username: null }));
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: daysLeftForChange > 0 ? '#C4B9BE' : '#6F405F',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* Validation Error Message */}
              {editErrors.username && (
                <div style={{ fontSize: '11.5px', color: '#B33A3A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} color="#B33A3A" />
                  <span>{editErrors.username}</span>
                </div>
              )}

              {/* Suggested Number Variants Pills */}
              {editUsername && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#6F405F', fontWeight: 700 }}>Suggestions:</span>
                  {getSuggestedNumberVariants(editUsername, 3).map((numSug) => (
                    <button
                      key={numSug}
                      type="button"
                      disabled={daysLeftForChange > 0}
                      onClick={() => {
                        setEditUsername(numSug);
                        setEditErrors((prev) => ({ ...prev, username: null }));
                      }}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6F405F',
                        background: '#F3EBF0',
                        border: '1px solid rgba(111, 64, 95, 0.25)',
                        cursor: daysLeftForChange > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      @{numSug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 14-Day Cooldown Note */}
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: daysLeftForChange > 0 ? '#B33A3A' : '#6E625F', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Info size={13} style={{ color: daysLeftForChange > 0 ? '#B33A3A' : '#6F405F', flexShrink: 0 }} />
              <span>
                {daysLeftForChange > 0
                  ? t('usernameCooldownLeft', `Note: Anonymous handle can only be updated once every 14 days. Next change available in ${daysLeftForChange} days.`)
                  : t('usernameCooldownNote', 'Note: You get 1 free edit after onboarding. Subsequent edits require a 14-day wait.')}
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', display: 'block', marginBottom: '4px' }}>
              Bio / Tagline
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4CECC', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={savingEdit || Boolean(editErrors.username) || (daysLeftForChange > 0 && editUsername !== profileData?.username?.replace(/^@/, ''))}
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Avatar Studio Modal */}
      {isAvatarModalOpen && (
        <AvatarStudioModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentUsername={currentUser?.username || '@user'}
          currentConfig={currentUser?.avatarConfig}
          onSave={async (newConfig) => {
            await updateProfile({ avatarConfig: newConfig });
            setEditAvatarConfig(newConfig);
            setProfileData((prev) => ({ ...prev, avatarConfig: newConfig }));
            setIsAvatarModalOpen(false);
          }}
        />
      )}
    </UserLayout>
  );
}
