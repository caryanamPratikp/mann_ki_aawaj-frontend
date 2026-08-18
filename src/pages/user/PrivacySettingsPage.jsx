import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Checkbox } from '../../components/common/Checkbox.jsx';
import { ArrowLeft, Save, ShieldCheck, Eye, MessageSquare, Download, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function PrivacySettingsPage({ onNavigate }) {
  const { addToast } = useToast();
  const { t } = useLanguage();

  
  // Privacy preferences states
  const [allowComments, setAllowComments] = useState(true);
  const [showPublicComments, setShowPublicComments] = useState(false);
  const [dmPermission, setDmPermission] = useState('everyone');
  const [hideSearchEngines, setHideSearchEngines] = useState(true);
  const [hideLeaderboards, setHideLeaderboards] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [hideSensitive, setHideSensitive] = useState(true);
  const [autoMuteLowRep, setAutoMuteLowRep] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Privacy preferences saved successfully.', 'success');
  };

  const handleDownloadArchive = () => {
    addToast('Data export requested. An email link will be sent shortly.', 'info');
  };

  const handleClearHistory = () => {
    addToast('Search and activity history cleared.', 'info');
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
          {/* 1. Comments & Direct Messages */}
          <div className="flex-col gap-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>Comments & Direct Messaging</h3>
            </div>
            
            <Checkbox
              id="allowCommentsCheck"
              label="Allow comments on my posts by default"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
            />
            <Checkbox
              id="showPublicCommentsCheck"
              label="Show public comments tab on my profile space"
              checked={showPublicComments}
              onChange={(e) => setShowPublicComments(e.target.checked)}
            />

            <div className="flex-col gap-xs" style={{ marginTop: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--eclipse)' }}>
                Who can send me 1-on-1 Direct Message Requests?
              </label>
              <select
                value={dmPermission}
                onChange={(e) => setDmPermission(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="everyone">Everyone (All Anonymous Members)</option>
                <option value="followers">Only Users I Follow</option>
                <option value="nobody">Nobody (Disable Message Requests)</option>
              </select>
            </div>
          </div>

          {/* 2. Identity & Search Visibility */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>Identity & Search Visibility</h3>
            </div>

            <Checkbox
              id="hideSearchCheck"
              label="Hide my anonymous handle from public search engines (Google, Bing)"
              checked={hideSearchEngines}
              onChange={(e) => setHideSearchEngines(e.target.checked)}
            />
            <Checkbox
              id="hideLeaderboardsCheck"
              label="Hide my handle from community top contributors leaderboards"
              checked={hideLeaderboards}
              onChange={(e) => setHideLeaderboards(e.target.checked)}
            />
            <Checkbox
              id="showActiveCheck"
              label="Display online active status indicator to chat connections"
              checked={showActiveStatus}
              onChange={(e) => setShowActiveStatus(e.target.checked)}
            />
          </div>

          {/* 3. Content Moderation & Reputation */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--deep-plum)" />
              <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>Content Filtering & Shielding</h3>
            </div>

            <Checkbox
              id="hideSensitiveCheck"
              label="Hide sensitive or flagged posts currently undergoing moderator review"
              checked={hideSensitive}
              onChange={(e) => setHideSensitive(e.target.checked)}
            />
            <Checkbox
              id="autoMuteLowRepCheck"
              label="Automatically mute message requests from accounts with low reputation warnings"
              checked={autoMuteLowRep}
              onChange={(e) => setAutoMuteLowRep(e.target.checked)}
            />
          </div>

          {/* 4. Data Privacy Actions */}
          <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>Data & Storage Management</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button type="button" variant="secondary" size="sm" icon={Download} onClick={handleDownloadArchive}>
                Export My Data Archive
              </Button>
              <Button type="button" variant="secondary" size="sm" icon={Trash2} onClick={handleClearHistory}>
                Clear Search History
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex-row justify-end" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <Button type="submit" variant="primary" icon={Save}>
              Save All Preferences
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
