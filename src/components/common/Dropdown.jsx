import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export function Dropdown({ trigger, children, align = 'right', placement = 'down' }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current ? menuRef.current.offsetWidth : 180;
    const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 160;

    let top = 0;
    let left = 0;

    if (placement === 'up') {
      top = rect.top - menuHeight - 6;
      if (top < 10) {
        top = rect.bottom + 6;
      }
    } else {
      top = rect.bottom + 6;
      if (top + menuHeight > window.innerHeight - 10) {
        top = Math.max(10, rect.top - menuHeight - 6);
      }
    }

    if (align === 'right') {
      left = rect.right - menuWidth;
      if (left < 10) left = 10;
    } else {
      left = rect.left;
      if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
      }
    }

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      updateCoords();
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div style={{ display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="mka-card animate-fade-in"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              minWidth: '180px',
              padding: '8px 0',
              zIndex: 999999,
              boxShadow: '0 8px 24px rgba(45,29,21,0.24), 0 2px 8px rgba(0,0,0,0.12)',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(111, 64, 95, 0.15)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            {children}
          </div>,
          document.body
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
