import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { Check, Sparkles, ArrowRight, ArrowLeft, Globe } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Life', 'Career', 'Relationships', 'Education', 'Student Life',
  'Workplace', 'Personal Growth', 'Parenting', 'Technology', 'Creativity',
  'Books', 'Entertainment', 'Financial Experiences', 'Positive Thoughts', 'General Discussion'
];

export function OnboardingPage({ onNavigate }) {
  const { currentUser, updateProfile } = useAuth();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState(['Life', 'Personal Growth']);
  const [primaryLang, setPrimaryLang] = useState(currentLanguage || 'English');

  const toggleInterest = (item) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleFinish = () => {
    changeLanguage(primaryLang);
    updateProfile({
      interests: selectedInterests,
      languages: [primaryLang],
    });
    onNavigate('/home');
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        {/* Onboarding Stepper Header */}
        <div className="flex-row justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <span className="caption-text bold" style={{ color: 'var(--deep-plum)' }}>
            Step {step} of 3
          </span>
          <span className="caption-text">First-Time Setup</span>
        </div>

        {step === 1 && (
          <div className="flex-col gap-md text-center animate-fade-in">
            <InitialAvatar username={currentUser?.username} initials={currentUser?.avatarInitials} size={64} className="margin-auto" />
            <div>
              <h2 className="card-heading" style={{ fontSize: '22px' }}>
                Welcome, {currentUser?.username}!
              </h2>
              <p className="secondary-text" style={{ fontSize: '14px', marginTop: '6px' }}>
                Your anonymous handle and initial-avatar have been initialized. Select your primary language preference below.
              </p>
            </div>

            <div className="flex-col gap-xs text-left" style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }} className="flex-row items-center gap-xs">
                <Globe size={16} style={{ color: 'var(--deep-plum)' }} />
                <span>Select Your Preferred Native Language</span>
              </label>
              <select
                value={primaryLang}
                onChange={(e) => {
                  setPrimaryLang(e.target.value);
                  changeLanguage(e.target.value);
                }}
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
            </div>

            <Button variant="primary" fullWidth onClick={() => setStep(2)} icon={ArrowRight}>
              Continue to Interests
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-col gap-md animate-fade-in">
            <div>
              <h2 className="card-heading" style={{ fontSize: '20px' }}>
                Select Your Content Interests
              </h2>
              <p className="secondary-text" style={{ fontSize: '13px' }}>
                Choose themes you enjoy reading about on your feed.
              </p>
            </div>

            <div className="flex-row gap-xs flex-wrap" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className="badge"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--deep-plum)' : 'var(--soft-white)',
                      color: isSelected ? 'var(--pure-white)' : 'var(--eclipse)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    {item} {isSelected && <Check size={12} style={{ marginLeft: '4px' }} />}
                  </button>
                );
              })}
            </div>

            <div className="flex-row justify-between items-center" style={{ marginTop: '12px' }}>
              <Button variant="secondary" size="sm" onClick={() => setStep(1)} icon={ArrowLeft}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(3)} icon={ArrowRight}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-col gap-md animate-fade-in text-center">
            <Sparkles size={40} style={{ color: 'var(--deep-plum)', margin: '0 auto' }} />
            <div>
              <h2 className="card-heading" style={{ fontSize: '22px' }}>
                Setup Complete!
              </h2>
              <p className="secondary-text" style={{ fontSize: '14px', marginTop: '6px' }}>
                Your anonymous reading and writing space is configured in {primaryLang}. You can switch languages anytime directly from the top navbar.
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={handleFinish}>
              Go to Home Feed
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
