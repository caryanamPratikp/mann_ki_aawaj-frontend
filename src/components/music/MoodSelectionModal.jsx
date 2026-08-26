import React, { useEffect, useRef, useState } from 'react';
import { Music2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { LISTENING_MOOD_OPTIONS } from '../../config/musicMoods.js';
import { MoodSelectionCard } from './MoodSelectionCard.jsx';
import romanticArtwork from '../../assets/music/moods/op1.webp';
import sadArtwork from '../../assets/music/moods/op2.webp';
import energeticArtwork from '../../assets/music/moods/op3.webp';
import allArtwork from '../../assets/music/moods/op4.webp';

const ARTWORK = { op1: romanticArtwork, op2: sadArtwork, op3: energeticArtwork, op4: allArtwork };

export function MoodSelectionModal({ required, selectedMood, onSelect, onClose }) {
  const dialogRef = useRef(null);
  const firstCardRef = useRef(null);
  const restoreFocusRef = useRef(document.activeElement);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const restoreFocus = restoreFocusRef.current;
    document.body.style.overflow = 'hidden';
    firstCardRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!required) onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled)')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (!required) restoreFocus?.focus?.();
    };
  }, [onClose, required]);

  const choose = (option) => {
    setPendingId(option.id);
    window.setTimeout(() => onSelect(option), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140);
  };

  return createPortal(<div className="mood-selection-backdrop" onMouseDown={(event) => { if (!required && event.target === event.currentTarget) onClose(); }}><section ref={dialogRef} className="mood-selection-dialog" role="dialog" aria-modal="true" aria-labelledby="mood-selection-title" aria-describedby="mood-selection-description"><header className="mood-selection-header"><div className="mood-selection-decoration" aria-hidden="true"><Music2 /><span>✦</span><Music2 /><span>✧</span></div><div><span className="mood-selection-eyebrow">Your music, your moment</span><h2 id="mood-selection-title">How are you feeling today?</h2><p id="mood-selection-description">Pick a mood. We'll handle the music.</p></div>{!required && <button className="music-icon-button mood-selection-close" type="button" onClick={onClose} aria-label="Close mood selection"><X /></button>}</header><div className="mood-selection-grid">{LISTENING_MOOD_OPTIONS.map((option, index) => <MoodSelectionCard key={option.id} option={option} artwork={ARTWORK[option.artworkKey]} selected={pendingId ? pendingId === option.id : selectedMood === option.apiMood} onSelect={choose} buttonRef={index === 0 ? firstCardRef : undefined} />)}</div>{required && <p className="mood-selection-required"><Music2 size={14} aria-hidden="true" />Choose one option to continue to your music.</p>}</section></div>, document.body);
}
