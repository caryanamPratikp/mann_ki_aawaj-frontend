import React, { useState, useRef, useEffect } from 'react';
import { useMoodMusic, MOOD_CATEGORIES, INDIAN_LANGUAGES } from '../../context/MoodMusicContext.jsx';
import { Music, Play, Pause, SkipForward, SkipBack, X, Sparkles, Move, Volume2, VolumeX } from 'lucide-react';

export function MoodMusicWidget() {
  const {
    selectedLanguage,
    currentMood,
    currentTrack,
    isPlaying,
    isWidgetOpen,
    progress,
    duration,
    setIsWidgetOpen,
    togglePlay,
    changeLanguage,
    changeMood,
    nextTrack,
    prevTrack,
    handleSeek,
  } = useMoodMusic();

  // ── 1. DRAGGABLE BUBBLE POSITION STATE ──
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 180,
    y: window.innerHeight - 90,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const widgetRef = useRef(null);

  // Drag Event Handlers
  const handlePointerDown = (e) => {
    // Only initiate drag if not clicking internal controls or when dragging by handle
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      startY: e.clientY || (e.touches && e.touches[0].clientY) || 0,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      const newX = Math.max(0, Math.min(window.innerWidth - 50, dragRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, dragRef.current.initialY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  // Click outside to collapse
  useEffect(() => {
    function handleClickOutside(event) {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsWidgetOpen(false);
      }
    }
    if (isWidgetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWidgetOpen, setIsWidgetOpen]);

  const activeCategory = MOOD_CATEGORIES.find((m) => m.id === currentMood) || MOOD_CATEGORIES[0];

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        fontFamily: 'var(--font-sans)',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* ── 1. COMPACT, ULTRA EASY-TO-USE EXPANDED PLAYER BOX ── */}
      {isWidgetOpen ? (
        <div
          style={{
            width: '260px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #6F405F',
            boxShadow: '0 12px 36px rgba(45, 29, 21, 0.22)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
          }}
        >
          {/* Header Drag Handle & Close */}
          <div
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '6px',
              borderBottom: '1px solid #F5F2F0',
              cursor: 'grab',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Move size={14} color="#6F405F" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#6F405F' }}>
                🎵 Mood Radio
              </span>
            </div>
            <button
              onClick={() => setIsWidgetOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8C8385' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Simple 1-Click Mood Selector Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C8385' }}>
              CHOOSE MOOD:
            </label>
            <select
              value={currentMood}
              onChange={(e) => changeMood(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '12px',
                border: '1px solid #D4CECC',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#6F405F',
                backgroundColor: '#FAF8F7',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {MOOD_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Compact Song Playing Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '14px',
              backgroundColor: '#F5EFF3',
              marginTop: '2px',
            }}
          >
            <img
              src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80'}
              alt={currentTrack?.title}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #6F405F',
                animation: isPlaying ? 'spin 10s linear infinite' : 'none',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h5
                style={{
                  margin: 0,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#2D1D15',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentTrack?.title || 'Kesariya'}
              </h5>
              <p
                style={{
                  margin: 0,
                  fontSize: '10.5px',
                  color: '#6E625F',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentTrack?.artist || 'Man Ki Aawaj'}
              </p>
            </div>
          </div>

          {/* Minimal Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingTop: '4px' }}>
            <button onClick={prevTrack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D1D15' }}>
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#6F405F',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(111,64,95,0.3)',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '1px' }} />}
            </button>
            <button onClick={nextTrack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D1D15' }}>
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* ── 2. DRAGGABLE FLOATING MINI BUBBLE ── */
        <div
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onClick={() => setIsWidgetOpen(true)}
          title="Drag bubble anywhere / Click to open music player"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px 6px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            boxShadow: '0 8px 24px rgba(45, 29, 21, 0.35)',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }}
        >
          {/* Cover Art Disc */}
          <img
            src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80'}
            alt={currentMood}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid #FFFFFF',
              animation: isPlaying ? 'spin 8s linear infinite' : 'none',
            }}
          />

          <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', whiteSpace: 'nowrap' }}>
            🎵 {currentMood}
          </span>

          {/* Quick Play/Pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.25)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
          </button>
        </div>
      )}

      {/* Global CSS keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
