import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { mockAuthService } from '../../services/mockAuthService.js';
import { Compass, Search, TrendingUp, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function ExplorePage({ onNavigate }) {
  const { posts } = usePosts();
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('Posts'); // Posts, Members
  const [activeTopic, setActiveTopic] = useState('All');

  const topicsList = [
    'All', 'Life', 'Career', 'Relationships', 'Education', 'Personal Growth',
    'Workplace', 'Parenting', 'Technology', 'Creativity', 'Books', 'Entertainment', 'Financial Experiences', 'Positive Thoughts'
  ];

  let displayPosts = posts.filter((p) => p.status === 'PUBLISHED');
  const allUsers = mockAuthService.getUsers();
  let displayUsers = allUsers;

  if (query.trim()) {
    const qLower = query.toLowerCase();
    displayPosts = displayPosts.filter(
      (p) => p.title?.toLowerCase().includes(qLower) || p.content.toLowerCase().includes(qLower) || p.topic.toLowerCase().includes(qLower)
    );
    displayUsers = displayUsers.filter(
      (u) => u.username.toLowerCase().includes(qLower) || u.bio?.toLowerCase().includes(qLower)
    );
  }

  if (activeTopic !== 'All') {
    displayPosts = displayPosts.filter((p) => p.topic === activeTopic);
  }

  return (
    <UserLayout activeRoute="/explore" onNavigate={onNavigate}>
      <div className="flex-col gap-lg">
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
              <div className="flex-row gap-xs flex-wrap">
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
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {displayUsers.map((user) => (
              <div key={user.id} className="mka-card flex-col gap-sm justify-between">
                <div className="flex-row items-center gap-md">
                  <button onClick={() => onNavigate(`/profile/${user.username.replace('@', '')}`)}>
                    <InitialAvatar username={user.username} initials={user.avatarInitials} size={48} />
                  </button>
                  <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
                    <span className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                      {user.username}
                    </span>
                    <p className="secondary-text" style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.bio || 'Anonymous author'}
                    </p>
                  </div>
                </div>

                <div className="flex-row justify-between items-center" style={{ borderTop: '1px solid var(--swiss-coffee)', paddingTop: '10px' }}>
                  <Button variant="secondary" size="sm" onClick={() => onNavigate(`/profile/${user.username.replace('@', '')}`)}>
                    View Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate(`/chat/${user.username.replace('@', '')}`)}
                    icon={MessageSquare}
                  >
                    {t('chatWithUser')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
