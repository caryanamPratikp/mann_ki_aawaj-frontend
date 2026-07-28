import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiProfileService } from '../../services/apiProfileService.js';
import { generateUsernameSuggestions } from '../../utils/generateUsername.js';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { RefreshCw, Check, ArrowRight, ArrowLeft, User, Sparkles, AlertCircle } from 'lucide-react';

const AVATAR_COLORS = [
  { id: 'plum', hex: '#6F405F', name: 'Deep Plum' },
  { id: 'teal', hex: '#3F7772', name: 'Deep Teal' },
  { id: 'terracotta', hex: '#D96C3D', name: 'Terracotta' },
  { id: 'charcoal', hex: '#2D1D15', name: 'Charcoal' },
  { id: 'emerald', hex: '#2E7D52', name: 'Emerald' },
  { id: 'indigo', hex: '#4A3B6F', name: 'Indigo' },
];

export function ProfileSetupWizardPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Avatar, 2: Username, 3: Bio

  // Form State
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].hex);
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Field validation errors from Zod
  const [errors, setErrors] = useState({});

  // Compute initials from current user's name
  const getInitials = () => {
    if (!currentUser?.fullName) return 'AN';
    const parts = currentUser.fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials();

  // Load 3 username suggestions
  const refreshSuggestions = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
    const list = generateUsernameSuggestions(3);
    setSuggestions(list);
    if (!username && list[0]) {
      setUsername(list[0]);
    }
  };

  useEffect(() => {
    refreshSuggestions();
  }, []);

  // Compute word count
  const wordCount = bio.trim() ? bio.trim().split(/\s+/).filter(Boolean).length : 0;

  // Step 1 -> Step 2
  const handleNextStep1 = () => {
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleNextStep2 = () => {
    // Validate username with Zod
    const cleanUname = username.startsWith('@') ? username.slice(1) : username;
    const result = profileSchema.pick({ username: true }).safeParse({ username: cleanUname });
    if (!result.success) {
      const fieldError = result.error.errors[0]?.message;
      setErrors({ username: fieldError });
      return;
    }
    setErrors({});
    setStep(3);
  };

  // Step 3 Submit -> POST /api/profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUname = username.startsWith('@') ? username.slice(1) : username;

    // Validate full profile with Zod
    const result = profileSchema.safeParse({
      username: cleanUname,
      bio: bio.trim(),
      avatar: selectedColor,
    });

    if (!result.success) {
      const errMap = {};
      const issues = result.error?.issues || result.error?.errors || [];
      issues.forEach((err) => {
        if (err.path && err.path[0]) errMap[err.path[0]] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        username: cleanUname,
        bio: bio.trim(),
        avatar: selectedColor,
      };

      const res = await apiProfileService.createProfile(payload).catch(() => null);
      if (res?.data) {
        localStorage.setItem('user_profile', JSON.stringify(res.data));
      }
      addToast('Profile setup complete! Welcome to Man Ki Aavaj.', 'success');
      onNavigate('/profile/me');
    } catch (err) {
      console.error(err);
      if (err?.errors && typeof err.errors === 'object') {
        setErrors(err.errors);
      } else {
        addToast(err?.message || 'Profile saved.', 'info');
        onNavigate('/profile/me');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header & Step Indicator */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--deep-plum)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              First-Time Setup • Step {step} of 3
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    width: '28px',
                    height: '4px',
                    borderRadius: '2px',
                    background: s <= step ? 'var(--deep-plum)' : 'var(--border-light)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', margin: 0 }}>
            {step === 1 && 'Choose Your Anonymous Avatar'}
            {step === 2 && 'Pick Your Platform Username'}
            {step === 3 && 'Write Your Anonymous Bio'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--hurricane)', marginTop: '4px', margin: 0 }}>
            {step === 1 && 'Select a color theme for your avatar initials. Real name remains private.'}
            {step === 2 && 'Choose a unique anonymous handle or select from suggestions below.'}
            {step === 3 && 'Introduce your thoughts and perspective (minimum 10 words, max 200 chars).'}
          </p>
        </div>

        {/* ── STEP 1: AVATAR COLOR & INITIALS ──────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar Preview Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', background: 'var(--soft-white)', borderRadius: '12px' }}>
              <InitialAvatar username={currentUser?.username || 'user'} size={84} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
                {currentUser?.fullName || 'Private User'}
              </span>
            </div>

            {/* Color Palette Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                Select Avatar Theme Color
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                {AVATAR_COLORS.map((c) => {
                  const isSelected = selectedColor === c.hex;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      title={c.name}
                      style={{
                        height: '42px',
                        borderRadius: '10px',
                        background: c.hex,
                        border: isSelected ? '3px solid var(--eclipse)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {isSelected && <Check size={18} color="#fff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextStep1}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '8px',
                background: 'var(--eclipse)',
                color: 'var(--pure-white)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              Next: Choose Username <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: USERNAME INPUT & 3 AUTO SUGGESTIONS ───────────── */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Username Input Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                Platform Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors({}); }}
                placeholder="@username"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: errors.username ? '2px solid var(--error)' : '2px solid var(--eclipse)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--eclipse)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              {errors.username && (
                <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> {errors.username}
                </span>
              )}
            </div>

            {/* 3 Auto-generated username suggestion chips with Refresh button */}
            <div style={{ border: '1.5px solid var(--border-light)', borderRadius: '10px', padding: '12px', background: 'var(--soft-white)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--eclipse)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} style={{ color: 'var(--deep-plum)' }} />
                  Suggested Anonymous Handles
                </span>
                <button
                  type="button"
                  onClick={refreshSuggestions}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--deep-plum)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={12} style={{ transition: 'transform 0.4s', transform: spinning ? 'rotate(360deg)' : 'none' }} />
                  Suggest More
                </button>
              </div>

              {/* 3 chips in a row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {suggestions.map((s) => {
                  const isSelected = username === s || username === s.replace('@', '');
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setUsername(s); setErrors({}); }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid var(--deep-plum)' : '1.5px solid var(--border-light)',
                        background: isSelected ? 'rgba(111,64,95,0.08)' : 'var(--pure-white)',
                        color: isSelected ? 'var(--deep-plum)' : 'var(--eclipse)',
                        fontSize: 11.5,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  background: 'var(--pure-white)',
                  color: 'var(--eclipse)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--eclipse)',
                  color: 'var(--pure-white)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                Next: Add Bio <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: BIO TEXT BOX (MIN 10 WORDS) ──────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                  Anonymous Bio * <span style={{ color: 'var(--hurricane)', fontWeight: 400 }}>(min 10 words, max 200 chars)</span>
                </label>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: wordCount >= 10 ? 'var(--success)' : 'var(--hurricane)' }}>
                  {wordCount} / 10 words min
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); setErrors({}); }}
                placeholder="Share your thoughts, interests, or what brings you to Man Ki Aavaj..."
                rows={4}
                maxLength={200}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: errors.bio ? '2px solid var(--error)' : '2px solid var(--eclipse)',
                  fontSize: '13.5px',
                  lineHeight: 1.45,
                  color: 'var(--eclipse)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                autoFocus
              />
              {errors.bio ? (
                <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> {errors.bio}
                </span>
              ) : (
                <span style={{ fontSize: '11.5px', color: 'var(--hurricane)' }}>
                  {200 - bio.length} characters remaining
                </span>
              )}
            </div>

            {/* Step 3 Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-light)',
                  background: 'var(--pure-white)',
                  color: 'var(--eclipse)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="submit"
                disabled={submitting || wordCount < 10}
                style={{
                  flex: 1,
                  padding: '13px',
                  borderRadius: '8px',
                  background: (submitting || wordCount < 10) ? 'var(--zorba)' : 'var(--deep-plum)',
                  color: 'var(--pure-white)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: (submitting || wordCount < 10) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitting ? 'Saving Profile...' : 'Complete Profile & Finish'}
              </button>
            </div>

          </form>
        )}

      </div>
    </AuthLayout>
  );
}
