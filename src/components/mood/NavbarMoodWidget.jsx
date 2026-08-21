import React, { useState, useEffect, useRef } from 'react';
import { Smile, RefreshCw, X, ChevronRight, BarChart2, Check, Sparkles } from 'lucide-react';
import { apiMoodService } from '../../services/apiMoodService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Happy', color: '#EAB308' },
  { emoji: '😌', label: 'Peaceful', color: '#10B981' },
  { emoji: '😔', label: 'Sad', color: '#3B82F6' },
  { emoji: '🔥', label: 'Energetic', color: '#EF4444' },
  { emoji: '💙', label: 'Calm', color: '#06B6D4' },
  { emoji: '🧘', label: 'Meditative', color: '#8B5CF6' },
  { emoji: '😤', label: 'Frustrated', color: '#F97316' },
  { emoji: '🤔', label: 'Thoughtful', color: '#64748B' },
];

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function NavbarMoodWidget({ isDarkNavbar, textColor }) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeMood, setActiveMood] = useState(null); // { label, emoji }
  const [viewMode, setViewMode] = useState('SELECT'); // 'SELECT' | 'STATS'
  const [moodVotes, setMoodVotes] = useState({});
  const [totalMoodVotes, setTotalMoodVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  const popupRef = useRef(null);

  // Check 24h validity on mount and when opened
  const checkActiveMood = () => {
    try {
      const storedTime = localStorage.getItem('mka_user_mood_time');
      const storedMood = localStorage.getItem('mka_user_mood');
      const storedEmoji = localStorage.getItem('mka_user_mood_emoji');

      if (!storedTime || !storedMood || !storedEmoji) {
        setActiveMood(null);
        return null;
      }

      const elapsed = Date.now() - parseInt(storedTime, 10);
      if (elapsed < TWENTY_FOUR_HOURS_MS) {
        const moodObj = { label: storedMood, emoji: storedEmoji };
        setActiveMood(moodObj);
        return moodObj;
      } else {
        // Expired after 24h -> revert back to Mood button!
        localStorage.removeItem('mka_user_mood');
        localStorage.removeItem('mka_user_mood_emoji');
        localStorage.removeItem('mka_user_mood_time');
        setActiveMood(null);
        return null;
      }
    } catch {
      setActiveMood(null);
      return null;
    }
  };

  // Fetch community mood stats from API
  const fetchMoodStats = async () => {
    try {
      setLoading(true);
      const res = await apiMoodService.getMoodOfIndia();
      if (res?.data) {
        setMoodVotes(res.data.moodCounts || {});
        setTotalMoodVotes(res.data.totalVotes || 0);
        // Only set activeMood from server if local storage does not have a fresh 24h mood
        const localActive = checkActiveMood();
        if (!localActive && res.data.userMood) {
          const matched = MOOD_OPTIONS.find(
            (m) => m.label.toUpperCase() === res.data.userMood.toUpperCase()
          );
          if (matched) {
            const moodObj = { label: matched.label, emoji: matched.emoji };
            setActiveMood(moodObj);
            localStorage.setItem('mka_user_mood', matched.label);
            localStorage.setItem('mka_user_mood_emoji', matched.emoji);
            localStorage.setItem('mka_user_mood_time', Date.now().toString());
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 480 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    checkActiveMood();
    fetchMoodStats();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTogglePopup = () => {
    const currentActive = checkActiveMood();
    if (!isOpen) {
      if (currentActive) {
        setViewMode('STATS');
      } else {
        setViewMode('SELECT');
      }
      fetchMoodStats();
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectMood = async (option) => {
    try {
      const newMoodObj = { label: option.label, emoji: option.emoji };
      setActiveMood(newMoodObj);
      localStorage.setItem('mka_user_mood', option.label);
      localStorage.setItem('mka_user_mood_emoji', option.emoji);
      localStorage.setItem('mka_user_mood_time', Date.now().toString());

      addToast(`Mood updated to ${option.emoji} ${option.label}!`, 'success');
      setViewMode('STATS');

      const res = await apiMoodService.voteMood(option.label);
      if (res?.data?.moodCounts) {
        setMoodVotes(res.data.moodCounts);
        setTotalMoodVotes(res.data.totalVotes || 0);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update mood.', 'error');
    }
  };

  // Compute graph data
  const moodStatsList = MOOD_OPTIONS.map((m) => {
    const cnt = moodVotes[m.label.toUpperCase()] || moodVotes[m.label] || 0;
    const pct = totalMoodVotes > 0 ? Math.round((cnt / totalMoodVotes) * 100) : 0;
    return { ...m, count: cnt, percentage: pct };
  }).sort((a, b) => b.count - a.count);

  return (
    <div style={{ position: 'relative', zIndex: 1001 }} ref={popupRef}>
      {/* ── NAVBAR MOOD BUTTON ── */}
      <button
        type="button"
        onClick={handleTogglePopup}
        title={activeMood ? `Today's Mood: ${activeMood.emoji} ${activeMood.label} (Click to update / view stats)` : 'Express your mood today'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: activeMood ? '6px 12px' : '7px 16px',
          borderRadius: '20px',
          background: activeMood
            ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)'
            : isDarkNavbar
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(111, 64, 95, 0.12)',
          color: activeMood ? '#FFFFFF' : textColor,
          border: activeMood
            ? '1.5px solid rgba(255, 255, 255, 0.4)'
            : isDarkNavbar
            ? '1px solid rgba(255, 255, 255, 0.3)'
            : '1px solid rgba(111, 64, 95, 0.2)',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: activeMood ? '0 4px 14px rgba(111, 64, 95, 0.35)' : 'none',
          minWidth: activeMood ? '42px' : 'auto',
          height: '34px',
          userSelect: 'none',
        }}
      >
        {activeMood ? (
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{activeMood.emoji}</span>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em' }}>{t('mood', 'MOOD')}</span>
        )}
      </button>

      {/* ── MOOD POPUP MODAL / DROPDOWN OVERLAY ── */}
      {isOpen && (
        <div
          style={{
            position: isMobile ? 'fixed' : 'absolute',
            top: isMobile ? '68px' : 'calc(100% + 12px)',
            left: isMobile ? '12px' : 'auto',
            right: isMobile ? '12px' : 0,
            width: isMobile ? 'calc(100vw - 24px)' : '320px',
            maxWidth: '360px',
            margin: isMobile ? '0 auto' : 0,
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 16px 48px rgba(45, 29, 21, 0.28), 0 4px 16px rgba(0, 0, 0, 0.12)',
            border: '1.5px solid #EDE8E6',
            padding: '18px',
            zIndex: 2000,
            animation: 'mkaFadeSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3EFEF', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{viewMode === 'SELECT' ? '✨' : '📊'}</span>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
                {viewMode === 'SELECT'
                  ? t('howIsYourMoodToday', 'How is your Mood today?')
                  : t('communityMoodStats', 'Community Mood Stats')}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C8385', display: 'flex', padding: 2 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── MODE 1: EMOJI SELECTION ── */}
          {viewMode === 'SELECT' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#8C8385', margin: 0, lineHeight: 1.4 }}>
                {t('selectMoodPrompt', 'Tap an emoji below to express how you are feeling right now:')}
              </p>

              {/* Emoji Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = activeMood?.label?.toUpperCase() === m.label.toUpperCase();
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => handleSelectMood(m)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '14px',
                        background: isSelected ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)' : '#FAF8F7',
                        color: isSelected ? '#FFFFFF' : '#2D1D15',
                        border: isSelected ? 'none' : '1px solid #EDE8E6',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(111, 64, 95, 0.25)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{m.emoji}</span>
                      <span>{t(m.label, m.label)}</span>
                      {isSelected && <Check size={14} color="#FFF" style={{ marginLeft: 'auto' }} />}
                    </button>
                  );
                })}
              </div>

              {activeMood && (
                <button
                  type="button"
                  onClick={() => setViewMode('STATS')}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6F405F',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  <BarChart2 size={14} /> {t('viewStats', 'View Community Mood Stats')} →
                </button>
              )}
            </div>
          ) : (
            /* ── MODE 2: MOOD STATS GRAPH ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Active Mood Pill Banner (Click to switch to Emoji List to Update Mood) */}
              {activeMood && (
                <div
                  onClick={() => setViewMode('SELECT')}
                  title="Click to update your mood"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(111,64,95,0.12) 0%, rgba(61,35,52,0.06) 100%)',
                    border: '1.5px solid rgba(111,64,95,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: '0 3px 10px rgba(111, 64, 95, 0.12)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <span style={{ fontSize: '12px', color: '#6F405F', fontWeight: 800 }}>
                    {t('yourMoodToday', 'Your Mood today:')}
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#2D1D15', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{activeMood.emoji}</span>
                    <span>{activeMood.label}</span>
                    <span style={{ fontSize: '11px', color: '#6F405F', marginLeft: '4px', fontWeight: 800 }}>✏️</span>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8C8385', fontWeight: 700 }}>
                <span>{t('sentimentBreakdown', 'Nationwide Sentiment')}</span>
                <span>{totalMoodVotes} {t('totalVotes', 'Total Votes')}</span>
              </div>

              {/* Mood Graph Bar Chart Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }} className="hide-scrollbar">
                {moodStatsList.map((m) => {
                  const isUserActive = activeMood?.label?.toUpperCase() === m.label.toUpperCase();
                  return (
                    <div
                      key={m.label}
                      onClick={() => handleSelectMood(m)}
                      title={`Click to vote for ${m.emoji} ${m.label}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '8px',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF8F7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: isUserActive ? 800 : 600, color: '#2D1D15' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                          {isUserActive && <span style={{ fontSize: '10px', color: '#6F405F', fontWeight: 800 }}>✓</span>}
                        </span>
                        <span style={{ color: isUserActive ? '#6F405F' : '#8C8385' }}>
                          {m.percentage}% ({m.count})
                        </span>
                      </div>
                      {/* Bar Fill Track */}
                      <div
                        style={{
                          height: '7px',
                          width: '100%',
                          borderRadius: '4px',
                          background: '#F3EFEF',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${m.percentage}%`,
                            background: isUserActive
                              ? 'linear-gradient(90deg, #6F405F 0%, #D96C3D 100%)'
                              : m.color,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes mkaFadeSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
