import React from 'react';
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

  return (
    <div className="flex-row items-center gap-xs flex-wrap" style={{ marginTop: '2px' }}>
      {REACTION_TYPES.map((type) => {
        const keyUpper = type.key;
        const keyLower = type.key.toLowerCase();
        const rawCount = reactions[keyUpper] || reactions[keyLower] || 0;
        const isActive = userReaction === keyUpper || userReaction === keyLower;
        
        // Count displays 1 when user reacts, or actual count
        const displayCount = isActive && rawCount === 0 ? 1 : rawCount;
        const Icon = type.icon;

        return (
          <button
            key={type.key}
            onClick={(e) => {
              e.stopPropagation();
              onReact(type.key);
            }}
            className="flex-row items-center gap-xs"
            style={{
              padding: compact ? '4px 10px' : '5px 12px',
              borderRadius: '20px',
              fontSize: compact ? '11.5px' : '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? type.color : '#524644',
              backgroundColor: isActive ? `${type.color}15` : '#F6F3F2',
              border: isActive ? `1.5px solid ${type.color}` : '1px solid #E5E0DF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Icon size={14} style={{ color: isActive ? type.color : '#7A6E6B' }} />
            <span>{t(type.labelKey) || type.defaultLabel}</span>
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
