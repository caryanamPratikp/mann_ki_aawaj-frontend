import React from 'react';
import { LogIn, Mic2, ShieldAlert, Home } from 'lucide-react';
import { Footer } from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function PublicLayout({ children, activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t('home') || 'Home', route: currentUser ? '/home' : '/' },
    { label: t('explore') || 'Explore', route: '/explore' },
    { label: t('about') || 'About', route: '/about' },
    { label: t('communityGuidelines') || 'Community Guidelines', route: '/community-guidelines' },
  ];

  const handleSignIn = () => {
    if (currentUser) {
      logout();
    }
    onNavigate('/login');
  };

  return (
    <div className="app-container" style={{ background: 'var(--swiss-coffee)' }}>
      {/* Public Header Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          background: 'var(--pure-white)',
          borderBottom: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-subtle)',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '64px',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* LEFT: Logo & Brand */}
          <button
            onClick={() => onNavigate(currentUser ? '/home' : '/')}
            className="flex-row items-center gap-sm"
            style={{ textAlign: 'left', background: 'transparent', justifySelf: 'start' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--eclipse)',
                color: 'var(--swiss-coffee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mic2 size={18} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--eclipse)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Man Ki Aavaj
            </span>
          </button>

          {/* CENTER: Nav Links */}
          <nav className="flex-row items-center gap-lg desktop-only">
            {NAV_LINKS.map((link) => (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                style={{
                  fontSize: '14px',
                  fontWeight: activeRoute === link.route ? 600 : 400,
                  color: activeRoute === link.route ? 'var(--deep-plum)' : 'var(--hurricane)',
                  borderBottom: activeRoute === link.route ? '2px solid var(--deep-plum)' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (activeRoute !== link.route) e.currentTarget.style.color = 'var(--eclipse)'; }}
                onMouseLeave={e => { if (activeRoute !== link.route) e.currentTarget.style.color = 'var(--hurricane)'; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* RIGHT: If logged in, show "Home / Feed" button. If not, show "Sign in Anonymously" button */}
          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser ? (
              <button
                onClick={() => onNavigate('/home')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: 'var(--deep-plum)', color: 'var(--pure-white)',
                  padding: '10px 22px', borderRadius: 'var(--radius-pill)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Home size={16} />
                {t('home') || 'Home'}
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: 'var(--eclipse)', color: 'var(--pure-white)',
                  padding: '10px 22px', borderRadius: 'var(--radius-pill)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.18)'; }}
              >
                <LogIn size={15} />
                Sign in Anonymously
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
