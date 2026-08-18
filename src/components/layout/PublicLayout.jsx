import React from 'react';
import { LogIn, Home } from 'lucide-react';
import { Footer } from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import logoMKA from '../../assets/logo_MKA.png';

export function PublicLayout({ children, activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t('home') || 'Home', route: currentUser ? '/home' : '/' },
    { label: t('explore') || 'Explore', route: '/explore' },
    { label: t('about') || 'About Us', route: '/about' },
    { label: t('communityGuidelines') || 'Guidelines', route: '/community-guidelines' },
    { label: 'Privacy Policy', route: '/privacy-policy' },
    { label: 'Contact', route: '/contact' },
  ];

  const handleSignIn = () => {
    if (currentUser) {
      logout();
    }
    onNavigate('/login');
  };

  return (
    <div className="app-container" style={{ background: '#FFF8F2', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Dark Header Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#080A18',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* LEFT: Logo & Brand Name */}
          <div
            onClick={() => onNavigate(currentUser ? '/home' : '/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img
              src={logoMKA}
              alt="Aawaj Man Ki Logo"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <span
              className="font-playfair"
              style={{ fontSize: '22px', fontWeight: 700, color: '#FFF8F2', letterSpacing: '-0.02em' }}
            >
              Aawaj Man Ki
            </span>
          </div>

          {/* CENTER: Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-only">
            {NAV_LINKS.map((link) => {
              const isActive = activeRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#F2B08D' : '#FFF8F2',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 0',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#F2B08D'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#FFF8F2'; }}
                >
                  {link.label}
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px' }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigate('/home')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#63344F',
                  color: '#FFF8F2',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '24px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 52, 79, 0.3)',
                }}
              >
                <Home size={15} />
                Feed Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#FFF8F2',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  style={{
                    backgroundColor: '#F2B08D',
                    color: '#17151A',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(242, 176, 141, 0.25)',
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

