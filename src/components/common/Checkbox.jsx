import React from 'react';

export function Checkbox({ label, checked, onChange, id, className = '' }) {
  return (
    <label
      htmlFor={id}
      className={`flex-row items-center gap-sm ${className}`}
      style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--eclipse)', userSelect: 'none' }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        style={{
          width: '18px',
          height: '18px',
          accentColor: 'var(--deep-plum)',
          cursor: 'pointer',
        }}
      />
      <span>{label}</span>
    </label>
  );
}
