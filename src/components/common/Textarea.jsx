import React from 'react';

export function Textarea({
  label,
  error,
  helperText,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  showCounter = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex-col gap-xs ${className}`} style={{ width: '100%' }}>
      {label && (
        <div className="flex-row justify-between items-center">
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--eclipse)' }}>
            {label}
          </label>
          {showCounter && maxLength && (
            <span className="caption-text">
              {value?.length || 0} / {maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--error)' : '1px solid var(--border-light)',
          background: 'var(--pure-white)',
          fontSize: '15px',
          color: 'var(--eclipse)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'var(--font-sans)',
          lineHeight: '1.5',
          transition: 'border-color var(--transition-fast)',
        }}
        {...props}
      />
      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--hurricane)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}
