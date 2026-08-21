import React, { useState, useMemo } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { Compass, Search, Flame, Clock, Sparkles, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SleekCommentSidePanel } from '../../components/posts/SleekCommentSidePanel.jsx';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { formatDate } from '../../utils/formatDate.js';

export function ExplorePage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers, mutedUsers = [] } = useReports();
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTopic, setActiveTopic] = useState('All');
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);

  const TOPIC_PRESETS = [
    { name: 'BOLLYWOOD', category: 'Entertainment', categoryKey: 'ENTERTAINMENT_CAT' },
    { name: 'CRICKET', category: 'Sports', categoryKey: 'SPORTS_CAT' },
    { name: 'TECHNOLOGY', category: 'Innovation', categoryKey: 'INNOVATION_CAT' },
    { name: 'POLITICS', category: 'News', categoryKey: 'NEWS_CAT' },
    { name: 'ENTERTAINMENT', category: 'Media', categoryKey: 'MEDIA_CAT' },
    { name: 'LIFESTYLE', category: 'Personal', categoryKey: 'PERSONAL_CAT' },
    { name: 'SPORTS', category: 'Fitness', categoryKey: 'FITNESS_CAT' },
    { name: 'NEWS', category: 'Current Affairs', categoryKey: 'CURRENT_AFFAIRS_CAT' },
    { name: 'GENERAL', category: 'Community', categoryKey: 'COMMUNITY_CAT' },
  ];

  // Dynamic calculation of topic statistics strictly from real posts (No dummy labels!)
  const topicStats = useMemo(() => {
    const statsMap = {};
    TOPIC_PRESETS.forEach(tItem => {
      statsMap[tItem.name] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0, isNew: false, isTrending: false };
    });

    posts.forEach(p => {
      if (!p) return;
      const topicName = (p.topic || 'GENERAL').toUpperCase().trim();
      if (!statsMap[topicName]) {
        statsMap[topicName] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0, isNew: false, isTrending: false };
      }
      const stat = statsMap[topicName];
      stat.count += 1;

      const createdAtMs = p.createdAt ? new Date(p.createdAt).getTime() : 0;
      if (createdAtMs > stat.lastPostMs) {
        stat.lastPostMs = createdAtMs;
        stat.lastPostTime = formatDate(p.createdAt);
      }
    });

    // Only apply NEW or TRENDING badges if real posts exist (> 0)
    Object.values(statsMap).forEach(stat => {
      if (stat.count > 0) {
        stat.isNew = true;
        stat.isTrending = stat.count >= 2;
      } else {
        stat.isNew = false;
        stat.isTrending = false;
      }
    });

    return statsMap;
  }, [posts]);

  // Filter posts
  let displayPosts = posts.filter((p) => {
    if (!p) return false;
    const authorHandle = (p.username || p.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
    const isBlockedOrMuted =
      Boolean(authorHandle) && (
        blockedUsers.some((b) => (b || '').toLowerCase().replace(/^@/, '').trim() === authorHandle) ||
        mutedUsers.some((m) => (m || '').toLowerCase().replace(/^@/, '').trim() === authorHandle)
      );
    return p.status === 'PUBLISHED' && !isBlockedOrMuted;
  });

  if (query.trim()) {
    const qLower = query.toLowerCase();
    displayPosts = displayPosts.filter(
      (p) => p.title?.toLowerCase().includes(qLower) || p.content.toLowerCase().includes(qLower) || p.topic.toLowerCase().includes(qLower)
    );
  }

  if (activeTopic !== 'All') {
    displayPosts = displayPosts.filter((p) => (p.topic || '').toUpperCase() === activeTopic.toUpperCase());
  }

  // Filter topic cards by search query
  const filteredTopicPresets = TOPIC_PRESETS.filter(tItem => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const translatedName = t(tItem.name, tItem.name).toLowerCase();
    return tItem.name.toLowerCase().includes(q) || translatedName.includes(q) || tItem.category.toLowerCase().includes(q);
  });

  return (
    <UserLayout activeRoute="/explore" onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName="EXPLORE">
        <div className="flex-col gap-lg" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Explore Header & Search */}
          <div className="mka-card" style={{ background: '#FFFDFB', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Compass size={32} style={{ color: 'var(--deep-plum)' }} />
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
                  {t('exploreTopicsDiscussions', 'Explore Topics & Discussions')}
                </h1>
                <p style={{ fontSize: '13.5px', color: 'var(--hurricane)', margin: '4px 0 0 0' }}>
                  {t('exploreSubtitle', 'Search topics, view last post timestamps, and join conversations across Bollywood, Cricket, Politics, and Tech.')}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchTopicsPlaceholder', 'Search topics (e.g. Bollywood, Cricket, Technology)...')}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-light)',
                  background: 'var(--pure-white)',
                  fontSize: '14.5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* ── TOPIC OPTIONS & DISCOVERY GRID ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="var(--deep-plum)" /> {t('featuredTopics', 'Featured Topics')}
              </h3>
              {activeTopic !== 'All' && (
                <button
                  onClick={() => setActiveTopic('All')}
                  style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--deep-plum)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {t('clearTopicFilter', 'Clear Topic Filter')} ({t(activeTopic, activeTopic)})
                </button>
              )}
            </div>

            {/* Topic Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '12px' }}>
              {filteredTopicPresets.map((tItem) => {
                const stat = topicStats[tItem.name] || { count: 0, lastPostTime: 'No posts yet', isNew: false, isTrending: false };
                const isSelected = activeTopic === tItem.name;

                return (
                  <div
                    key={tItem.name}
                    onClick={() => {
                      const nextTopic = isSelected ? 'All' : tItem.name;
                      setActiveTopic(nextTopic);
                      setTimeout(() => {
                        document.getElementById('explore-posts-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 80);
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      backgroundColor: isSelected ? 'var(--deep-plum-light)' : '#FFFFFF',
                      border: isSelected ? '2px solid var(--deep-plum)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--hurricane)', textTransform: 'uppercase' }}>
                          {t(tItem.categoryKey, tItem.category)}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {stat.isTrending && (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', background: '#D96C3D', color: '#FFF' }}>
                              {t('trending', 'TRENDING')}
                            </span>
                          )}
                          {stat.isNew && (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', background: '#3F7772', color: '#FFF' }}>
                              {t('new', 'NEW')}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
                        #{t(tItem.name, tItem.name)}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--hurricane)', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        <span>{stat.lastPostTime}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--deep-plum)' }}>
                        {stat.count} {t('posts', 'posts')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SEARCH RESULTS / POST LISTING ── */}
          <div id="explore-posts-section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', scrollMarginTop: '90px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--eclipse)', margin: 0 }}>
                {t('recentThoughts', 'Recent Thoughts')} {activeTopic !== 'All' ? `under #${t(activeTopic, activeTopic)}` : ''} ({displayPosts.length})
              </h3>

              {displayPosts.length === 0 ? (
                <div className="mka-card text-center secondary-text" style={{ padding: '36px', background: '#FFF' }}>
                  {t('noThoughtsFound', 'No thoughts found')}
                </div>
              ) : (
                displayPosts.map((post) => (
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

            {activeCommentsPost && (
              <SleekCommentSidePanel
                post={activeCommentsPost}
                onClose={() => setActiveCommentsPost(null)}
                onNavigate={onNavigate}
              />
            )}
          </div>

        </div>
      </TopicBackgroundRotator>
    </UserLayout>
  );
}
