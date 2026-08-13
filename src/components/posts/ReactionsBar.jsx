import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const REACTION_TYPES = [
  { key: 'RELATE', labelKey: 'relate', defaultLabel: 'Relate', emoji: '❤' },
  { key: 'AGREE', labelKey: 'agree', defaultLabel: 'Agree', emoji: '🤝' },
  { key: 'DISAGREE', labelKey: 'disagree', defaultLabel: 'Disagree', emoji: '🤔' },
  { key: 'INTERESTING', labelKey: 'interesting', defaultLabel: 'Interesting', emoji: '💡' },
  { key: 'SUPPORT', labelKey: 'support', defaultLabel: 'Support', emoji: '💪' },
];

export function ReactionsBar({ reactions = {}, userReaction, onReact, compact = false }) {
  const { t } = useLanguage();

  return (
    <div className="flex-row items-center gap-xs flex-wrap">
      {REACTION_TYPES.map((type) => {
        const count = reactions[type.key] || reactions[type.key.toLowerCase()] || 0;
        const isActive = userReaction === type.key || userReaction === type.key.toLowerCase();

        return (
          <button
            key={type.key}
            onClick={(e) => {
              e.stopPropagation();
              onReact(type.key);
            }}
            className="flex-row items-center gap-xs"
            style={{
              padding: compact ? '4px 10px' : '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: compact ? '12px' : '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--deep-plum)' : 'var(--eclipse)',
              background: isActive ? 'rgba(111,64,95,0.12)' : 'var(--soft-white)',
              border: isActive ? '1.5px solid var(--deep-plum)' : '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '13px' }}>{type.emoji}</span>
            <span>{t(type.labelKey) || type.defaultLabel}</span>
            {count > 0 && <span style={{ opacity: 0.75, fontWeight: 600 }}>({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
