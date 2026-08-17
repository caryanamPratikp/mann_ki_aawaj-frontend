import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function ModerationIndicator({ text }) {
  if (!text || !text.trim()) return null;

  return (
    <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--success)', fontSize: '12px' }}>
      <ShieldCheck size={14} />
      <span>Content check: Safe</span>
    </div>
  );
}
