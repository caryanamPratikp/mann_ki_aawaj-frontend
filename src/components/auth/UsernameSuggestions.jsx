import React, { useState, useEffect } from 'react';
import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { validateUsername } from '../../utils/validateUsername.js';
import { RefreshCw, Check } from 'lucide-react';

/**
 * Compact bordered box containing:
 *  - Header: label + refresh icon
 *  - 3 username chips in a row
 *  - Divider + custom handle input
 */
export function UsernameSuggestions({ selectedUsername, onSelectUsername }) {
  const [suggestions, setSuggestions] = useState([]);
  const [customHandle, setCustomHandle] = useState('');
  const [customValidation, setCustomValidation] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const loadNew = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    const list = generateUsernameSuggestions(3);
    setSuggestions(list);
    if (list[0] && !selectedUsername) onSelectUsername(list[0]);
  };

  useEffect(() => { loadNew(); }, []);

  const handleCustom = (val) => {
    setCustomHandle(val);
    const result = validateUsername(val);
    setCustomValidation(result);
    if (result.isValid) onSelectUsername(val.startsWith('@') ? val : `@${val}`);
  };

  return (
    <div
      style={{
        border: '2px solid var(--eclipse)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--soft-white)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', letterSpacing: '0.02em' }}>
          Anonymous Username Suggestions
        </span>
        <button
          type="button"
          onClick={loadNew}
          title="Suggest more"
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 600, color: 'var(--deep-plum)',
            background: 'transparent', cursor: 'pointer',
          }}
        >
          <RefreshCw
            size={13}
            style={{
              transition: 'transform 0.5s',
              transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
            }}
          />
          Suggest More
        </button>
      </div>

      {/* 3 suggestion chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
        }}
      >
        {suggestions.map((uname, i) => {
          const isSelected = selectedUsername === uname;
          return (
            <button
              key={uname}
              type="button"
              onClick={() => { onSelectUsername(uname); setCustomHandle(''); setCustomValidation(null); }}
              style={{
                padding: '10px 4px',
                borderRight: i < 2 ? '1px solid var(--border-light)' : 'none',
                background: isSelected ? 'rgba(111,64,95,0.07)' : 'var(--pure-white)',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? 'var(--deep-plum)' : 'var(--eclipse)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'background 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              {uname}
              {isSelected && <Check size={11} style={{ flexShrink: 0, color: 'var(--deep-plum)' }} />}
            </button>
          );
        })}
      </div>

      {/* Custom handle */}
      <div style={{ borderTop: '1px solid var(--border-light)', padding: '8px 12px' }}>
        <input
          type="text"
          value={customHandle}
          onChange={e => handleCustom(e.target.value)}
          placeholder="Or type a custom handle: @mycustomhandle"
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            border: customValidation && !customValidation.isValid
              ? '1.5px solid var(--error)'
              : customValidation && customValidation.isValid
              ? '1.5px solid var(--success)'
              : '1.5px solid var(--border-light)',
            fontSize: '12px',
            color: 'var(--eclipse)',
            background: 'var(--pure-white)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {customValidation && (
          <span style={{
            fontSize: '11px',
            color: customValidation.isValid ? 'var(--success)' : 'var(--error)',
            marginTop: '3px',
            display: 'block',
          }}>
            {customValidation.message}
          </span>
        )}
      </div>
    </div>
  );
}
