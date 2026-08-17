import React from 'react';

export function Footer({ onNavigate }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--eclipse)',
        color: 'var(--swiss-coffee)',
        padding: '40px 16px',
        marginTop: 'auto',
        fontSize: '14px',
      }}
    >
      <div
        className="flex-col gap-lg"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        <div className="flex-row justify-between items-center flex-wrap gap-md">
          <div className="flex-col gap-xs">
            <h3 className="font-heading" style={{ color: 'var(--swiss-coffee)', fontSize: '24px' }}>
              Awaaz Man Ki
            </h3>
            <p style={{ color: 'var(--zorba)', maxWidth: '400px', fontSize: '13px' }}>
              An 18+ anonymous, text-first social space for authentic thoughts, confessions, questions, and personal experiences.
            </p>
          </div>

          <div className="flex-row gap-lg flex-wrap">
            <button onClick={() => onNavigate('/about')} style={{ color: 'var(--swiss-coffee)' }}>
              About
            </button>
            <button onClick={() => onNavigate('/community-guidelines')} style={{ color: 'var(--swiss-coffee)' }}>
              Guidelines
            </button>
            <button onClick={() => onNavigate('/privacy-policy')} style={{ color: 'var(--swiss-coffee)' }}>
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/contact')} style={{ color: 'var(--swiss-coffee)' }}>
              Contact
            </button>
            <button onClick={() => onNavigate('/admin/login')} style={{ color: 'var(--zorba)', fontSize: '12px' }}>
              Admin Portal
            </button>
          </div>
        </div>

        <div
          className="flex-row justify-between items-center border-t"
          style={{ paddingTop: '20px', borderTop: '1px solid rgba(225, 220, 219, 0.1)', color: 'var(--zorba)', fontSize: '12px' }}
        >
          <span>© 2026 Awaaz Man Ki. All rights reserved. 18+ Anonymous Social Platform.</span>
          <span>Privacy Guaranteed. No public real-name identity.</span>
        </div>
      </div>
    </footer>
  );
}
