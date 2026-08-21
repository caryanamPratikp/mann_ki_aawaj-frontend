import React, { useState, useEffect, useMemo } from 'react';
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
import { TOPIC_CATEGORIES, SYSTEM_TOPICS } from '../../utils/topicUtils.js';

export function ExplorePage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers, mutedUsers = [] } = useReports();
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTopic, setActiveTopic] = useState('All');
  const [hoveredTopic, setHoveredTopic] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Standardized Topic Presets matching HomePage categories & subtopics 100%
  const TOPIC_PRESETS = useMemo(() => {
    const presets = [];
    TOPIC_CATEGORIES.forEach((cat) => {
      cat.subtopics.forEach((sub) => {
        presets.push({
          name: sub.id,
          label: sub.label,
          category: cat.name,
          categoryKey: cat.categoryKey,
          icon: sub.icon,
          accent: cat.accent,
          gradient: cat.gradient,
        });
      });
    });
    return presets;
  }, []);

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

          {/* ── CREATIVE COMPACT TOPIC CATEGORIES MATRIX ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header & Active Topic Filter Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag size={22} color="var(--deep-plum)" /> {t('exploreCategories', 'Explore Topic Channels')}
              </h3>
              {activeTopic !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveTopic('All')}
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#6F405F',
                    background: 'rgba(111,64,95,0.12)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(111,64,95,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ✕ {t('clearFilter', 'Clear Filter')} ({activeTopic})
                </button>
              )}
            </div>

            {/* Compact Category Cards Grid (7 Categories total) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {TOPIC_CATEGORIES.map((cat) => {
                const catMatchesQuery = !query.trim() || 
                  cat.name.toLowerCase().includes(query.toLowerCase()) ||
                  cat.subtopics.some(s => s.label.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()));

                if (!catMatchesQuery) return null;

                return (
                  <div
                    key={cat.categoryKey}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '20px',
                      background: cat.gradient,
                      border: `1.5px solid ${cat.accent}30`,
                      boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${cat.accent}20`, paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            backgroundColor: `${cat.accent}20`,
                            color: cat.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 800,
                          }}
                        >
                          {cat.subtopics[0]?.icon || '💡'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
                            {t(cat.categoryKey, cat.name)}
                          </h4>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#8C8385' }}>
                            {cat.subtopics.length} {t('topics', 'topics')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Subtopic Chips Array */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cat.subtopics.map((sub) => {
                        const isSelected = activeTopic.toUpperCase() === sub.id.toUpperCase();
                        const isQueryMatch = query.trim() && (
                          sub.label.toLowerCase().includes(query.toLowerCase()) || 
                          sub.id.toLowerCase().includes(query.toLowerCase())
                        );

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              const nextTopic = isSelected ? 'All' : sub.id;
                              setActiveTopic(nextTopic);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12.5px',
                              fontWeight: isSelected || isQueryMatch ? 800 : 600,
                              color: isSelected ? '#FFFFFF' : '#2D1D15',
                              backgroundColor: isSelected
                                ? cat.accent
                                : isQueryMatch
                                ? `${cat.accent}25`
                                : '#FFFFFF',
                              border: isSelected
                                ? `1.5px solid ${cat.accent}`
                                : `1px solid ${cat.accent}35`,
                              cursor: 'pointer',
                              boxShadow: isSelected ? `0 4px 12px ${cat.accent}40` : '0 2px 6px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{sub.icon}</span>
                            <span>{t(sub.id, sub.label)}</span>
                          </button>
                        );
                      })}
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
