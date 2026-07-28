import React, { useState } from 'react';

export function Tooltip({ text, children, position = 'bottom' }) {
  const [visible, setVisible] = useState(false);

  const isBottom = position === 'bottom';

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div
          style={{
            position: 'absolute',
            ...(isBottom
              ? { top: '100%', marginTop: '6px' }
              : { bottom: '100%', marginBottom: '6px' }),
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 10px',
            backgroundColor: 'var(--eclipse)',
            color: 'var(--pure-white)',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
