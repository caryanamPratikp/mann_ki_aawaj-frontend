import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ArrowLeft, Save } from 'lucide-react';
import { ModerationIndicator } from '../../components/common/ModerationIndicator.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

export function EditProfilePage({ onNavigate }) {
  const { currentUser, updateProfile } = useAuth();

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [submitting, setSubmitting] = useState(false);

  const modResult = moderationCheck(bio);
  const isBlocked = modResult.status === 'BLOCKED';

  const handleSave = (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setSubmitting(true);
    try {
      updateProfile({ bio: bio.trim() });
      onNavigate(`/profile/${currentUser?.username.replace('@', '')}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout activeRoute="/edit-profile" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            Back
          </Button>
          <h1 className="page-heading">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="mka-card flex-col gap-md">
          <div className="mka-panel">
            <span className="caption-text bold">Platform Username (Anonymous):</span>
            <p className="bold" style={{ fontSize: '16px', marginTop: '4px' }}>{currentUser?.username}</p>
          </div>

          <div className="flex-col gap-xs">
            <Textarea
              label="Bio"
              placeholder="Write a short anonymous bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={200}
              showCounter
            />
            <ModerationIndicator text={bio} />
          </div>

          <div className="flex-row justify-end gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <Button type="button" variant="secondary" onClick={() => onNavigate('/settings')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isBlocked || submitting} icon={Save}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
