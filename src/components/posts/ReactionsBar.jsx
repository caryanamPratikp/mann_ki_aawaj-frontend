import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Heart, Handshake, ThumbsUp, Lightbulb } from 'lucide-react';

export const REACTION_TYPES = [
  { key: 'RELATE', labelKey: 'relate', defaultLabel: 'I Relate', icon: Heart, color: '#e11d48' },
  { key: 'SUPPORT', labelKey: 'support', defaultLabel: 'Support', icon: Handshake, color: '#10b981' },
  { key: 'AGREE', labelKey: 'agree', defaultLabel: 'Agree', icon: ThumbsUp, color: '#3b82f6' },
  { key: 'INTERESTING', labelKey: 'interesting', defaultLabel: 'Insightful', icon: Lightbulb, color: '#eab308' },
];

export function ReactionsBar({ reactions = {}, userReaction, onReact, compact = false }) {
  const { t } = useLanguage();
  const [localUserReaction, setLocalUserReaction] = useState(userReaction);
  const [localReactions, setLocalReactions] = useState(reactions);

  useEffect(() => {
    setLocalUserReaction(userReaction);
    setLocalReactions(reactions);
  }, [userReaction, reactions]);

  const handleButtonClick = (typeKey) => {
    const prev = localUserReaction ? localUserReaction.toUpperCase() : null;
    const current = { ...(localReactions || {}) };

    let nextUserReaction = typeKey;

    if (prev === typeKey) {
      nextUserReaction = null;
      current[typeKey] = Math.max(0, (current[typeKey] || 1) - 1);
    } else {
      if (prev && current[prev]) {
        current[prev] = Math.max(0, current[prev] - 1);
      }
      current[typeKey] = (current[typeKey] || 0) + 1;
    }

    setLocalUserReaction(nextUserReaction);
    setLocalReactions(current);

    if (onReact) {
      onReact(typeKey);
    }
  };

  return (
    <div className="reactions-bar flex-row items-center gap-xs" style={{ marginTop: '2px', flexWrap: 'wrap' }}>
      {REACTION_TYPES.map((type) => {
        const keyUpper = type.key;
        const keyLower = type.key.toLowerCase();
        const rawCount = localReactions[keyUpper] || localReactions[keyLower] || 0;
        const isActive = localUserReaction === keyUpper || localUserReaction === keyLower;
        
        const displayCount = isActive && rawCount === 0 ? 1 : rawCount;
        const Icon = type.icon;

        return (
          <button
            key={type.key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(type.key);
            }}
            className="reaction-btn flex-row items-center gap-xs"
            style={{
              padding: compact ? '4px 10px' : '5px 12px',
              borderRadius: '20px',
              fontSize: compact ? '11.5px' : '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? type.color : '#524644',
              backgroundColor: isActive ? `${type.color}18` : '#F6F3F2',
              border: isActive ? `1.5px solid ${type.color}` : '1px solid #E5E0DF',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transform: isActive ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            <Icon size={14} style={{ color: isActive ? type.color : '#7A6E6B' }} />
            <span className="reaction-label">{t(type.labelKey) || type.defaultLabel}</span>
            {displayCount > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 800, color: isActive ? type.color : '#8C8385', marginLeft: '2px' }}>
                {displayCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
