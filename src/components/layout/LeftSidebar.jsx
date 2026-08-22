import React, { useState } from 'react';
import { Home, Compass, FileText, ShieldAlert, Settings, HelpCircle, LogOut, Music2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function LeftSidebar({ activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPath = (activeRoute || window.location.pathname || '').toLowerCase();

  // Topic page matcher: /profile/{topicName} (collapses into hover strip ONLY on topic pages)
  const isTopicPage = Boolean(
    currentPath.startsWith('/profile/') &&
    currentPath !== '/profile' &&
    currentPath !== '/profile/' &&
    currentPath !== '/profile/me' &&
    !currentPath.includes('/edit') &&
    !currentPath.includes('/settings')
  );

  const menuItems = [
    { label: t('home', 'Home'), icon: Home, route: '/home' },
    { label: t('explore', 'Explore'), icon: Compass, route: '/explore' },
    { label: t('music', 'Music'), icon: Music2, route: '/music' },
    { label: t('myTopics', 'My Topics'), icon: FileText, route: '/my-posts' },
    { label: t('myReports', 'My Reports'), icon: ShieldAlert, route: '/my-reports' },
    { label: t('settings', 'Settings'), icon: Settings, route: '/settings' },
    { label: t('helpSupport', 'Help & Support'), icon: HelpCircle, route: '/help' },
  ];

  return (
    <aside
      className="desktop-only"
      onMouseEnter={() => isTopicPage && setIsExpanded(true)}
      onMouseLeave={() => isTopicPage && setIsExpanded(false)}
      style={{
        position: 'fixed',
        left: isTopicPage ? 0 : '16px',
        top: '80px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        transform: isTopicPage
          ? (isExpanded ? 'translateX(10px)' : 'translateX(-58px)')
          : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s ease',
        cursor: isTopicPage ? 'pointer' : 'default',
      }}
    >
      <div
        className="mka-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 8px',
          borderRadius: '20px',
          minHeight: 'calc(100vh - 110px)',
          background: 'linear-gradient(180deg, #6F405F 0%, #3D2334 100%)',
          border: '1.5px solid #5A334D',
          width: '68px',
          boxShadow: isTopicPage
            ? (isExpanded ? '12px 16px 40px rgba(61, 35, 52, 0.45)' : '4px 6px 20px rgba(61, 35, 52, 0.25)')
            : '6px 10px 28px rgba(61, 35, 52, 0.35)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            const isItemHovered = hoveredIdx === idx;

            return (
              <div key={idx} style={{ position: 'relative', width: '100%' }}>
                <button
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    color: '#FFFFFF',
                    background: isActive
                      ? 'rgba(255, 255, 255, 0.28)'
                      : isItemHovered
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.22)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={21} style={{ color: '#FFFFFF', strokeWidth: isActive ? 2.5 : 2 }} />
                </button>

                {/* Floating Tooltip Label (Shows on Hover without expanding sidebar) */}
                {isItemHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '60px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--eclipse)',
                      color: 'var(--pure-white)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                      zIndex: 100,
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentUser && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.18)', marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <button
                onClick={() => {
                  logout();
                  onNavigate('/login');
                }}
                onMouseEnter={() => setHoveredIdx('logout')}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFADAD',
                  background: hoveredIdx === 'logout' ? 'rgba(255, 173, 173, 0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <LogOut size={20} style={{ color: '#FFADAD' }} />
              </button>

              {hoveredIdx === 'logout' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--error)',
                    color: 'var(--pure-white)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    zIndex: 100,
                    pointerEvents: 'none',
                  }}
                >
                  {t('logout', 'Logout')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
