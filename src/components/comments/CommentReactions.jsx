import React from 'react';
import { Heart, Lightbulb, ThumbsUp, Shield, Sparkles } from 'lucide-react';

export const COMMENT_REACTION_TYPES = [
  { key: 'relate', label: 'I Relate', icon: Heart },
  { key: 'helpful', label: 'Helpful', icon: Lightbulb },
  { key: 'wellSaid', label: 'Well Said', icon: ThumbsUp },
  { key: 'stayStrong', label: 'Stay Strong', icon: Shield },
  { key: 'madeMeThink', label: 'Made Me Think', icon: Sparkles },
];

export function CommentReactions({ reactions = {}, userReaction, onReact }) {
  return (
    <div className="flex-row items-center gap-xs flex-wrap">
      {COMMENT_REACTION_TYPES.map((type) => {
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
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--deep-plum)' : 'var(--hurricane)',
              background: isActive ? 'var(--deep-plum-light)' : 'var(--soft-white)',
              border: isActive ? '1px solid var(--deep-plum)' : '1px solid var(--border-light)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icon size={12} style={{ color: isActive ? 'var(--deep-plum)' : 'inherit' }} />
            <span>{type.label}</span>
            {count > 0 && <span style={{ opacity: 0.85 }}>({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
