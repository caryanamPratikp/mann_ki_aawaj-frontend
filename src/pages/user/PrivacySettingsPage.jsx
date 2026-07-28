import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Checkbox } from '../../components/common/Checkbox.jsx';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export function PrivacySettingsPage({ onNavigate }) {
  const { addToast } = useToast();
  const [allowComments, setAllowComments] = useState(true);
  const [showPublicComments, setShowPublicComments] = useState(false);
  const [hideSensitive, setHideSensitive] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Privacy preferences saved.', 'success');
  };

  return (
    <UserLayout activeRoute="/settings/privacy" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            Back
          </Button>
          <h1 className="page-heading">Privacy Preferences</h1>
        </div>

        <form onSubmit={handleSave} className="mka-card flex-col gap-md">
          <div className="flex-col gap-sm">
            <h3 className="card-heading" style={{ fontSize: '18px' }}>Comments & Interaction</h3>
            <Checkbox
              id="allowCommentsCheck"
              label="Allow comments on my posts by default"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
            />
            <Checkbox
              id="showPublicCommentsCheck"
              label="Show public comment tab on my profile"
              checked={showPublicComments}
              onChange={(e) => setShowPublicComments(e.target.checked)}
            />
          </div>

          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <h3 className="card-heading" style={{ fontSize: '18px' }}>Content Moderation & Filtering</h3>
            <Checkbox
              id="hideSensitiveCheck"
              label="Hide sensitive or flagged posts under review"
              checked={hideSensitive}
              onChange={(e) => setHideSensitive(e.target.checked)}
            />
          </div>

          <div className="flex-row justify-end" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <Button type="submit" variant="primary" icon={Save}>
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
