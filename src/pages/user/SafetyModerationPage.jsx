import React, { useState, useMemo } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Checkbox } from '../../components/common/Checkbox.jsx';
import { ArrowLeft, Save, ShieldCheck, AlertTriangle, Filter, Plus, X, Flag, VolumeX, Volume2, EyeOff, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { AvatarThumbnail } from '../../components/avatar/AvatarThumbnail.jsx';

export function SafetyModerationPage({ onNavigate }) {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { mutedUsers = [], unmuteUser, hiddenPosts = [], unhidePost } = useReports();

  // Clean & deduplicate muted users list strictly 1 entry per user
  const uniqueMutedUsers = useMemo(() => {
    const map = new Map();
    (mutedUsers || []).forEach(u => {
      if (!u) return;
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean && !map.has(clean)) {
        map.set(clean, clean);
      }
    });
    return Array.from(map.values());
  }, [mutedUsers]);

  const [strictFiltering, setStrictFiltering] = useState(true);
  const [blockToxicity, setBlockToxicity] = useState(true);
  const [showCrisisSupport, setShowCrisisSupport] = useState(true);
  const [profanityFilter, setProfanityFilter] = useState(true);

  // Muted keywords state
  const [mutedWords, setMutedWords] = useState(['spoiler', 'politics', 'harassment']);
  const [newWordInput, setNewWordInput] = useState('');

  const handleAddMutedWord = (e) => {
    e.preventDefault();
    const word = newWordInput.trim().toLowerCase();
    if (!word) return;
    if (mutedWords.includes(word)) {
      addToast('Keyword is already in your muted list.', 'info');
      return;
    }
    setMutedWords([...mutedWords, word]);
    setNewWordInput('');
    addToast(`Added "${word}" to muted keywords.`, 'success');
  };

  const handleRemoveMutedWord = (wordToRemove) => {
    setMutedWords(mutedWords.filter((w) => w !== wordToRemove));
    addToast(`Removed "${wordToRemove}" from muted keywords.`, 'info');
  };

  const handleSaveSafety = (e) => {
    e.preventDefault();
    addToast(t('safetySavedSuccess', 'Safety & moderation preferences saved.'), 'success');
  };

  return (
    <UserLayout activeRoute="/settings/safety" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            {t('back', 'Back')}
          </Button>
          <h1 className="page-heading">{t('safetyAndModeration', 'Safety & Moderation')}</h1>
        </div>

        <div className="mka-card flex-col gap-md">
          {/* Account Standing Banner */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56,142,60,0.08)',
              border: '1px solid rgba(56,142,60,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="#2E7D32" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E20' }}>
                  {t('accountStandingGood', 'Account Standing: Good & Compliant')}
                </div>
                <div style={{ fontSize: '12px', color: '#388E3C' }}>
                  {t('accountStandingNote', '0 Community Warnings • 0 Content Violations • Full Platform Privileges')}
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={Flag} onClick={() => onNavigate('/my-reports')}>
              {t('myReportsHistory', 'My Reports History')}
            </Button>
          </div>

          <form onSubmit={handleSaveSafety} className="flex-col gap-md">
            {/* 1. Automated AI Safety Filters */}
            <div className="flex-col gap-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="var(--deep-plum)" />
                <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                  {t('automatedContentFilters', 'Automated Content Filters')}
                </h3>
              </div>

              <Checkbox
                id="strictFilteringCheck"
                label={t('strictAiModeration', 'Strict AI moderation: Auto-hide controversial or disputed thoughts')}
                checked={strictFiltering}
                onChange={(e) => setStrictFiltering(e.target.checked)}
              />
              <Checkbox
                id="blockToxicityCheck"
                label={t('filterAbusiveComments', 'Filter abusive comments or toxic language from discussion threads')}
                checked={blockToxicity}
                onChange={(e) => setBlockToxicity(e.target.checked)}
              />
              <Checkbox
                id="profanityFilterCheck"
                label={t('maskOffensiveProfanity', 'Mask offensive profanity words in feed titles (e.g. f***)')}
                checked={profanityFilter}
                onChange={(e) => setProfanityFilter(e.target.checked)}
              />
              <Checkbox
                id="crisisSupportCheck"
                label={t('displayCrisisSupport', 'Display supportive helpline resources on distress-related posts')}
                checked={showCrisisSupport}
                onChange={(e) => setShowCrisisSupport(e.target.checked)}
              />
            </div>

            {/* 2. Muted Keywords Manager */}
            <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--deep-plum)" />
                <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                  {t('mutedKeywordsPhrases', 'Muted Keywords & Phrases')}
                </h3>
              </div>
              <p className="secondary-text" style={{ fontSize: '13px', margin: 0 }}>
                {t('mutedKeywordsDesc', 'Posts containing any of these keywords will be hidden from your feeds automatically.')}
              </p>

              <div style={{ display: 'flex', gap: '8px', maxWidth: '420px', marginTop: '4px' }}>
                <input
                  type="text"
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  placeholder={t('enterKeywordPlaceholder', 'Enter keyword to mute...')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddMutedWord}>
                  {t('add', 'Add')}
                </Button>
              </div>

              {/* Tag Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {mutedWords.map((word) => (
                  <span
                    key={word}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      backgroundColor: 'var(--deep-plum-light)',
                      color: 'var(--deep-plum)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveMutedWord(word)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--deep-plum)',
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Muted Users Manager (Compact Rectangle Cards) */}
            <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <VolumeX size={18} color="var(--deep-plum)" />
                <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                  {t('mutedUsersTitle', 'Muted Users')} ({uniqueMutedUsers.length})
                </h3>
              </div>
              <p className="secondary-text" style={{ fontSize: '13px', margin: 0 }}>
                {t('mutedUsersDesc', 'Users you have muted. Their posts and comments are hidden from your feed.')}
              </p>

              {uniqueMutedUsers.length === 0 ? (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#FAF8F7', border: '1px dashed #E5DFDE', fontSize: '12.5px', color: '#8C8385' }}>
                  No muted users. You haven't muted anyone yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px', marginTop: '6px' }}>
                  {uniqueMutedUsers.map((uname) => {
                    const handle = `@${uname.replace(/^@/, '')}`;
                    return (
                      <div
                        key={uname}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #EAE4E4',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <AvatarThumbnail username={handle} initials={handle.slice(1, 3).toUpperCase()} size={30} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#2D1D15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {handle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => unmuteUser(uname)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(111,64,95,0.1)',
                            color: 'var(--deep-plum)',
                            border: '1px solid rgba(111,64,95,0.2)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Volume2 size={13} />
                          <span>Unmute</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Hidden Posts Manager (Beside/Below Muted Users - Persisted History Per User) */}
            <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EyeOff size={18} color="var(--deep-plum)" />
                <h3 className="card-heading" style={{ fontSize: '17px', margin: 0 }}>
                  {t('hiddenPostsTitle', 'Hidden Thoughts')} ({hiddenPosts.length})
                </h3>
              </div>
              <p className="secondary-text" style={{ fontSize: '13px', margin: 0 }}>
                {t('hiddenPostsDesc', 'Thoughts you have hidden. You can unhide any post anytime to bring it back to your feed.')}
              </p>

              {hiddenPosts.length === 0 ? (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#FAF8F7', border: '1px dashed #E5DFDE', fontSize: '12.5px', color: '#8C8385' }}>
                  No hidden thoughts. Thoughts you hide using post options (...) will be stored here.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', marginTop: '6px' }}>
                  {hiddenPosts.map((item) => {
                    const id = typeof item === 'object' ? item.id : item;
                    const title = typeof item === 'object' ? (item.title || item.content || `Post #${id}`) : `Post #${id}`;
                    const author = typeof item === 'object' ? (item.username || '@anonymous') : '@author';

                    return (
                      <div
                        key={id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #EAE4E4',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ minWidth: 0, paddingRight: '8px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#2D1D15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8C8385', marginTop: '2px' }}>
                            by {author}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => unhidePost(id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: 'rgba(56,142,60,0.1)',
                            color: '#2E7D32',
                            border: '1px solid rgba(56,142,60,0.25)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Eye size={13} />
                          <span>Unhide</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex-row justify-end" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <Button type="submit" variant="primary" icon={Save}>
                {t('saveSafetyPreferences', 'Save Safety & Moderation Preferences')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}


