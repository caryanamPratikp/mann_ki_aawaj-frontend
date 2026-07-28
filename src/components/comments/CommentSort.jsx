import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export function CommentSort({ currentSort = 'Most Helpful', onSortChange }) {
  const options = ['Most Helpful', 'Latest', 'Oldest', 'Most Replied'];

  return (
    <div className="flex-row items-center gap-xs">
      <ArrowUpDown size={14} style={{ color: 'var(--hurricane)' }} />
      <span className="secondary-text" style={{ fontSize: '13px' }}>Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--deep-plum)',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
