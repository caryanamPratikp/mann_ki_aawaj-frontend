import React from 'react';
import { ArrowLeft, Mic2 } from 'lucide-react';

export function AuthLayout({ children, onNavigate }) {
  return (
    <div
      className="app-container flex-col"
      style={{
        minHeight: '100vh',
        background: 'var(--swiss-coffee)',
        padding: '0',
      }}
    >
      {/* Auth Top Bar */}
      <div
        style={{
          padding: '14px 24px',
          background: 'var(--pure-white)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex-row items-center gap-sm"
          style={{ background: 'transparent' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--eclipse)',
              color: 'var(--swiss-coffee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Mic2 size={16} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--eclipse)',
              letterSpacing: '-0.01em',
            }}
          >
            Awaaz Man Ki
          </span>
        </button>

        {/* Home Button */}
        <button
          onClick={() => onNavigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--soft-white)',
            color: 'var(--eclipse)',
            border: '1px solid var(--border-light)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--swiss-coffee)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--soft-white)'}
        >
          <ArrowLeft size={14} />
          Home
        </button>
      </div>

      {/* Auth Content */}
      <div
        className="flex-col items-center justify-center"
        style={{ flex: 1, padding: '40px 16px' }}
      >
        {/* Tagline */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <p className="secondary-text" style={{ fontSize: '14px', color: 'var(--hurricane)' }}>
            Share your thoughts, not your identity
          </p>
        </div>

        <div
          className="mka-card animate-fade-in"
          style={{ width: '100%', maxWidth: '440px', padding: '32px', background: 'var(--pure-white)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
