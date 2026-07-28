import React from 'react';
import { Heart, ThumbsUp, Lightbulb, Shield, Sparkles } from 'lucide-react';

export const REACTION_TYPES = [
  { key: 'relate', label: 'I Relate', icon: Heart },
  { key: 'wellSaid', label: 'Well Said', icon: ThumbsUp },
  { key: 'helpful', label: 'Helpful', icon: Lightbulb },
  { key: 'stayStrong', label: 'Stay Strong', icon: Shield },
  { key: 'madeMeThink', label: 'Made Me Think', icon: Sparkles },
];

export function ReactionsBar({ reactions = {}, userReaction, onReact, compact = false }) {
  return (
    <div className="flex-row items-center gap-xs flex-wrap">
      {REACTION_TYPES.map((type) => {
        const Icon = type.icon;
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
              padding: compact ? '4px 8px' : '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: compact ? '12px' : '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--deep-plum)' : 'var(--hurricane)',
              background: isActive ? 'var(--deep-plum-light)' : 'var(--soft-white)',
              border: isActive ? '1px solid var(--deep-plum)' : '1px solid var(--border-light)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icon size={compact ? 13 : 15} style={{ color: isActive ? 'var(--deep-plum)' : 'inherit' }} />
            <span>{type.label}</span>
            {count > 0 && <span style={{ opacity: 0.8 }}>({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
