import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * OTPModal — rendered as a small centred popup overlay.
 * Props: targetLabel, targetValue, onVerify, onClose
 */
export function OTPModal({ targetLabel, targetValue, onVerify, onClose }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleDigit = (i, val) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length === 6) {
      onVerify();
    } else {
      setError('Enter all 6 digits.');
    }
  };

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Modal box */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--pure-white)',
          borderRadius: '12px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'var(--soft-white)', border: 'none',
            borderRadius: '6px', padding: '4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={16} style={{ color: 'var(--hurricane)' }} />
        </button>

        {/* Title */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '4px' }}>
            Verify {targetLabel}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--hurricane)', lineHeight: 1.5 }}>
            Enter the 6-digit OTP sent to<br />
            <strong style={{ color: 'var(--eclipse)' }}>{targetValue}</strong>
          </p>
        </div>

        {/* 6 digit boxes */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                width: '38px', height: '44px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 700,
                border: '2px solid ' + (d ? 'var(--deep-plum)' : 'var(--border-light)'),
                borderRadius: '8px',
                outline: 'none',
                color: 'var(--eclipse)',
                background: 'var(--pure-white)',
                transition: 'border-color 0.15s',
              }}
            />
          ))}
        </div>

        {error && <span style={{ fontSize: '12px', color: 'var(--error)', textAlign: 'center', marginTop: '-8px' }}>{error}</span>}

        {/* Verify button */}
        <button
          type="button"
          onClick={handleVerify}
          style={{
            width: '100%', padding: '12px',
            borderRadius: '8px',
            background: 'var(--eclipse)',
            color: 'var(--pure-white)',
            fontSize: '14px', fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <CheckCircle2 size={16} /> Confirm OTP
        </button>

      </div>
    </div>
  );
}
