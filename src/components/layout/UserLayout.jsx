import React from 'react';
import { TopNavbar } from './TopNavbar.jsx';
import { LeftSidebar } from './LeftSidebar.jsx';
import { MobileNavigation } from './MobileNavigation.jsx';

export function UserLayout({ children, activeRoute, onNavigate, wide = false }) {
  return (
    <div className="app-container user-layout">
      <TopNavbar activeRoute={activeRoute} onNavigate={onNavigate} />
      <div className="main-wrapper">
        <LeftSidebar activeRoute={activeRoute} onNavigate={onNavigate} />
        <main className={wide ? "main-content-wide" : "main-content"}>{children}</main>
      </div>
      <MobileNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  );
}
