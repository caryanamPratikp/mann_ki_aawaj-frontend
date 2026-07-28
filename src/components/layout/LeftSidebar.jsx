import React from 'react';
import { MessageSquare, FileText, Bookmark, ShieldAlert, Settings, BookOpen, HelpCircle, LogOut } from 'lucide-react';
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
    { label: t('communityGuidelines'), icon: BookOpen, route: '/community-guidelines' },
    { label: t('helpSupport'), icon: HelpCircle, route: '/about' },
  ];

  return (
    <aside className="sidebar-left flex-col justify-between" style={{ height: 'calc(100vh - 88px)', position: 'sticky', top: '80px' }}>
      <div className="mka-card flex-col gap-xs" style={{ padding: '12px' }}>
        <div style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--hurricane)', fontWeight: 600 }}>
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
        <div className="mka-card" style={{ padding: '12px' }}>
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
              color: 'var(--error)',
              textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
