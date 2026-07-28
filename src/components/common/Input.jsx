import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex-col gap-xs ${className}`} style={{ width: '100%' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--eclipse)' }}>
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)' }}>
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 40px' : '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border-light)',
            background: 'var(--pure-white)',
            fontSize: '15px',
            color: 'var(--eclipse)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          {...props}
        />
      </div>
      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--hurricane)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}
