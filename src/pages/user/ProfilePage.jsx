import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { mockAuthService } from '../../services/mockAuthService.js';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Edit3, Calendar, Globe, Heart, MessageSquare, ShieldAlert } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function ProfilePage({ username, onNavigate }) {
  const { currentUser } = useAuth();
  const { posts } = usePosts();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Posts');

  const targetUsername = username ? (username.startsWith('@') ? username : `@${username}`) : currentUser?.username;
  const isSelf = currentUser?.username.toLowerCase() === targetUsername?.toLowerCase();

  const usersList = mockAuthService.getUsers();
  const profileUser = usersList.find((u) => u.username.toLowerCase() === targetUsername?.toLowerCase()) || currentUser;

  const userPosts = posts.filter((p) => p.username?.toLowerCase() === targetUsername?.toLowerCase() && p.status === 'PUBLISHED');

  return (
    <UserLayout activeRoute={`/profile/${targetUsername?.replace('@', '')}`} onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        {/* Profile Card Header */}
        <div className="mka-card flex-col gap-md" style={{ background: 'var(--soft-white)' }}>
          <div className="flex-row items-center justify-between flex-wrap gap-md">
            <div className="flex-row items-center gap-md">
              <InitialAvatar username={profileUser?.username} initials={profileUser?.avatarInitials} size={64} />
              <div className="flex-col">
                <h1 className="card-heading" style={{ fontSize: '24px' }}>
                  {profileUser?.username}
                </h1>
                <div className="flex-row items-center gap-xs caption-text">
                  <Calendar size={13} />
                  <span>Joined {formatDate(profileUser?.joinedDate || '2026-01-01')}</span>
                  {profileUser?.status && profileUser.status !== 'ACTIVE' && (
                    <span className="badge badge-warning">{profileUser.status}</span>
                  )}
                </div>
              </div>
            </div>

            {isSelf ? (
              <Button variant="outline" size="sm" onClick={() => onNavigate('/edit-profile')} icon={Edit3}>
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate(`/chat/${profileUser?.username.replace('@', '')}`)}
                icon={MessageSquare}
              >
                {t('chatWithUser')}
              </Button>
            )}
          </div>

          {/* Bio */}
          {profileUser?.bio && <p className="body-text">{profileUser.bio}</p>}

          {/* Languages & Interests */}
          <div className="flex-row items-center gap-md flex-wrap" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            {profileUser?.languages?.length > 0 && (
              <div className="flex-row items-center gap-xs caption-text">
                <Globe size={14} style={{ color: 'var(--hurricane)' }} />
                <span>Languages: <strong>{profileUser.languages.join(', ')}</strong></span>
              </div>
            )}

            {profileUser?.interests?.length > 0 && (
              <div className="flex-row items-center gap-xs caption-text">
                <Heart size={14} style={{ color: 'var(--hurricane)' }} />
                <span>Interests:</span>
                <div className="flex-row gap-xs flex-wrap">
                  {profileUser.interests.map((interest) => (
                    <span key={interest} className="badge badge-plum" style={{ fontSize: '11px' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex-row items-center gap-xs border-b" style={{ borderBottom: '1px solid var(--border-light)' }}>
          {['Posts', 'Comments', 'About'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--deep-plum)' : 'var(--hurricane)',
                borderBottom: activeTab === tab ? '2px solid var(--deep-plum)' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Posts' && (
          <div className="flex-col gap-md">
            {userPosts.length === 0 ? (
              <EmptyState
                title="No Public Posts"
                description={`${profileUser?.username} has not published any posts yet.`}
              />
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} onNavigate={onNavigate} />)
            )}
          </div>
        )}

        {activeTab === 'Comments' && (
          <div className="mka-card p-md secondary-text text-center">
            User comment history is private according to privacy preferences.
          </div>
        )}

        {activeTab === 'About' && (
          <div className="mka-card flex-col gap-md">
            <h3 className="card-heading">Privacy & Identity Guarantee</h3>
            <p className="body-text">
              Man Ki Aavaj strictly shields user identity. Real names, email addresses, phone numbers, and location details are private and never exposed to other members.
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
