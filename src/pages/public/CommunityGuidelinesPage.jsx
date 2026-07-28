import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';

export function CommunityGuidelinesPage({ onNavigate }) {
  return (
    <PublicLayout activeRoute="/community-guidelines" onNavigate={onNavigate}>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }} className="flex-col gap-md">
        <h1 className="page-heading">Community Guidelines</h1>
        <div className="mka-card flex-col gap-md">
          <h2 className="card-heading">1. Zero Tolerance for Hate Speech</h2>
          <p className="body-text">
            Hate speech, abusive language, harassment, threats, religious offense, political conflict, and personal information exposure are strictly prohibited.
          </p>
          <h2 className="card-heading">2. Real-Time Moderation</h2>
          <p className="body-text">
            All posts, comments, replies, bios, and report explanations pass through our automated moderation engine before public publication.
          </p>
          <h2 className="card-heading">3. Respectful Dialogue</h2>
          <p className="body-text">
            Engage with empathy. Use supportive reactions (*I Relate*, *Helpful*, *Well Said*, *Stay Strong*, *Made Me Think*) to build a constructive community environment.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
