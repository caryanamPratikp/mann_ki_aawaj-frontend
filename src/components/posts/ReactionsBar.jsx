import React from 'react';

export const REACTION_TYPES = [
  { key: 'relate', label: 'Relate', emoji: '❤' },
  { key: 'helpful', label: 'Helpful', emoji: '💡' },
  { key: 'madeMeThink', label: 'Made Me Think', emoji: '🧠' },
  { key: 'stayStrong', label: 'Stay Strong', emoji: '💪' },
];

export function ReactionsBar({ reactions = {}, userReaction, onReact, compact = false }) {
  return (
    <div className="flex-row items-center gap-xs flex-wrap">
      {REACTION_TYPES.map((type) => {
        const count = reactions[type.key] || 0;
        const isActive = userReaction === type.key;

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
            <span>{type.label}</span>
            {count > 0 && <span style={{ opacity: 0.75, fontWeight: 600 }}>({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
