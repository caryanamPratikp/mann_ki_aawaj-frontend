import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loader({ size = 28, text = 'Loading...' }) {
  return (
    <div className="flex-col items-center justify-center gap-sm" style={{ padding: '32px 16px' }}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--deep-plum)' }} />
      {text && <span className="secondary-text">{text}</span>}
    </div>
  );
}
