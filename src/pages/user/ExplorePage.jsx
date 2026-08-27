import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { apiPostService } from '../../services/apiPostService.js';
import { mapPost } from '../../services/apiMappers.js';
import { TOPIC_CATEGORIES } from '../../utils/topicUtils.js';
import { formatDate } from '../../utils/formatDate.js';
import { 
  Compass, Search, Sparkles, Loader2, CheckCircle2, Filter, X
} from 'lucide-react';

const PAGE_SIZE = 10;

export function ExplorePage({ onNavigate }) {
  const { posts: contextPosts = [], refreshPosts } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers = [], mutedUsers = [] } = useReports();
  const { t } = useLanguage();

  const searchParams = new URLSearchParams(window.location.search);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
  const [activeTopic, setActiveTopic] = useState('All');

  const [paginatedPosts, setPaginatedPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const sensorRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // 300ms Debounce for Hero Search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Standardized Topic Presets matching topicUtils categories & subtopics
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

  // Filter blocked and muted users & deleted/hidden posts
  const isPostVisible = useCallback((p) => {
    if (!p || p.status === 'HIDDEN' || p.status === 'DELETED') return false;
    const authorHandle = (p.username || p.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
    if (!authorHandle) return true;

    const isBlocked = blockedUsers.some((b) => (b || '').toLowerCase().replace(/^@/, '').trim() === authorHandle);
    const isMuted = mutedUsers.some((m) => (m || '').toLowerCase().replace(/^@/, '').trim() === authorHandle);
    return !isBlocked && !isMuted;
  }, [blockedUsers, mutedUsers]);

  // Stable post sorter: primary createdAt DESC, secondary id DESC
  const sortPostsStable = useCallback((items) => {
    return [...items].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      const idA = typeof a.id === 'number' ? a.id : Number(String(a.id).replace(/\D/g, '')) || 0;
      const idB = typeof b.id === 'number' ? b.id : Number(String(b.id).replace(/\D/g, '')) || 0;
      return idB - idA;
    });
  }, []);

  // Merge contextPosts (Page 0 + optimistic real-time posts) with paginatedPosts (Pages 1, 2...)
  const allMergedPosts = useMemo(() => {
    const map = new Map();

    // 1. Add contextPosts (real-time, optimistic, and fresh Page 0 posts)
    (contextPosts || []).forEach((p) => {
      if (isPostVisible(p)) {
        map.set(String(p.id), p);
      }
    });

    // 2. Add paginatedPosts (loaded from infinite scroll pages 1, 2...)
    (paginatedPosts || []).forEach((p) => {
      if (isPostVisible(p) && !map.has(String(p.id))) {
        map.set(String(p.id), p);
      }
    });

    return sortPostsStable(Array.from(map.values()));
  }, [contextPosts, paginatedPosts, isPostVisible, sortPostsStable]);

  // Dynamic calculation of topic statistics from merged posts
  const topicStats = useMemo(() => {
    const statsMap = {};
    TOPIC_PRESETS.forEach(tItem => {
      statsMap[tItem.name] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0 };
    });

    allMergedPosts.forEach(p => {
      if (!p) return;
      const topicName = (p.topic || 'GENERAL').toUpperCase().trim();
      if (!statsMap[topicName]) {
        statsMap[topicName] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0 };
      }
      const stat = statsMap[topicName];
      stat.count += 1;

      const createdAtMs = p.createdAt ? new Date(p.createdAt).getTime() : 0;
      if (createdAtMs > stat.lastPostMs) {
        stat.lastPostMs = createdAtMs;
        stat.lastPostTime = formatDate(p.createdAt);
      }
    });

    return statsMap;
  }, [allMergedPosts, TOPIC_PRESETS]);

  // Filter merged posts by activeTopic and debouncedQuery
  const displayPosts = useMemo(() => {
    return allMergedPosts.filter((p) => {
      if (!p) return false;

      // Topic filter
      if (activeTopic !== 'All' && activeTopic !== 'ALL') {
        const pTopic = (p.topic || p.subtopic || '').toUpperCase();
        if (pTopic !== activeTopic.toUpperCase()) return false;
      }

      // Search query filter
      if (debouncedQuery) {
        const qLower = debouncedQuery.toLowerCase();
        const tMatch = p.title?.toLowerCase().includes(qLower);
        const cMatch = (p.content || p.originalContent || '').toLowerCase().includes(qLower);
        const tpMatch = (p.topic || p.subtopic || '').toLowerCase().includes(qLower);
        const capMatch = (p.caption || '').toLowerCase().includes(qLower);
        if (!tMatch && !cMatch && !tpMatch && !capMatch) return false;
      }

      return true;
    });
  }, [allMergedPosts, activeTopic, debouncedQuery]);

  // Infinite Scroll Paginated Fetch (Pages 1, 2, 3...)
  const fetchNextPage = useCallback(async (targetPage) => {
    if (loadingMore) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingMore(true);

    try {
      const params = {
        page: targetPage,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      if (activeTopic && activeTopic !== 'All' && activeTopic !== 'ALL') {
        params.topic = activeTopic;
      }

      const response = await apiPostService.getPosts(params, { signal: controller.signal });
      const rawContent = response?.data?.content || response?.content || response?.data || [];
      const freshRaw = Array.isArray(rawContent) ? rawContent : [];

      const mappedPosts = freshRaw.map(mapPost).filter(isPostVisible);

      setPaginatedPosts((prev) => {
        const map = new Map(prev.map((p) => [String(p.id), p]));
        mappedPosts.forEach((p) => map.set(String(p.id), p));
        return sortPostsStable(Array.from(map.values()));
      });

      setHasMore(freshRaw.length >= PAGE_SIZE);
      setPage(targetPage);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.error('[ExplorePage] Failed to fetch next explore page:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeTopic, isPostVisible, sortPostsStable, loadingMore]);

  // Revalidate Page 0 & Focus/Visibility Change
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible' && refreshPosts) {
        refreshPosts();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    if (refreshPosts) {
      refreshPosts();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [refreshPosts]);

  // Reset pagination when topic or query changes
  useEffect(() => {
    setPaginatedPosts([]);
    setPage(0);
    setHasMore(true);
    if (refreshPosts) {
      refreshPosts();
    }
  }, [activeTopic, debouncedQuery, refreshPosts]);

  // Infinite Scroll Observer Trigger
  useEffect(() => {
    if (!sensorRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingInitial && !loadingMore) {
          fetchNextPage(page + 1);
        }
      },
      { rootMargin: '300px 0px', threshold: 0.1 }
    );

    observer.observe(sensorRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingInitial, loadingMore, page, fetchNextPage]);

  // Available Top-Level Category Filter Pills
  const CATEGORY_PILLS = [
    { id: 'All', label: t('all', 'All Topics') },
    { id: 'ENTERTAINMENT', label: t('bollywood', 'Bollywood & Movies') },
    { id: 'SPORTS', label: t('cricket', 'Cricket & Sports') },
    { id: 'SOCIETY_POLITICS', label: t('politics', 'Politics & Society') },
    { id: 'GENERAL', label: t('technology', 'Technology & Science') },
    { id: 'LIFE_WORK', label: t('lifeWork', 'Life & Work') },
    { id: 'FEELINGS', label: t('feelings', 'Feelings & Emotions') },
  ];

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
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,209,232,0.15)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', zIndex: 2, position: 'relative' }}>
              <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={32} color="#FFD1E8" />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                  {t('exploreTopicsDiscussions', 'Explore Topics & Discussions')}
                </h1>
                <p style={{ fontSize: '14px', color: '#E0C8D6', margin: '4px 0 0 0', opacity: 0.95 }}>
                  {t('exploreSubtitle', 'Discover unspoken thoughts, search topics, and join conversations across Bollywood, Cricket, Politics, and Tech.')}
                </p>
              </div>
            </div>

            {/* Premium Glass Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '680px', zIndex: 2 }}>
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('searchTopicsPlaceholder', 'Search topics, posts, or keywords...')}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 50px',
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
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6F405F',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* ── CATEGORY FILTER CHIPS BAR ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6F405F', fontWeight: 700, fontSize: '13px', marginRight: '4px', flexShrink: 0 }}>
              <Filter size={16} />
              <span>{t('filter', 'Category')}:</span>
            </div>
            {CATEGORY_PILLS.map((pill) => {
              const isActive = activeTopic.toUpperCase() === pill.id.toUpperCase();
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveTopic(pill.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    border: isActive ? '1.5px solid #6F405F' : '1px solid #E5E0DF',
                    background: isActive ? 'linear-gradient(135deg, #6F405F 0%, #8E527A 100%)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#4A3E3D',
                    boxShadow: isActive ? '0 4px 12px rgba(111,64,95,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* ── SEARCH RESULTS & RECENT POSTS LISTINGS ── */}
          <div id="explore-posts-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--deep-plum)" />
                {t('recentThoughts', 'Recent Thoughts')} {activeTopic !== 'All' ? `under #${t(activeTopic, activeTopic)}` : ''}
              </h3>
              {displayPosts.length > 0 && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hurricane)' }}>
                  Showing {displayPosts.length} posts
                </span>
              )}
            </div>

            {/* Error Message Alert */}
            {error && (
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#FFF0F0', border: '1px solid #FFC0C0', color: '#D32F2F', fontSize: '14px', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Initial Loading Skeleton */}
            {loadingInitial ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
                <Loader2 size={36} color="#6F405F" className="animate-spin" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#6F405F' }}>
                  Discovering recent thoughts...
                </span>
              </div>
            ) : displayPosts.length === 0 ? (
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
              <>
                {displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                  />
                ))}

                {/* Infinite Scroll Sensor & Loading Indicator */}
                <div ref={sensorRef} style={{ height: '20px', margin: '10px 0' }} />

                {loadingMore && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', color: '#6F405F', fontSize: '14px', fontWeight: 600 }}>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading more thoughts...</span>
                  </div>
                )}

                {!hasMore && displayPosts.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px 16px', color: '#8C8385', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 size={18} color="#6F405F" />
                    <span>You’re all caught up! You've reached the end of the explore feed.</span>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </TopicBackgroundRotator>
    </UserLayout>
  );
}
