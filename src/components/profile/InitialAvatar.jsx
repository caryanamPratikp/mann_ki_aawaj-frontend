import React from 'react';
import { generateInitials } from '../../utils/generateInitials.js';

export function InitialAvatar({ username, initials, size = 36, className = '' }) {
  const displayInitials = initials || generateInitials(username);

  return (
    <div
      className={`initial-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--deep-plum)',
        color: 'var(--pure-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: `${Math.max(12, Math.floor(size * 0.4))}px`,
        flexShrink: 0,
        userSelect: 'none',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      {displayInitials}
    </div>
  );
}
