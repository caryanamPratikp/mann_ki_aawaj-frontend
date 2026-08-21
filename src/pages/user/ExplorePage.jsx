import React, { useState, useMemo } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { 
  Compass, Search, Flame, Clock, Sparkles, Tag, Film, Trophy, 
  Cpu, Landmark, Clapperboard, HeartPulse, Dumbbell, Newspaper, Users, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
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
  const [hoveredTopic, setHoveredTopic] = useState(null);

  const TOPIC_PRESETS = [
    { name: 'BOLLYWOOD', category: 'Entertainment', categoryKey: 'ENTERTAINMENT_CAT', icon: Film, accent: '#E5A93C', gradient: 'linear-gradient(135deg, rgba(229,169,60,0.12) 0%, #FFFFFF 100%)' },
    { name: 'CRICKET', category: 'Sports', categoryKey: 'SPORTS_CAT', icon: Trophy, accent: '#2E7D32', gradient: 'linear-gradient(135deg, rgba(46,125,50,0.12) 0%, #FFFFFF 100%)' },
    { name: 'TECHNOLOGY', category: 'Innovation', categoryKey: 'INNOVATION_CAT', icon: Cpu, accent: '#7B1FA2', gradient: 'linear-gradient(135deg, rgba(123,31,162,0.12) 0%, #FFFFFF 100%)' },
    { name: 'POLITICS', category: 'News', categoryKey: 'NEWS_CAT', icon: Landmark, accent: '#C62828', gradient: 'linear-gradient(135deg, rgba(198,40,40,0.12) 0%, #FFFFFF 100%)' },
    { name: 'ENTERTAINMENT', category: 'Media', categoryKey: 'MEDIA_CAT', icon: Clapperboard, accent: '#AD1457', gradient: 'linear-gradient(135deg, rgba(173,20,87,0.12) 0%, #FFFFFF 100%)' },
    { name: 'LIFESTYLE', category: 'Personal', categoryKey: 'PERSONAL_CAT', icon: HeartPulse, accent: '#D81B60', gradient: 'linear-gradient(135deg, rgba(216,27,96,0.12) 0%, #FFFFFF 100%)' },
    { name: 'SPORTS', category: 'Fitness', categoryKey: 'FITNESS_CAT', icon: Dumbbell, accent: '#00838F', gradient: 'linear-gradient(135deg, rgba(0,131,143,0.12) 0%, #FFFFFF 100%)' },
    { name: 'NEWS', category: 'Current Affairs', categoryKey: 'CURRENT_AFFAIRS_CAT', icon: Newspaper, accent: '#1565C0', gradient: 'linear-gradient(135deg, rgba(21,101,192,0.12) 0%, #FFFFFF 100%)' },
    { name: 'GENERAL', category: 'Community', categoryKey: 'COMMUNITY_CAT', icon: Users, accent: '#6F405F', gradient: 'linear-gradient(135deg, rgba(111,64,95,0.12) 0%, #FFFFFF 100%)' },
  ];

  // Dynamic calculation of topic statistics strictly from real posts
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

    // Apply NEW or TRENDING badges if real posts exist
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
        <div className="flex-col gap-lg" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* ── HERO DISCOVERY HEADER & GLASS SEARCH ── */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #6F405F 0%, #4A2B40 50%, #2D1D15 100%)', 
              borderRadius: '24px', 
              padding: '32px 28px',
              color: '#FFFFFF',
              boxShadow: '0 12px 36px rgba(45,29,21,0.22)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,209,232,0.15)', borderRadius: '50%', blur: '40px', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', zIndex: 2, position: 'relative' }}>
              <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={32} color="#FFD1E8" />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, tracking: '-0.02em' }}>
                  {t('exploreTopicsDiscussions', 'Explore Topics & Discussions')}
                </h1>
                <p style={{ fontSize: '14px', color: '#E0C8D6', margin: '4px 0 0 0', opacity: 0.95 }}>
                  {t('exploreSubtitle', 'Search topics, view last post timestamps, and join conversations across Bollywood, Cricket, Politics, and Tech.')}
                </p>
              </div>
            </div>

            {/* Premium Glass Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '680px', zIndex: 2 }}>
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchTopicsPlaceholder', 'Search topics (e.g. Bollywood, Cricket, Technology)...')}
                style={{
                  width: '100%',
                  padding: '14px 18px 14px 50px',
                  borderRadius: '30px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2D1D15',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* ── FEATURED TOPIC CARDS GRID ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag size={22} color="var(--deep-plum)" /> {t('featuredTopics', 'Featured Topics')}
              </h3>
              {activeTopic !== 'All' && (
                <button
                  onClick={() => setActiveTopic('All')}
                  style={{ 
                    fontSize: '13px', 
                    fontWeight: 700, 
                    color: 'var(--deep-plum)', 
                    background: 'var(--deep-plum-light)', 
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t('clearTopicFilter', 'Clear Topic Filter')} ({t(activeTopic, activeTopic)})
                </button>
              )}
            </div>

            {/* Generous Responsive Grid with minmax(230px, 1fr) so text never overflows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
              {filteredTopicPresets.map((tItem) => {
                const Icon = tItem.icon;
                const stat = topicStats[tItem.name] || { count: 0, lastPostTime: 'No posts yet', isNew: false, isTrending: false };
                const isSelected = activeTopic === tItem.name;
                const isHovered = hoveredTopic === tItem.name;

                return (
                  <div
                    key={tItem.name}
                    onMouseEnter={() => setHoveredTopic(tItem.name)}
                    onMouseLeave={() => setHoveredTopic(null)}
                    onClick={() => {
                      const nextTopic = isSelected ? 'All' : tItem.name;
                      setActiveTopic(nextTopic);
                      setTimeout(() => {
                        document.getElementById('explore-posts-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 80);
                    }}
                    style={{
                      padding: '20px',
                      borderRadius: '20px',
                      background: isSelected 
                        ? `linear-gradient(135deg, rgba(111,64,95,0.15) 0%, #FFFFFF 100%)`
                        : tItem.gradient,
                      border: isSelected 
                        ? '2.5px solid var(--deep-plum)' 
                        : isHovered 
                        ? `2px solid ${tItem.accent}` 
                        : '1.5px solid rgba(111,64,95,0.12)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transform: isHovered ? 'translateY(-4px)' : 'none',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected
                        ? '0 10px 30px rgba(111,64,95,0.22)'
                        : isHovered
                        ? `0 12px 28px ${tItem.accent}25`
                        : '0 4px 16px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div>
                      {/* Top Header: Category Label & Icon */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '10px', 
                              backgroundColor: `${tItem.accent}20`, 
                              color: tItem.accent, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--hurricane)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {t(tItem.categoryKey, tItem.category)}
                          </span>
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {stat.isTrending && (
                            <span 
                              style={{ 
                                fontSize: '10px', 
                                fontWeight: 800, 
                                padding: '3px 8px', 
                                borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #FF6B35 0%, #D96C3D 100%)', 
                                color: '#FFF',
                                boxShadow: '0 2px 6px rgba(255,107,53,0.3)',
                              }}
                            >
                              🔥 {t('trending', 'TRENDING')}
                            </span>
                          )}
                          {stat.isNew && !stat.isTrending && (
                            <span 
                              style={{ 
                                fontSize: '10px', 
                                fontWeight: 800, 
                                padding: '3px 8px', 
                                borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #3F7772 0%, #2E5854 100%)', 
                                color: '#FFF',
                                boxShadow: '0 2px 6px rgba(63,119,114,0.3)',
                              }}
                            >
                              ✨ {t('new', 'NEW')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Topic Name */}
                      <h4 
                        style={{ 
                          fontSize: '18px', 
                          fontWeight: 800, 
                          color: isSelected ? 'var(--deep-plum)' : 'var(--eclipse)', 
                          margin: 0,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        #{t(tItem.name, tItem.name)}
                      </h4>
                    </div>

                    {/* Stats Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--hurricane)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} color="var(--hurricane)" />
                        <span style={{ fontSize: '11.5px' }}>{stat.lastPostTime}</span>
                      </div>
                      <span 
                        style={{ 
                          fontWeight: 800, 
                          color: isSelected ? '#FFFFFF' : 'var(--deep-plum)', 
                          backgroundColor: isSelected ? 'var(--deep-plum)' : 'var(--deep-plum-light)',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                        }}
                      >
                        {stat.count} {t('posts', 'posts')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SEARCH RESULTS & POST LISTINGS ── */}
          <div id="explore-posts-section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', scrollMarginTop: '90px', marginTop: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--deep-plum)" />
                  {t('recentThoughts', 'Recent Thoughts')} {activeTopic !== 'All' ? `under #${t(activeTopic, activeTopic)}` : ''} ({displayPosts.length})
                </h3>
              </div>

              {displayPosts.length === 0 ? (
                <div 
                  className="mka-card text-center secondary-text" 
                  style={{ 
                    padding: '48px 24px', 
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Compass size={40} color="var(--hurricane)" style={{ opacity: 0.5 }} />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--eclipse)' }}>
                    {t('noThoughtsFound', 'No thoughts found')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--hurricane)' }}>
                    {t('firstToShare', 'Be the first to share an unspoken thought on this topic!')}
                  </div>
                </div>
              ) : (
                displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </TopicBackgroundRotator>
    </UserLayout>
  );
}
