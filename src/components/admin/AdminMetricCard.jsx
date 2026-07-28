import React from 'react';

export function AdminMetricCard({ title, value, icon: Icon, color = 'var(--deep-plum)', subtitle }) {
  return (
    <div className="mka-card flex-row items-center justify-between" style={{ padding: '20px' }}>
      <div className="flex-col gap-xs">
        <span className="secondary-text" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <span className="font-heading" style={{ fontSize: '32px', color: 'var(--eclipse)', lineHeight: 1 }}>
          {value}
        </span>
        {subtitle && <span className="caption-text">{subtitle}</span>}
      </div>

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--soft-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}
