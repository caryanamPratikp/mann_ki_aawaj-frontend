import React, { useState, useRef, useEffect } from 'react';

export function Dropdown({ trigger, children, align = 'right', placement = 'down' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className="mka-card animate-fade-in"
          style={{
            position: 'absolute',
            [placement === 'up' ? 'bottom' : 'top']: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            [placement === 'up' ? 'marginBottom' : 'marginTop']: '6px',
            minWidth: '180px',
            padding: '8px 0',
            zIndex: 10000,
            boxShadow: 'var(--shadow-medium)',
          }}
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger = false, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="flex-row items-center gap-sm"
      style={{
        width: '100%',
        padding: '8px 16px',
        fontSize: '14px',
        textAlign: 'left',
        color: danger ? 'var(--error)' : 'var(--eclipse)',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft-white)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {Icon && <Icon size={16} />}
      <span>{children}</span>
    </button>
  );
}
