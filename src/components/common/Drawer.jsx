import React from 'react';
import { X } from 'lucide-react';

export function Drawer({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(45, 29, 21, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '280px',
          height: '100%',
          background: 'var(--pure-white)',
          boxShadow: 'var(--shadow-medium)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-row justify-between items-center" style={{ marginBottom: '20px', borderBottom: '1px solid var(--swiss-coffee)', paddingBottom: '12px' }}>
          {title && <h3 className="card-heading">{title}</h3>}
          <button onClick={onClose} style={{ color: 'var(--hurricane)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
