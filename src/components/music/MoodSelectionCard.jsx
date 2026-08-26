import React from 'react';
import { CloudRain, Heart, Sparkles, Zap } from 'lucide-react';

const ICONS = { heart: Heart, 'cloud-rain': CloudRain, sparkles: Sparkles, zap: Zap };

export function MoodSelectionCard({ option, artwork, selected, onSelect, buttonRef }) {
  const Icon = ICONS[option.icon] || Sparkles;
  return <button ref={buttonRef} className={`mood-selection-card${selected ? ' selected' : ''}`} data-mood-option={option.id} type="button" aria-pressed={selected} onClick={() => onSelect(option)}>
    <span className="mood-selection-artwork"><img src={artwork} alt="" aria-hidden="true" draggable="false" /></span>
    <span className="mood-selection-content"><span className="mood-selection-card-icon"><Icon aria-hidden="true" /></span><span className="mood-selection-card-copy"><span className="mood-selection-title">{option.title}</span><span className="mood-selection-description">{option.description}</span></span></span>
  </button>;
}
