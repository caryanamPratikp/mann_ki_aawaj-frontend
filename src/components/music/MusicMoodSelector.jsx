import React, { useId } from 'react';
import { MUSIC_MOOD_OPTIONS, toggleMusicMood } from '../../config/musicMoods.js';

export function MusicMoodSelector({ value = [], onChange, label = 'Moods *', maxSelections, helperText, error, disabled = false }) {
  const descriptionId = useId();
  const atLimit = Number.isFinite(maxSelections) && value.length >= maxSelections;
  const guidance = helperText || (Number.isFinite(maxSelections)
    ? `Choose 1–${maxSelections} moods. ${value.length} selected.`
    : `${value.length} selected. Choose at least one mood.`);

  return <fieldset className="music-mood-selector full" disabled={disabled} aria-describedby={descriptionId}>
    <legend>{label}</legend>
    <div className="music-mood-options">
      {MUSIC_MOOD_OPTIONS.map(({ value: mood, label: moodLabel }) => {
        const selected = value.includes(mood);
        return <button
          key={mood}
          type="button"
          className={`music-mood-chip${selected ? ' selected' : ''}`}
          aria-pressed={selected}
          disabled={disabled || (atLimit && !selected)}
          onClick={() => onChange(toggleMusicMood(value, mood, maxSelections))}
        >{moodLabel}</button>;
      })}
    </div>
    <small id={descriptionId} className={error ? 'music-mood-error' : 'music-mood-helper'} aria-live="polite">
      {error || guidance}
    </small>
  </fieldset>;
}
