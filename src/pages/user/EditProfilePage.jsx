import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import { ModerationIndicator } from '../../components/common/ModerationIndicator.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';

export function EditProfilePage({ onNavigate }) {
  const { currentUser, updateProfile } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [preferredLang, setPreferredLang] = useState(currentUser?.preferredLanguage || currentLanguage || 'English');
  const [submitting, setSubmitting] = useState(false);

  const modResult = moderationCheck(bio);
  const isBlocked = modResult.status === 'BLOCKED';

  const handleSave = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setSubmitting(true);
    try {
      changeLanguage(preferredLang);
      await updateProfile({
        bio: bio.trim(),
        preferredLanguage: preferredLang,
      });
      onNavigate(`/profile/${currentUser?.username.replace('@', '')}`);
    } catch (err) {
      console.error('Error saving profile settings:', err);
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

          {/* Preferred Language Selector */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '14px', fontWeight: 600 }} className="flex-row items-center gap-xs">
              <Globe size={16} style={{ color: 'var(--deep-plum)' }} />
              <span>Preferred Native Language</span>
            </label>
            <select
              value={supportedLanguages.find(l => l.label.toLowerCase() === (preferredLang || '').toLowerCase() || l.code.toLowerCase() === (preferredLang || '').toLowerCase())?.code || 'EN'}
              onChange={(e) => setPreferredLang(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '15px',
                background: 'var(--pure-white)',
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
            <span className="caption-text">Posts, comments, messages, and UI text will automatically adapt to your chosen language.</span>
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
