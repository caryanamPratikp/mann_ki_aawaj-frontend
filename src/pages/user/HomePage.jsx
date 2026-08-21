import React, { useState, useMemo, useEffect } from 'react';

import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { 
  Heart, Feather, Briefcase, Landmark, Film, Trophy, Compass, 
  Search, PlusSquare, Sparkles, ChevronRight, UserCheck, Flame
} from 'lucide-react';
import { TOPIC_CATEGORIES, saveCustomTopic, computeTopicStats, getCustomTopics, syncTopicsWithDatabase } from '../../utils/topicUtils.js';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';

const CATEGORY_ICONS = {
  Heart: Heart,
  Feather: Feather,
  Briefcase: Briefcase,
  Landmark: Landmark,
  Film: Film,
  Trophy: Trophy,
  Compass: Compass,
  UserCheck: UserCheck,
};

function TranslatedTopicText({ text, fallbackKey }) {
  const { t, currentLanguage, translateTextAsync } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;
    if (!text) return;

    const rawStr = String(text);
    const keyCandidate = fallbackKey || rawStr.replace(/\s+/g, '');

    const dictValue = t(keyCandidate) || t(keyCandidate.toLowerCase()) || t(rawStr) || t(rawStr.toLowerCase());
    if (dictValue && dictValue !== keyCandidate && dictValue !== keyCandidate.toLowerCase() && dictValue !== rawStr) {
      if (isMounted) setTranslated(dictValue);
      return;
    }

    if (!currentLanguage || currentLanguage === 'English') {
      if (isMounted) setTranslated(rawStr);
      return;
    }

    if (translateTextAsync) {
      translateTextAsync(rawStr, currentLanguage)
        .then((res) => {
          if (isMounted && res) setTranslated(res);
        })
        .catch(() => {
          if (isMounted) setTranslated(rawStr);
        });
    }

    return () => { isMounted = false; };
  }, [text, fallbackKey, currentLanguage, t, translateTextAsync]);

  return <>{translated || text}</>;
}

export function HomePage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [activeCategoryTab, setActiveCategoryTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    syncTopicsWithDatabase();
  }, []);



  const EMOJI_PRESETS = [
    '💡', '🧘', '🚀', '🎭', '🧠', '🎨', '🎵', '📚', '🏆', '💻', 
    '🔮', '🍿', '☕', '🎮', '🌿', '✈️', '💬', '✨', '🔥', '💖', 
    '🤫', '🌟', '🎯', '⚡', '👑', '🌈', '🍀', '🍕', '🎉', '🥊'
  ];


  // Compute live stats per topic from real posts in DB
  const topicStatsMap = useMemo(() => {
    const statsList = computeTopicStats(posts);
    const map = {};
    statsList.forEach(st => {
      map[st.name] = st;
    });
    return map;
  }, [posts]);

  // List of user created custom topics
  const customTopicNames = useMemo(() => {
    return getCustomTopics();
  }, [isCreateTopicModalOpen]);

  // Dynamically sort categories & subtopics based on interaction (Posts > 0 on 1st place, inactive user topics at bottom)
  const displayedCategories = useMemo(() => {
    let baseCategories = [...TOPIC_CATEGORIES];

    // Filter by active category tab if selected
    if (activeCategoryTab !== 'All') {
      baseCategories = baseCategories.filter(cat => 
        cat.name.toLowerCase() === activeCategoryTab.toLowerCase() || 
        cat.categoryKey === activeCategoryTab
      );
    }

    // Separate user custom topics into active (has posts) vs inactive (0 posts)
    const activeCustomSubtopics = [];
    const inactiveCustomSubtopics = [];

    customTopicNames.forEach((tObj) => {
      const topicId = typeof tObj === 'string' ? tObj : (tObj.id || tObj.name);
      const topicLabel = typeof tObj === 'string' ? tObj : (tObj.label || tObj.name);
      const topicIcon = typeof tObj === 'string' ? '💡' : (tObj.icon || '💡');

      const stat = topicStatsMap[topicId] || { count: 0, isTrending: false };
      const item = { id: topicId, label: topicLabel, icon: topicIcon, isUserCreated: true };
      if (stat.count > 0) {
        activeCustomSubtopics.push(item);
      } else {
        inactiveCustomSubtopics.push(item);
      }
    });


    // If active custom subtopics exist, add them to Other category
    if (activeCustomSubtopics.length > 0) {
      baseCategories = baseCategories.map(cat => {
        if (cat.name === 'Other & Community') {
          return {
            ...cat,
            subtopics: [...activeCustomSubtopics, ...cat.subtopics]
          };
        }
        return cat;
      });
    }

    // Filter by search query if typed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      baseCategories = baseCategories.map(cat => {
        const matchCategoryName = cat.name.toLowerCase().includes(q) || t(cat.categoryKey, cat.name).toLowerCase().includes(q);
        const matchingSubtopics = cat.subtopics.filter(st => 
          st.label.toLowerCase().includes(q) || 
          st.id.toLowerCase().includes(q) || 
          t(st.id, st.label).toLowerCase().includes(q)
        );

        if (matchCategoryName) return cat;
        if (matchingSubtopics.length > 0) return { ...cat, subtopics: matchingSubtopics };
        return null;
      }).filter(Boolean);
    }

    // Sort subtopics INSIDE each category so topics getting interaction (count > 0) are on 1st place!
    const sortedCategories = baseCategories.map(cat => {
      const sortedSubtopics = [...cat.subtopics].sort((a, b) => {
        const statA = topicStatsMap[a.id] || { count: 0, lastPostMs: 0, isTrending: false };
        const statB = topicStatsMap[b.id] || { count: 0, lastPostMs: 0, isTrending: false };

        if (statB.count !== statA.count) return statB.count - statA.count;
        if (statB.isTrending !== statA.isTrending) return (statB.isTrending ? 1 : 0) - (statA.isTrending ? 1 : 0);
        return statB.lastPostMs - statA.lastPostMs;
      });
      return { ...cat, subtopics: sortedSubtopics };
    });

    // Sort CATEGORIES so categories with real post interactions appear at 1st place!
    sortedCategories.sort((catA, catB) => {
      const countA = catA.subtopics.reduce((acc, st) => acc + (topicStatsMap[st.id]?.count || 0), 0);
      const countB = catB.subtopics.reduce((acc, st) => acc + (topicStatsMap[st.id]?.count || 0), 0);
      return countB - countA;
    });

    // Append Inactive User Created Topics as a separate Bottom Card if present
    if (inactiveCustomSubtopics.length > 0 && activeCategoryTab === 'All') {
      sortedCategories.push({
        name: 'User Created Topics',
        categoryKey: 'USER_CREATED_CAT',
        iconName: 'UserCheck',
        accent: '#D96C3D',
        isBottomUserCard: true,
        subtopics: inactiveCustomSubtopics,
      });
    }

    return sortedCategories;
  }, [activeCategoryTab, searchQuery, customTopicNames, topicStatsMap, t]);

  const handleSubtopicClick = (subtopicId) => {
    const cleanId = subtopicId.toLowerCase();
    onNavigate(`/profile/${cleanId}`);
  };

  const handleCreateTopicSubmit = (e) => {
    e.preventDefault();
    if (!newTopicInput.trim()) {
      addToast('Please enter a valid topic name.', 'error');
      return;
    }
    const cleanName = newTopicInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!cleanName) {
      addToast('Invalid topic name. Use letters, numbers, and underscores.', 'error');
      return;
    }
    saveCustomTopic(cleanName, selectedEmoji, currentUser?.username || '@anonymous');
    setNewTopicInput('');
    setIsCreateTopicModalOpen(false);
    addToast(`Topic ${selectedEmoji} #${cleanName} created! Persisted to DB and listed at bottom until it gets interaction.`, 'success');
  };



  return (
    <UserLayout activeRoute="/" onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName="HOME">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* ── HERO BANNER & SEARCH BAR ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #6F405F 0%, #4A2B40 50%, #2D1D15 100%)',
              borderRadius: '24px',
              padding: '28px 32px',
              color: '#FFFFFF',
              boxShadow: '0 12px 36px rgba(45, 29, 21, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Lighting Orbs */}
            <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '220px', height: '220px', background: 'rgba(255, 209, 232, 0.15)', borderRadius: '50%', filter: 'blur(45px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', zIndex: 2, position: 'relative' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 700, color: '#FFD1E8', marginBottom: '8px' }}>
                  <Sparkles size={14} />
                  <span>मनातलं बोला… ओळख सुरक्षित ठेवा.</span>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                  {t('exploreTopicCatalog', 'Discover & Join Topic Channels')}
                </h1>
              </div>

              {/* "+ Create Topic" Button */}
              <button
                type="button"
                onClick={() => setIsCreateTopicModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #FF9933 0%, #D96C3D 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(217, 108, 61, 0.35)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <PlusSquare size={16} color="#FFF" />
                <span>{t('createCustomTopic', '+ Create Topic')}</span>
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', marginTop: '16px', zIndex: 2 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchTopicsCatalogPlaceholder', 'Search topics or subtopics (e.g. Shayari, Love, Cricket, Politics, Job)...')}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  borderRadius: '26px',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  color: '#2D1D15',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                }}
              />
            </div>
          </div>

          {/* ── HANDY CATEGORY FILTER TABS ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              padding: '2px 2px',
            }}
            className="hide-scrollbar"
          >
            <button
              type="button"
              onClick={() => setActiveCategoryTab('All')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 800,
                color: activeCategoryTab === 'All' ? '#FFFFFF' : '#6F405F',
                background: activeCategoryTab === 'All' ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)' : '#FFFFFF',
                border: activeCategoryTab === 'All' ? 'none' : '1.5px solid rgba(111, 64, 95, 0.18)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: activeCategoryTab === 'All' ? '0 4px 14px rgba(111, 64, 95, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              {t('allTopics', 'All Topics')}
            </button>

            {TOPIC_CATEGORIES.map(cat => {
              const isSelected = activeCategoryTab === cat.name || activeCategoryTab === cat.categoryKey;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategoryTab(isSelected ? 'All' : cat.name)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 700,
                    color: isSelected ? '#FFFFFF' : '#4A3E3D',
                    background: isSelected ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)' : '#FFFFFF',
                    border: isSelected ? 'none' : '1.5px solid #EFEAE8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 4px 14px rgba(111, 64, 95, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <TranslatedTopicText text={cat.name} fallbackKey={cat.categoryKey} />
                </button>
              );
            })}
          </div>

          {/* ── DYNAMICALLY SORTED SQUARE BOXES GRID ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {displayedCategories.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '48px 24px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '24px',
                  border: '1.5px solid rgba(111, 64, 95, 0.15)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <Compass size={44} color="#6F405F" style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
                  {t('noTopicsFoundQuery', 'No topics found matching your search')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateTopicModalOpen(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    background: 'var(--deep-plum)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Create Custom Topic #{searchQuery.toUpperCase().replace(/[^A-Z0-9_]/g, '') || 'NEW'}
                </button>
              </div>
            ) : (
              displayedCategories.map((category) => {
                const CategoryIcon = CATEGORY_ICONS[category.iconName] || Compass;
                const isHovered = hoveredCategory === category.name;
                const isBottomUserCard = Boolean(category.isBottomUserCard);

                return (
                  <div
                    key={category.name}
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      background: isHovered
                        ? `linear-gradient(135deg, ${category.accent}12 0%, rgba(255, 255, 255, 0.98) 100%)`
                        : 'rgba(255, 255, 255, 0.94)',
                      borderRadius: '24px',
                      padding: '24px',
                      backdropFilter: 'blur(16px)',
                      border: isBottomUserCard
                        ? '2px dashed rgba(217, 108, 61, 0.4)'
                        : isHovered
                        ? `2px solid ${category.accent}`
                        : '1.5px solid rgba(111, 64, 95, 0.12)',
                      boxShadow: isHovered
                        ? `0 14px 36px ${category.accent}22`
                        : '0 8px 30px rgba(45, 29, 21, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '290px',
                      transform: isHovered ? 'translateY(-4px)' : 'none',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div>
                      {/* Square Box Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '14px',
                              background: `${category.accent}18`,
                              color: category.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <CategoryIcon size={20} />
                          </div>
                          <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1D15', margin: 0, tracking: '-0.01em' }}>
                              <TranslatedTopicText text={category.name} fallbackKey={category.categoryKey} />
                            </h2>
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', fontWeight: 800, color: category.accent, background: `${category.accent}14`, padding: '3px 9px', borderRadius: '12px' }}>
                          {category.subtopics.length} {t('topics', 'topics')}
                        </span>
                      </div>

                      {/* Subtopics Chips Inside Square Box (Topics with interaction sorted to 1st place) */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        {category.subtopics.map((subtopic) => {
                          const stat = topicStatsMap[subtopic.id] || { count: 0, isTrending: false };
                          const hasInteraction = stat.count > 0;

                          return (
                            <button
                              key={subtopic.id}
                              type="button"
                              onClick={() => handleSubtopicClick(subtopic.id)}
                              style={{
                                padding: '7px 13px',
                                borderRadius: '16px',
                                background: hasInteraction ? `${category.accent}12` : '#FFFFFF',
                                border: hasInteraction ? `2px solid ${category.accent}` : `1.5px solid ${category.accent}30`,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: hasInteraction ? `0 4px 12px ${category.accent}20` : '0 2px 5px rgba(0,0,0,0.02)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1.5px)';
                                e.currentTarget.style.borderColor = category.accent;
                                e.currentTarget.style.boxShadow = `0 6px 16px ${category.accent}25`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = hasInteraction ? category.accent : `${category.accent}30`;
                              }}
                            >
                              <span style={{ fontSize: '14px' }}>{subtopic.icon}</span>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2D1D15' }}>
                                <TranslatedTopicText text={subtopic.label || subtopic.id} fallbackKey={subtopic.id} />
                              </span>

                              
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: hasInteraction ? '#FFFFFF' : category.accent,
                                  background: hasInteraction ? category.accent : `${category.accent}16`,
                                  padding: '1px 6px',
                                  borderRadius: '8px',
                                }}
                              >
                                {stat.count}
                              </span>

                              {stat.isTrending && (
                                <span style={{ fontSize: '9px' }}>🔥</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </TopicBackgroundRotator>

      {/* ── CREATE CUSTOM TOPIC MODAL OVERLAY ── */}
      <Modal
        isOpen={isCreateTopicModalOpen}
        onClose={() => setIsCreateTopicModalOpen(false)}
        title="Create New Custom Topic"
      >
        <form onSubmit={handleCreateTopicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Choose Emoji Logo Section */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '8px' }}>
              Choose Topic Emoji Logo * ({selectedEmoji})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '110px', overflowY: 'auto', padding: '10px', background: '#F8F5F7', borderRadius: '14px', border: '1px solid #EFEAE8' }} className="hide-scrollbar">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  style={{
                    fontSize: '20px',
                    padding: '6px 9px',
                    borderRadius: '10px',
                    border: selectedEmoji === emoji ? '2px solid #6F405F' : '1px solid transparent',
                    background: selectedEmoji === emoji ? '#FFFFFF' : 'transparent',
                    cursor: 'pointer',
                    transform: selectedEmoji === emoji ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: selectedEmoji === emoji ? '0 4px 10px rgba(111,64,95,0.2)' : 'none',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '6px' }}>
              Topic Channel Name *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#6F405F' }}>{selectedEmoji} #</span>
              <input
                type="text"
                placeholder="e.g. PHILOSOPHY, MEDITATION, STARTUPS..."
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                required
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #6F405F',
                  fontSize: '15px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#8C8385', margin: '8px 0 0 0' }}>
              User created topics start at the bottom card until they receive posts & activity!
            </p>
          </div>


          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setIsCreateTopicModalOpen(false)}
              style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #D4CECC', background: '#FFF', fontSize: '13.5px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
                color: '#FFF',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Create Topic
            </button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
