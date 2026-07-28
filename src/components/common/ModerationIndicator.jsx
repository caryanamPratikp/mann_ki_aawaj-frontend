import React, { useState, useEffect } from 'react';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { ShieldCheck, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

export function ModerationIndicator({ text, debounceMs = 300 }) {
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!text || !text.trim()) {
      setResult(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const timer = setTimeout(() => {
      const check = moderationCheck(text);
      setResult(check);
      setChecking(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [text, debounceMs]);

  if (!text || !text.trim() || !result) return null;

  if (checking) {
    return (
      <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--hurricane)' }}>
        <Clock size={14} className="animate-spin" />
        <span>Checking guidelines...</span>
      </div>
    );
  }

  if (result.status === 'SAFE') {
    return (
      <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--success)' }}>
        <ShieldCheck size={14} />
        <span>Content check: Safe</span>
      </div>
    );
  }

  if (result.status === 'NEEDS_EDITING') {
    return (
      <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--warning)', fontWeight: 500 }}>
        <AlertTriangle size={14} />
        <span>Content check: Review wording ({result.category || 'Disrespectful language'})</span>
      </div>
    );
  }

  if (result.status === 'PENDING_REVIEW') {
    return (
      <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--warning)' }}>
        <Clock size={14} />
        <span>Content check: Will be held for admin review</span>
      </div>
    );
  }

  if (result.status === 'BLOCKED') {
    return (
      <div className="flex-row items-center gap-xs caption-text" style={{ color: 'var(--error)', fontWeight: 600 }}>
        <ShieldAlert size={14} />
        <span>Content check: Not allowed ({result.category})</span>
      </div>
    );
  }

  return null;
}
