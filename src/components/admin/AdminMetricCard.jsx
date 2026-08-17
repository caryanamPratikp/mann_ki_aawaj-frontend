import React from 'react';

export function AdminMetricCard({ title, value, icon: Icon, color = '#6F405F', subtitle, loading = false }) {
  if (loading) {
    return (
      <div
        style={{
          borderRadius: '20px',
          border: '1px solid #E1DCDB',
          backgroundColor: '#ffffff',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F8F5F3' }} className="animate-pulse" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <div style={{ width: '60%', height: '12px', borderRadius: '4px', backgroundColor: '#F8F5F3' }} className="animate-pulse" />
          <div style={{ width: '40%', height: '32px', borderRadius: '6px', backgroundColor: '#F8F5F3' }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid #E1DCDB',
        backgroundColor: '#ffffff',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        boxShadow: '0 2px 12px rgba(45, 29, 21, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#9F9794',
            marginBottom: '6px',
          }}
        >
          {title}
        </span>

        <span
          className="font-heading"
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#2D1D15',
            lineHeight: 1.05,
          }}
        >
          {value !== undefined && value !== null ? value : 0}
        </span>

        {subtitle && (
          <span style={{ fontSize: '12.5px', color: '#9F9794', marginTop: '6px' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
