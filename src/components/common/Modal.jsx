import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(20, 15, 12, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="mka-card modal-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--pure-white)',
          padding: '24px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-row justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--swiss-coffee)', paddingBottom: '12px' }}>
          {title && <h3 className="card-heading">{title}</h3>}
          <button
            onClick={onClose}
            style={{ color: 'var(--hurricane)', padding: '4px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
