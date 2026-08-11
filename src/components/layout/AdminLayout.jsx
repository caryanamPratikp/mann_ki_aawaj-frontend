import React from 'react';
import { Shield, LayoutDashboard, Flag, FileCheck, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLayout({ children, activeRoute, onNavigate }) {
  const { adminLogout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
    { label: 'Reports Queue', icon: Flag, route: '/admin/reports' },
    { label: 'Content Review', icon: FileCheck, route: '/admin/content-review' },
    { label: 'Blocked Footprints', icon: ShieldAlert, route: '/admin/blocked-content' },
  ];

  return (
    <div className="app-container" style={{ background: 'var(--soft-white)' }}>
      {/* Admin Header */}
      <header
        style={{
          background: 'var(--eclipse)',
          color: 'var(--pure-white)',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex-row items-center gap-md">
          <div
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'var(--deep-plum)',
              color: 'var(--pure-white)',
            }}
          >
            <Shield size={20} />
          </div>
          <span className="font-heading" style={{ fontSize: '20px', color: 'var(--pure-white)' }}>
            Man Ki Aavaj Admin Portal
          </span>
        </div>

        <div className="flex-row items-center gap-md">
          <button
            onClick={() => {
              adminLogout();
              onNavigate('/admin/login');
            }}
            className="flex-row items-center gap-xs"
            style={{ color: 'var(--swiss-coffee)', fontSize: '14px' }}
          >
            <LogOut size={16} />
            <span>Exit Admin</span>
          </button>
        </div>
      </header>

      {/* Admin Body */}
      <div className="main-wrapper" style={{ maxWidth: '1400px', gap: '32px' }}>
        <aside style={{ width: '220px', flexShrink: 0 }}>
          <div className="mka-card flex-col gap-xs" style={{ padding: '12px' }}>
            <div style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--hurricane)', fontWeight: 600 }}>
              Moderation & Ops
            </div>
            {navItems.map((item, idx) => {
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
                    color: isActive ? 'var(--pure-white)' : 'var(--eclipse)',
                    background: isActive ? 'var(--eclipse)' : 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--swiss-coffee)' : 'var(--hurricane)' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="main-content-wide">{children}</main>
      </div>
    </div>
  );
}
