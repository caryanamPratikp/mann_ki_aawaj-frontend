import React from 'react';
import { TopNavbar } from './TopNavbar.jsx';
import { LeftSidebar } from './LeftSidebar.jsx';
import { MobileNavigation } from './MobileNavigation.jsx';
import { MoodMusicWidget } from '../music/MoodMusicWidget.jsx';

export function UserLayout({ children, activeRoute, onNavigate, wide = true }) {
  const currentPath = (activeRoute || window.location.pathname || '').toLowerCase();
  const isTopicPage = Boolean(
    currentPath.startsWith('/profile/') &&
    currentPath !== '/profile' &&
    currentPath !== '/profile/' &&
    currentPath !== '/profile/me' &&
    !currentPath.includes('/edit') &&
    !currentPath.includes('/settings')
  );

  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [activeRoute, window.location.pathname]);



  return (
    <div className={`app-container user-layout ${wide ? 'user-layout-wide' : ''}`}>
      <TopNavbar activeRoute={activeRoute} onNavigate={onNavigate} />
      <div
        className="main-wrapper"
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: isMobile
            ? '12px 12px 80px 12px'
            : isTopicPage
            ? '20px 24px 20px 28px'
            : '20px 24px 20px 96px',
          transition: 'padding 0.3s ease',
          boxSizing: 'border-box',
        }}
      >
        <LeftSidebar activeRoute={activeRoute} onNavigate={onNavigate} />
        <main className={wide ? "main-content-wide" : "main-content"}>{children}</main>
      </div>
      <MobileNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
      <MoodMusicWidget />
    </div>
  );
}
