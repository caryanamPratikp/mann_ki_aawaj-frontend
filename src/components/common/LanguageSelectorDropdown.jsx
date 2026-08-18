import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function LanguageSelectorDropdown({ compact = false }) {
  const { currentLanguage, changeLanguage, supportedLanguages, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = supportedLanguages.find(
    (l) => l.label.toLowerCase() === currentLanguage.toLowerCase() || l.code.toLowerCase() === currentLanguage.toLowerCase()
  ) || { code: 'EN', label: 'English', native: 'English' };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Select Application Language"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '5px 10px' : '7px 14px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #FAF7F5 0%, #F5EFEF 100%)',
          border: '1.5px solid #E2D7D7',
          color: '#2D1D15',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(45,29,21,0.05)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#6F405F';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(111,64,95,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E2D7D7';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,29,21,0.05)';
        }}
      >
        <Globe size={15} style={{ color: '#6F405F' }} />
        <span>{currentLangObj.native || currentLangObj.label}</span>
        <span style={{ fontSize: '11px', color: '#8C8385', fontWeight: 600 }}>({currentLangObj.label})</span>
        <ChevronDown
          size={14}
          style={{
            color: '#6F405F',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '240px',
            maxHeight: '320px',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #EAE4E4',
            boxShadow: '0 12px 36px rgba(45,29,21,0.16)',
            padding: '6px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ padding: '8px 12px 6px', fontSize: '11px', fontWeight: 800, color: '#8C8385', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Preferred Language
          </div>

          {supportedLanguages.map((lang) => {
            const isSelected =
              currentLanguage.toLowerCase() === lang.label.toLowerCase() ||
              currentLanguage.toLowerCase() === lang.code.toLowerCase();

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? 'rgba(111,64,95,0.08)' : 'transparent',
                  color: isSelected ? '#6F405F' : '#2D1D15',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#FAF7F6';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{lang.native}</span>
                  <span style={{ fontSize: '12px', color: '#8C8385' }}>({lang.label})</span>
                </div>
                {isSelected && <Check size={16} style={{ color: '#6F405F' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
