import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Languages } from 'lucide-react';

export function GlobalTranslationOverlay() {
  const { isTranslating, t } = useLanguage();

  if (!isTranslating) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out forwards',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 48px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(111, 64, 95, 0.25)',
          border: '1.5px solid var(--deep-plum-light)',
          textAlign: 'center',
          maxWidth: '380px',
          width: '90%',
        }}
      >
        {/* Animated Brand Ring */}
        <div
          style={{
            position: 'relative',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--deep-plum-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'var(--deep-plum)',
          }}
        >
          <Languages size={36} />
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--deep-plum)',
              borderRightColor: 'var(--deep-plum)',
              animation: 'mkaSpin 1s linear infinite',
            }}
          />
        </div>

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--eclipse)',
            margin: '0 0 8px 0',
          }}
        >
          {t('translatingUI', 'Translating Page...')}
        </h3>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--hurricane)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {t('updatingTranslations', 'Applying language updates across the entire application...')}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mkaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
