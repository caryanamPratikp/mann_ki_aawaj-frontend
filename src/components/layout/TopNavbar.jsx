import React, { useState } from 'react';
import { Home, Compass, Search, PlusSquare, Bell, User as UserIcon, Menu, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { Tooltip } from '../common/Tooltip.jsx';
import { Drawer } from '../common/Drawer.jsx';

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

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 900,
          margin: '12px auto 0',
          width: 'calc(100% - 32px)',
          maxWidth: '1280px',
          background: 'var(--pure-white)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-soft)',
          padding: '0 20px',
        }}
      >
        <div
          className="flex-row items-center justify-between"
          style={{ height: '60px' }}
        >
          {/* Logo & Brand */}
          <div className="flex-row items-center gap-md">
            <button
              onClick={() => onNavigate('/')}
              className="flex-row items-center gap-sm"
              style={{ textAlign: 'left' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--eclipse)',
                  color: 'var(--swiss-coffee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}
              >
                A
              </div>
              <span className="font-heading" style={{ fontSize: '22px', color: 'var(--eclipse)', letterSpacing: '-0.02em' }}>
                Awaaz Man Ki
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ flex: '0 1 320px' }} className="desktop-only">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--hurricane)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--soft-white)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </form>

          {/* Main Top Nav Icons */}
          <div className="flex-row items-center gap-md">
            <Tooltip text={t('home')} position="bottom">
              <button
                onClick={() => onNavigate('/home')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  color: activeRoute === '/home' ? 'var(--deep-plum)' : 'var(--eclipse)',
                  background: activeRoute === '/home' ? 'var(--deep-plum-light)' : 'transparent',
                }}
              >
                <Home size={22} />
              </button>
            </Tooltip>

            <Tooltip text={t('explore')} position="bottom">
              <button
                onClick={() => onNavigate('/explore')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  color: activeRoute === '/explore' ? 'var(--deep-plum)' : 'var(--eclipse)',
                  background: activeRoute === '/explore' ? 'var(--deep-plum-light)' : 'transparent',
                }}
              >
                <Compass size={22} />
              </button>
            </Tooltip>

            <Tooltip text={t('messages')} position="bottom">
              <button
                onClick={() => onNavigate('/chat')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  color: activeRoute?.startsWith('/chat') ? 'var(--deep-plum)' : 'var(--eclipse)',
                  background: activeRoute?.startsWith('/chat') ? 'var(--deep-plum-light)' : 'transparent',
                  position: 'relative',
                }}
              >
                <MessageSquare size={22} />
                {hasUnreadMessages && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--error, #EF4444)',
                      border: '1.5px solid var(--pure-white, #FFFFFF)',
                    }}
                  />
                )}
              </button>
            </Tooltip>

            <Tooltip text={t('create')} position="bottom">
              <button
                onClick={() => onNavigate('/create-post')}
                className="flex-row items-center gap-xs"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--deep-plum)',
                  color: 'var(--pure-white)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <PlusSquare size={18} />
                <span className="desktop-only">{t('create')}</span>
              </button>
            </Tooltip>

            <Tooltip text={t('notifications')} position="bottom">
              <button
                onClick={() => onNavigate('/notifications')}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  color: activeRoute === '/notifications' ? 'var(--deep-plum)' : 'var(--eclipse)',
                  background: activeRoute === '/notifications' ? 'var(--deep-plum-light)' : 'transparent',
                  position: 'relative',
                }}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--warning)',
                    }}
                  />
                )}
              </button>
            </Tooltip>

            {currentUser ? (
              <Tooltip text={`Profile (${currentUser.username || 'User'})`} position="bottom">
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => {
                    const handle = currentUser?.username ? currentUser.username.replace('@', '') : 'me';
                    onNavigate(`/profile/${handle}`);
                  }}
                >
                  <InitialAvatar username={currentUser.username || '@user'} initials={currentUser.avatarInitials} size={34} />
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--eclipse)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Login
              </button>
            )}

            {/* Mobile Drawer Toggle */}
            <button
              className="mobile-only"
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{ color: 'var(--eclipse)', padding: '4px' }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Navigation"
      >
        <div className="flex-col gap-sm" style={{ padding: '8px 0' }}>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/chat'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('messages')}
          </button>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/my-posts'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('myPosts')}
          </button>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/saved'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('savedPosts')}
          </button>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/my-reports'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('myReports')}
          </button>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/settings'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('settings')}
          </button>
          <button
            onClick={() => { setIsMobileDrawerOpen(false); onNavigate('/community-guidelines'); }}
            className="flex-row items-center gap-md"
            style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px' }}
          >
            {t('communityGuidelines')}
          </button>
          {currentUser && (
            <button
              onClick={() => { setIsMobileDrawerOpen(false); logout(); onNavigate('/login'); }}
              className="flex-row items-center gap-md"
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '15px', color: 'var(--error)' }}
            >
              {t('logout')}
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
