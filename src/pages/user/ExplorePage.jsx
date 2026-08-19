import React, { useState, useMemo, useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { apiProfileService } from '../../services/apiProfileService.js';
import { Compass, Search, TrendingUp, Users, MessageSquare, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function ExplorePage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers, mutedUsers = [] } = useReports();
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('Posts'); // Posts, Members
  const [activeTopic, setActiveTopic] = useState('All');
  const [userBios, setUserBios] = useState({});

  const isUserMuted = Boolean(
    (currentUser?.mutedUntil && new Date(currentUser.mutedUntil) > new Date()) ||
    currentUser?.warningCount >= 3 ||
    currentUser?.active === false ||
    currentUser?.isMuted
  );

  const topicsList = [
    'All', 'Life', 'Career', 'Relationships', 'Education', 'Personal Growth',
    'Workplace', 'Parenting', 'Technology', 'Creativity', 'Books', 'Entertainment', 'Financial Experiences', 'Positive Thoughts'
  ];

  let displayPosts = isUserMuted
    ? []
    : posts.filter((p) => {
        if (!p || !p.username) return false;
        const pUnameClean = p.username.toLowerCase().replace('@', '');
        const isBlockedOrMuted =
          blockedUsers.some((b) => b.toLowerCase().replace('@', '') === pUnameClean) ||
          mutedUsers.some((m) => m.toLowerCase().replace('@', '') === pUnameClean) ||
          p.isMuted || p.muted;
        return p.status === 'PUBLISHED' && !isBlockedOrMuted;
      });


  // Extract unique authors dynamically from the real database posts
  const dbUsers = useMemo(() => {
    const uniqueUsersMap = new Map();

    posts.forEach((p) => {
      if (p.username && p.status === 'PUBLISHED') {
        const usernameKey = p.username.toLowerCase();
        
        // Exclude the current logged-in user
        if (currentUser?.username && usernameKey === currentUser.username.toLowerCase()) {
          return;
        }

        if (!uniqueUsersMap.has(usernameKey)) {
          uniqueUsersMap.set(usernameKey, {
            id: `db_user_${p.username.replace('@', '')}`,
            username: p.username,
            avatarInitials: p.avatarInitials || p.username.replace('@', '').slice(0, 2).toUpperCase(),
            avatarConfig: p.avatarConfig,
            bio: '',
          });
        }
      }
    });
    return Array.from(uniqueUsersMap.values());
  }, [posts, currentUser]);

  // Load bios dynamically from database profiles
  useEffect(() => {
    dbUsers.forEach((u) => {
      const usernameClean = u.username.replace('@', '');
      if (usernameClean && !(usernameClean in userBios)) {
        // Set sentinel to prevent duplicate API requests
        setUserBios((prev) => ({ ...prev, [usernameClean]: '...' }));
        apiProfileService.getPublicProfile(usernameClean)
          .then((res) => {
            const bio = res?.data?.bio || res?.bio || 'No bio written yet.';
            setUserBios((prev) => ({ ...prev, [usernameClean]: bio }));
          })
          .catch((err) => {
            console.warn('[ExplorePage] Failed to fetch bio for', usernameClean, err);
            setUserBios((prev) => ({ ...prev, [usernameClean]: 'Anonymous author' }));
          });
      }
    });
  }, [dbUsers, userBios]);

  let displayUsers = dbUsers;

  if (query.trim()) {
    const qLower = query.toLowerCase();
    displayPosts = displayPosts.filter(
      (p) => p.title?.toLowerCase().includes(qLower) || p.content.toLowerCase().includes(qLower) || p.topic.toLowerCase().includes(qLower)
    );
    displayUsers = displayUsers.filter(
      (u) => u.username.toLowerCase().includes(qLower) || 
             (u.bio || userBios[u.username.replace('@', '')] || '').toLowerCase().includes(qLower)
    );
  }

  if (activeTopic !== 'All') {
    displayPosts = displayPosts.filter((p) => p.topic === activeTopic);
  }

  return (
    <UserLayout activeRoute="/explore" onNavigate={onNavigate}>
      <div className="flex-col gap-lg">
        {isUserMuted && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              color: '#DC2626',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <ShieldAlert size={22} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px' }}>Account Muted / Restricted</div>
              <div>Your account is currently muted due to a safety warning. Explore posts are hidden.</div>
            </div>
          </div>
        )}

        {/* Explore Header */}
        <div className="mka-card flex-col gap-md" style={{ background: 'var(--soft-white)' }}>
          <div className="flex-row items-center gap-sm">
            <Compass size={28} style={{ color: 'var(--deep-plum)' }} />
            <div>
              <h1 className="section-heading" style={{ fontSize: '28px' }}>
                {t('explore')} Thoughts & Members
              </h1>
              <p className="secondary-text">Discover perspectives across personal growth, career, and find members anonymously.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-light)',
                background: 'var(--pure-white)',
                fontSize: '15px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* View Switcher: Posts vs Members */}
        <div className="flex-row items-center gap-md border-b" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('Posts')}
            style={{
              padding: '10px 16px',
              fontSize: '15px',
              fontWeight: activeTab === 'Posts' ? 600 : 400,
              color: activeTab === 'Posts' ? 'var(--deep-plum)' : 'var(--hurricane)',
              borderBottom: activeTab === 'Posts' ? '2px solid var(--deep-plum)' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            Posts ({displayPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('Members')}
            style={{
              padding: '10px 16px',
              fontSize: '15px',
              fontWeight: activeTab === 'Members' ? 600 : 400,
              color: activeTab === 'Members' ? 'var(--deep-plum)' : 'var(--hurricane)',
              borderBottom: activeTab === 'Members' ? '2px solid var(--deep-plum)' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            Anonymous Members ({displayUsers.length})
          </button>
        </div>

        {activeTab === 'Posts' && (
          <div className="flex-col gap-md">
            {/* Topic Cards Selector */}
            <div className="flex-col gap-sm">
              <h3 className="card-heading" style={{ fontSize: '16px' }}>
                Browse Topics
              </h3>
              <div className="flex-row explore-topics-row gap-xs" style={{ flexWrap: 'wrap' }}>
                {topicsList.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTopic(t)}
                    className="badge"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: activeTopic === t ? 600 : 400,
                      background: activeTopic === t ? 'var(--deep-plum)' : 'var(--pure-white)',
                      color: activeTopic === t ? 'var(--pure-white)' : 'var(--eclipse)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {displayPosts.length === 0 ? (
              <div className="mka-card p-lg text-center secondary-text">
                No matching discussions found. Try clearing your search query or choosing another topic.
              </div>
            ) : (
              displayPosts.map((post) => <PostCard key={post.id} post={post} onNavigate={onNavigate} />)
            )}
          </div>
        )}

        {activeTab === 'Members' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'flex-start' }}>
            {displayUsers.map((user) => (
              <div
                key={user.id}
                className="mka-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  width: '200px',
                  height: '200px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  flexShrink: 0,
                }}
              >
                {/* Avatar & Info */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <button
                    onClick={() => onNavigate(`/profile/${user.username.replace('@', '')}`)}
                    style={{ display: 'block', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <InitialAvatar username={user.username} initials={user.avatarInitials} size={52} />
                  </button>
                  <div style={{ width: '100%' }}>
                    <span className="bold" style={{ fontSize: '14.0px', color: 'var(--eclipse)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.username}
                    </span>
                    <p
                      className="secondary-text"
                      style={{
                        fontSize: '11.0px',
                        margin: '4px 0 0 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.35',
                        height: '30px',
                      }}
                    >
                      {user.bio || userBios[user.username.replace('@', '')] || 'No bio written yet.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '10px' }}>
                  <button
                    onClick={() => onNavigate(`/profile/${user.username.replace('@', '')}`)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--eclipse)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => onNavigate(`/chat/${user.username.replace('@', '')}`)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: 'var(--deep-plum)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageSquare size={10} /> Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
