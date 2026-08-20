import React from 'react';
import { MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function AnimatedTopicActivityPanel({ topicName = 'GENERAL' }) {
  const { t } = useLanguage();
  const normTopic = (topicName || 'GENERAL').toUpperCase();

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EDE8E6',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(45,29,21,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '80px',
        overflow: 'hidden',
      }}
    >
      {/* Top Header with Live Signal Pulse */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE8E6', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              animation: 'pulseGlow 2s infinite',
            }}
          />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
            {t('comments', 'Live Discussion')}
          </h3>
        </div>
        <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(111,64,95,0.1)', color: '#6F405F' }}>
          #{t(normTopic, normTopic)}
        </span>
      </div>

      {/* Animated Call to Action Banner */}
      <div
        style={{
          padding: '20px 16px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(111,64,95,0.06) 0%, rgba(217,108,61,0.06) 100%)',
          border: '1px solid rgba(111,64,95,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          }}
        >
          <MessageSquare size={22} color="var(--deep-plum)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#2D1D15' }}>
            {t('joinTheConversation', 'Join the Conversation')}
          </span>
          <p style={{ fontSize: '12.5px', color: 'var(--hurricane)', margin: 0, lineHeight: 1.45 }}>
            {t('selectCommentPrompt', 'Click comments on any post to inspect and share responses in this side panel.')}
          </p>
        </div>
      </div>

      {/* Safety & Anonymity Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#6E625F', paddingTop: '4px' }}>
        <ShieldCheck size={14} color="#3F7772" />
        <span>End-to-End Shielded Anonymous Discussion</span>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
