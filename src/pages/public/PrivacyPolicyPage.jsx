import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';

export function PrivacyPolicyPage({ onNavigate }) {
  return (
    <PublicLayout activeRoute="/privacy-policy" onNavigate={onNavigate}>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }} className="flex-col gap-md">
        <h1 className="page-heading">Privacy Policy</h1>
        <div className="mka-card flex-col gap-md">
          <h2 className="card-heading">Identity Shielding</h2>
          <p className="body-text">
            Awaaz Man Ki strictly segregates registration data (Full Name, Phone Number, Email) from public profiles. Your real identity is never exposed to other members under any circumstance.
          </p>
          <h2 className="card-heading">Data Usage</h2>
          <p className="body-text">
            We use static client-side storage and local browser persistence for prototype demonstrations. No third-party ad tracking or selling of user data occurs.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
