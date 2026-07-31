import React from 'react';
import { MessageSquare, FileText, Bookmark, ShieldAlert, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function LeftSidebar({ activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { label: t('messages'), icon: MessageSquare, route: '/chat' },
    { label: t('myPosts'), icon: FileText, route: '/my-posts' },
    { label: t('savedPosts'), icon: Bookmark, route: '/saved' },
    { label: t('myReports'), icon: ShieldAlert, route: '/my-reports' },
    { label: t('settings'), icon: Settings, route: '/settings' },
    { label: t('helpSupport'), icon: HelpCircle, route: '/help' },
  ];

  return (
    <aside className="sidebar-left" style={{ width: '240px', maxWidth: '240px', flexShrink: 0 }}>
      <div
        className="mka-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          minHeight: 'calc(100vh - 110px)',
          background: '#FFFDFB',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '4px 10px 8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--hurricane)', fontWeight: 700 }}>
            Personal Space
          </div>

          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.route)}
                className="flex-row items-center gap-md"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--deep-plum)' : 'var(--eclipse)',
                  background: isActive ? 'var(--deep-plum-light)' : 'transparent',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--soft-white)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--deep-plum)' : 'var(--hurricane)' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {currentUser && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
            <button
              onClick={() => {
                logout();
                onNavigate('/login');
              }}
              className="flex-row items-center gap-md"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--error)',
                textAlign: 'left',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(196, 111, 118, 0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
