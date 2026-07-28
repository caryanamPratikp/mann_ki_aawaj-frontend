import React from 'react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, text, danger
  size = 'md', // sm, md, lg
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  ...props
}) {
  const getStyle = () => {
    let base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 500,
      transition: 'all var(--transition-fast)',
      fontFamily: 'var(--font-sans)',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    };

    if (size === 'sm') {
      base = { ...base, padding: '6px 12px', fontSize: '13px' };
    } else if (size === 'lg') {
      base = { ...base, padding: '12px 24px', fontSize: '16px', fontWeight: 600 };
    } else {
      base = { ...base, padding: '9px 18px', fontSize: '14px' };
    }

    switch (variant) {
      case 'secondary':
        return { ...base, background: 'var(--swiss-coffee)', color: 'var(--eclipse)', border: '1px solid var(--border-light)' };
      case 'outline':
        return { ...base, background: 'transparent', color: 'var(--eclipse)', border: '1px solid var(--eclipse)' };
      case 'text':
        return { ...base, background: 'transparent', color: 'var(--deep-plum)', padding: size === 'sm' ? '4px 8px' : '6px 12px' };
      case 'danger':
        return { ...base, background: 'var(--error)', color: 'var(--pure-white)' };
      case 'primary':
      default:
        return { ...base, background: 'var(--deep-plum)', color: 'var(--pure-white)' };
    }
  };

  return (
    <button
      type={type}
      style={getStyle()}
      onClick={onClick}
      disabled={disabled}
      className={`mka-btn ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
}
