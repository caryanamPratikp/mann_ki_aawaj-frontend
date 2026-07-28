import React from 'react';

export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  placeholder = 'Select option...',
  className = '',
  ...props
}) {
  return (
    <div className={`flex-col gap-xs ${className}`} style={{ width: '100%' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--eclipse)' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--error)' : '1px solid var(--border-light)',
          background: 'var(--pure-white)',
          fontSize: '15px',
          color: 'var(--eclipse)',
          outline: 'none',
          cursor: 'pointer',
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>}
    </div>
  );
}
