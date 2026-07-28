import React from 'react';
import { Home, Compass, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function MobileNavigation({ activeRoute, onNavigate }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--pure-white)',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 990,
        boxShadow: 'var(--shadow-medium)',
      }}
    >
      <button
        onClick={() => onNavigate('/home')}
        className="flex-col items-center gap-xs"
        style={{
          color: activeRoute === '/home' ? 'var(--deep-plum)' : 'var(--hurricane)',
          fontSize: '11px',
          fontWeight: activeRoute === '/home' ? 600 : 400,
        }}
      >
        <Home size={20} />
        <span>{t('home')}</span>
      </button>

      <button
        onClick={() => onNavigate('/explore')}
        className="flex-col items-center gap-xs"
        style={{
          color: activeRoute === '/explore' ? 'var(--deep-plum)' : 'var(--hurricane)',
          fontSize: '11px',
          fontWeight: activeRoute === '/explore' ? 600 : 400,
        }}
      >
        <Compass size={20} />
        <span>{t('explore')}</span>
      </button>

      <button
        onClick={() => onNavigate('/create-post')}
        className="flex-col items-center justify-center"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'var(--deep-plum)',
          color: 'var(--pure-white)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <PlusSquare size={22} />
      </button>

      <button
        onClick={() => onNavigate('/chat')}
        className="flex-col items-center gap-xs"
        style={{
          color: activeRoute?.startsWith('/chat') ? 'var(--deep-plum)' : 'var(--hurricane)',
          fontSize: '11px',
          fontWeight: activeRoute?.startsWith('/chat') ? 600 : 400,
        }}
      >
        <MessageSquare size={20} />
        <span>{t('messages')}</span>
      </button>

      <button
        onClick={() => onNavigate(currentUser ? `/profile/${currentUser.username.replace('@', '')}` : '/login')}
        className="flex-col items-center gap-xs"
        style={{
          color: activeRoute?.startsWith('/profile') ? 'var(--deep-plum)' : 'var(--hurricane)',
          fontSize: '11px',
          fontWeight: activeRoute?.startsWith('/profile') ? 600 : 400,
        }}
      >
        <User size={20} />
        <span>{t('profile')}</span>
      </button>
    </nav>
  );
}
