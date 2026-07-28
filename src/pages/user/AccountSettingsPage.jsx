import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

export function AccountSettingsPage({ onNavigate }) {
  const { currentUser } = useAuth();

  return (
    <UserLayout activeRoute="/settings/account" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            Back
          </Button>
          <h1 className="page-heading">Account & Private Identity</h1>
        </div>

        <div className="mka-card flex-col gap-md">
          <div className="p-sm flex-row items-center gap-sm" style={{ background: 'var(--deep-plum-light)', color: 'var(--deep-plum)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
            <Lock size={20} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              Private — Never displayed publicly to other users on Man Ki Aavaj.
            </span>
          </div>

          <div className="flex-col gap-sm">
            <div className="mka-panel">
              <span className="caption-text bold">Private Full Name:</span>
              <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                {currentUser?.fullName || 'Private Name'}
              </p>
            </div>

            <div className="mka-panel">
              <span className="caption-text bold">Mobile Number:</span>
              <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                +91 98******10 (Verified)
              </p>
            </div>

            <div className="mka-panel">
              <span className="caption-text bold">Email Address:</span>
              <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                user***@example.com (Verified)
              </p>
            </div>
          </div>

          <div className="flex-row justify-between items-center border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <Button variant="secondary" size="sm">
              Change Password
            </Button>
            <Button variant="danger" size="sm" icon={ShieldAlert}>
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
