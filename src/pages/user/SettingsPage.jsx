import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, Lock, Bell, User, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

export function SettingsPage({ onNavigate }) {
  const { currentUser } = useAuth();

  const sections = [
    {
      title: 'Account Settings',
      description: 'Private full name, mobile number, email, and password.',
      icon: User,
      route: '/settings/account',
    },
    {
      title: 'Privacy Settings',
      description: 'Comment permissions, activity visibility, sensitive content.',
      icon: Lock,
      route: '/settings/privacy',
    },
    {
      title: 'Safety & Moderation',
      description: 'Blocked users list, reports tracking, guidelines.',
      icon: Shield,
      route: '/my-reports',
    },
  ];

  return (
    <UserLayout activeRoute="/settings" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">Settings & Preferences</h1>
          <p className="secondary-text">Manage your private identity, safety preferences, and notifications.</p>
        </div>

        <div className="flex-col gap-md">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="mka-card mka-card-interactive flex-row items-center justify-between"
                onClick={() => onNavigate(sec.route)}
                style={{ cursor: 'pointer', padding: '20px' }}
              >
                <div className="flex-row items-center gap-md">
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--deep-plum-light)',
                      color: 'var(--deep-plum)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-col">
                    <h3 className="card-heading" style={{ fontSize: '17px' }}>
                      {sec.title}
                    </h3>
                    <p className="secondary-text" style={{ fontSize: '13px' }}>
                      {sec.description}
                    </p>
                  </div>
                </div>

                <ChevronRight size={20} style={{ color: 'var(--hurricane)' }} />
              </div>
            );
          })}
        </div>
      </div>
    </UserLayout>
  );
}
