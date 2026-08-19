import React, { useState } from 'react';
import { Home, Compass, Search, PlusSquare, Bell, User as UserIcon, Menu, MessageSquare } from 'lucide-react';
import logoMKA from '../../assets/logo_MKA.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { Tooltip } from '../common/Tooltip.jsx';
import { Drawer } from '../common/Drawer.jsx';
import { LanguageSelectorDropdown } from '../common/LanguageSelectorDropdown.jsx';

export function TopNavbar({ activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const chatContext = useChat();
  const hasUnreadMessages = chatContext?.hasUnreadMessages || false;
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const iconBtnStyle = (active) => ({
    padding: '8px',
    borderRadius: 'var(--radius-md)',
    color: active ? 'var(--deep-plum)' : 'var(--eclipse)',
    background: active ? 'var(--deep-plum-light)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  });

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '8px',
          zIndex: 900,
          margin: '8px auto 0',
          width: 'calc(100% - 24px)',
          maxWidth: '1280px',
          background: 'var(--pure-white)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-soft)',
          padding: '0 16px',
          /* Prevent header from overflowing viewport */
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
          }}
        >
          {/* ── Logo & Brand ── */}
          <button
            onClick={() => onNavigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <img
              src={logoMKA}
              alt="Aawaj Man Ki"
              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }}
            />
            {/* Brand name — hidden on mobile phones via CSS */}
            <span
              className="brand-name font-heading"
              style={{ fontSize: '20px', color: 'var(--eclipse)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
            >
              Aawaj Man Ki
            </span>
          </button>

          {/* ── Desktop Search Bar ── */}
          <form onSubmit={handleSearch} style={{ flex: '0 1 300px' }} className="desktop-only">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search posts...'}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--soft-white)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </form>

          {/* ── RIGHT SIDE ACTIONS ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

            {/* Desktop-only nav icons */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Tooltip text={t('home')} position="bottom">
                <button onClick={() => onNavigate('/home')} style={iconBtnStyle(activeRoute === '/home')}>
                  <Home size={21} />
                </button>
              </Tooltip>

              <Tooltip text={t('explore')} position="bottom">
                <button onClick={() => onNavigate('/explore')} style={iconBtnStyle(activeRoute === '/explore')}>
                  <Compass size={21} />
                </button>
              </Tooltip>

              <Tooltip text={t('messages')} position="bottom">
                <button onClick={() => onNavigate('/chat')} style={iconBtnStyle(activeRoute?.startsWith('/chat'))}>
                  <MessageSquare size={21} />
                  {hasUnreadMessages && (
                    <span style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '7px', height: '7px', borderRadius: '50%',
                      backgroundColor: 'var(--error, #EF4444)',
                      border: '1.5px solid var(--pure-white)',
                    }} />
                  )}
                </button>
              </Tooltip>

              <Tooltip text={t('create')} position="bottom">
                <button
                  onClick={() => onNavigate('/create-post')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--deep-plum)',
                    color: 'var(--pure-white)',
                    fontSize: '13px', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <PlusSquare size={16} />
                  <span>{t('create')}</span>
                </button>
              </Tooltip>
            </div>

            {/* Notification Bell — ALWAYS VISIBLE (mobile + desktop) */}
            <button
              onClick={() => onNavigate('/notifications')}
              title={t('notifications') || 'Notifications'}
              style={iconBtnStyle(activeRoute === '/notifications')}
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  minWidth: '16px', height: '16px', borderRadius: '8px',
                  backgroundColor: 'var(--warning, #D96C3D)',
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--pure-white)',
                  padding: '0 2px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Language selector — desktop only */}
            <div className="desktop-only" style={{ display: 'flex' }}>
              <LanguageSelectorDropdown compact={true} />
            </div>

            {/* Profile Avatar — ALWAYS VISIBLE */}
            {currentUser ? (
              <button
                type="button"
                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => {
                  const handle = currentUser?.username ? currentUser.username.replace('@', '') : 'me';
                  onNavigate(`/profile/${handle}`);
                }}
                title={`Profile (${currentUser.username || 'User'})`}
              >
                <InitialAvatar
                  username={currentUser.username || '@user'}
                  initials={currentUser.avatarInitials}
                  size={32}
                />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--eclipse)',
                  fontSize: '13px', fontWeight: 500,
                  background: 'none', cursor: 'pointer',
                }}
              >
                Login
              </button>
            )}

            {/* ☰ Hamburger — mobile-only */}
            <button
              className="mobile-only"
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{
                color: 'var(--eclipse)', padding: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer ── */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Navigation"
      >
        <div className="flex-col gap-sm" style={{ padding: '8px 0' }}>
          {[
            { label: t('home') || 'Home', route: '/home' },
            { label: t('explore') || 'Explore', route: '/explore' },
            { label: t('messages') || 'Messages', route: '/chat' },
            { label: t('notifications') || 'Notifications', route: '/notifications' },
            { label: t('myPosts') || 'My Posts', route: '/my-posts' },
            { label: t('savedPosts') || 'Saved Posts', route: '/saved' },
            { label: t('myReports') || 'My Reports', route: '/my-reports' },
            { label: t('settings') || 'Settings', route: '/settings' },
            { label: t('helpSupport') || 'Help & Support', route: '/help' },
            { label: t('communityGuidelines') || 'Guidelines', route: '/community-guidelines' },
          ].map((item) => (
            <button
              key={item.route}
              onClick={() => { setIsMobileDrawerOpen(false); onNavigate(item.route); }}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: activeRoute === item.route ? 600 : 400,
                color: activeRoute === item.route ? 'var(--deep-plum)' : 'var(--eclipse)',
                background: activeRoute === item.route ? 'var(--deep-plum-light)' : 'transparent',
                border: 'none', cursor: 'pointer', width: '100%',
              }}
            >
              {item.label}
            </button>
          ))}

          {/* Language selector in drawer */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-light)', marginTop: '4px' }}>
            <LanguageSelectorDropdown compact={false} />
          </div>

          {currentUser && (
            <button
              onClick={() => { setIsMobileDrawerOpen(false); logout(); onNavigate('/login'); }}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--error)',
                background: 'transparent',
                border: 'none', cursor: 'pointer', width: '100%',
              }}
            >
              {t('logout') || 'Logout'}
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
