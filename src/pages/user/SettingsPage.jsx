import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Shield, Lock, User, Bell, ChevronRight } from 'lucide-react';

export function SettingsPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const sections = [
    {
      titleKey: 'accountSettings',
      defaultTitle: 'Account Settings',
      descKey: 'accountSettingsDesc',
      defaultDesc: 'Private full name, mobile number, email, and password.',
      icon: User,
      route: '/settings/account',
    },
    {
      titleKey: 'notificationSettings',
      defaultTitle: 'Notification Settings',
      descKey: 'notificationSettingsDesc',
      defaultDesc: 'Message toasts, reaction alerts, comment notices, and sound chime.',
      icon: Bell,
      route: '/settings/notifications',
    },
    {
      titleKey: 'privacySettings',
      defaultTitle: 'Privacy Settings',
      descKey: 'privacySettingsDesc',
      defaultDesc: 'Comment permissions, activity visibility, sensitive content.',
      icon: Lock,
      route: '/settings/privacy',
    },
    {
      titleKey: 'safetyAndModeration',
      defaultTitle: 'Safety & Moderation',
      descKey: 'safetyAndModerationDesc',
      defaultDesc: 'Blocked users list, reports tracking, guidelines.',
      icon: Shield,
      route: '/settings/safety',
    },
  ];

  return (
    <UserLayout activeRoute="/settings" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">{t('settingsAndPreferences', 'Settings & Preferences')}</h1>
          <p className="secondary-text">{t('manageIdentitySafety', 'Manage your private identity, safety controls, and notifications.')}</p>
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
                      {t(sec.titleKey, sec.defaultTitle)}
                    </h3>
                    <p className="secondary-text" style={{ fontSize: '13px' }}>
                      {t(sec.descKey, sec.defaultDesc)}
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
