import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Eye, EyeOff, CheckCircle2,
  Mic2, ArrowLeft, Check,
} from 'lucide-react';

/* ─── Palette ──────────────────────────────────────────── */
const C = {
  bg: '#E1DCDB',
  card: '#F7F4F3',
  eclipse: '#2D1D15',
  zorba: '#9F9794',
  hurricane: '#8C8385',
  plum: '#6F405F',
  plumDark: '#5A3350',
  plumLight: 'rgba(111,64,95,0.08)',
  border: '#D4CECC',
  success: '#2E7D52',
  error: '#B33A3A',
};

/* ─── Shared input style ────────────────────────────────── */
const inp = (focused, error) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: `1.5px solid ${error ? C.error : focused ? C.eclipse : C.border}`,
  background: '#fff',
  fontSize: '13px',
  color: C.eclipse,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.18s',
});

/* ─── Small label ───────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <span style={{ fontSize: '11.5px', fontWeight: 600, color: C.eclipse, letterSpacing: '0.02em' }}>
      {children}
      {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
    </span>
  );
}

/* ─── Verify row: input + button or verified badge ─────── */
function VerifyRow({ label, type = 'text', value, onChange, placeholder,
  verified, onVerify, disabled }) {
  const [focused, setFocused] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpErr, setOtpErr] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);

  const triggerVerify = () => {
    if (!value.trim()) { return; }
    setShowOtp(true);
    setOtp('');
    setOtpErr('');
  };

  const confirmOtp = () => {
    if (otp.length === 6) { setShowOtp(false); onVerify(); }
    else setOtpErr('Enter all 6 digits');
  };

  if (verified) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Label>{label}</Label>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 8,
          border: `1.5px solid ${C.success}`, background: 'rgba(46,125,82,0.06)',
        }}>
          <span style={{ fontSize: 13, color: C.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} /> {value}
          </span>
          <button type="button" onClick={() => onChange('')}
            style={{ fontSize: 11, color: C.hurricane, textDecoration: 'underline', background: 'none', cursor: 'pointer' }}>
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label required>{label}</Label>
      <div style={{ display: 'flex', gap: 7 }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={{ ...inp(focused), flex: 1, minWidth: 0 }}
        />
        <button
          type="button"
          onClick={triggerVerify}
          style={{
            flexShrink: 0, padding: '9px 14px', borderRadius: 8,
            background: C.eclipse, color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1a100a'}
          onMouseLeave={e => e.currentTarget.style.background = C.eclipse}
        >
          Verify
        </button>
      </div>

      {/* Inline OTP */}
      {showOtp && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          padding: '10px 12px', borderRadius: 8,
          background: 'rgba(45,29,21,0.04)',
          border: `1px dashed ${C.zorba}`,
        }}>
          <span style={{ fontSize: 11, color: C.hurricane }}>
            Enter 6-digit OTP sent to <strong style={{ color: C.eclipse }}>{value}</strong>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpErr(''); }}
              onFocus={() => setOtpFocused(true)}
              onBlur={() => setOtpFocused(false)}
              placeholder="••••••"
              style={{
                flex: 1, ...inp(otpFocused, !!otpErr),
                letterSpacing: '0.25em', fontWeight: 700, textAlign: 'center',
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={confirmOtp}
              style={{
                padding: '9px 14px', borderRadius: 8,
                background: C.plum, color: '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
          {otpErr && <span style={{ fontSize: 11, color: C.error }}>{otpErr}</span>}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [confirm18, setConfirm18] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptGuidelines, setAcceptGuidelines] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = fullName.trim() && mobile && email && password
    && confirm18 && acceptTerms && acceptGuidelines && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      addToast('Please fill all fields and confirm agreements.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await register({ fullName, mobile, email, password });
      onNavigate('/onboarding');
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Checkbox row ──────────────────────────────────────── */
  const CheckRow = ({ id, checked, onChange, children }) => (
    <label htmlFor={id} style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
      fontSize: 12, color: C.eclipse, lineHeight: 1.45,
    }}>
      <div
        onClick={onChange}
        style={{
          flexShrink: 0,
          marginTop: 1,
          width: 15, height: 15,
          borderRadius: 4,
          border: `1.5px solid ${checked ? C.plum : C.zorba}`,
          background: checked ? C.plum : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
        }}
      >
        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
      </div>
      <span>{children}</span>
    </label>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* Back to home */}
      <button
        type="button"
        onClick={() => onNavigate('/')}
        style={{
          position: 'fixed', top: 20, left: 24,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500, color: C.hurricane,
          background: 'transparent', cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.eclipse}
        onMouseLeave={e => e.currentTarget.style.color = C.hurricane}
      >
        <ArrowLeft size={14} /> Home
      </button>

      {/* ── CARD ─────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        maxWidth: 560,
        background: C.card,
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(45,29,21,0.10), 0 1px 4px rgba(45,29,21,0.06)',
        padding: '32px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>

        {/* ── Header ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.eclipse,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mic2 size={15} color={C.bg} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.eclipse, letterSpacing: '-0.01em' }}>
              Man Ki Aavaj
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.eclipse, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Create Anonymous Account
          </h1>
          <p style={{ fontSize: 13, color: C.hurricane, margin: 0 }}>
            Your identity stays private. Your voice matters.
          </p>

          {/* Privacy badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
            {[
              { icon: '🔒', text: 'Real name never shown publicly' },
              { icon: '🎭', text: 'Only username visible to others' },
            ].map(b => (
              <span key={b.text} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 500, color: C.hurricane,
                background: 'rgba(45,29,21,0.06)',
                padding: '3px 9px', borderRadius: 20,
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── FORM ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required>Full Name</Label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your real name (kept private)"
              required
              style={inp(false)}
            />
          </div>



          {/* Mobile & Email — 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <VerifyRow
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={v => { setMobile(v); setMobileVerified(false); }}
              placeholder="+91 9876543210"
              verified={mobileVerified}
              onVerify={() => setMobileVerified(true)}
            />
            <VerifyRow
              label="Email Address"
              type="email"
              value={email}
              onChange={v => { setEmail(v); setEmailVerified(false); }}
              placeholder="you@email.com"
              verified={emailVerified}
              onVerify={() => setEmailVerified(true)}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required>Password</Label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                placeholder="Create a strong password"
                required
                style={{ ...inp(pwFocused), paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', cursor: 'pointer', color: C.zorba,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '2px 0' }} />

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CheckRow checked={confirm18} onChange={() => setConfirm18(p => !p)}>
              I confirm I am <strong>&nbsp;18 years or older</strong>
            </CheckRow>
            <CheckRow checked={acceptTerms} onChange={() => setAcceptTerms(p => !p)}>
              I accept the <span style={{ color: C.plum, textDecoration: 'underline', cursor: 'pointer' }}>Terms &amp; Conditions</span>
            </CheckRow>
            <CheckRow checked={acceptGuidelines} onChange={() => setAcceptGuidelines(p => !p)}>
              I agree to <span style={{ color: C.plum, textDecoration: 'underline', cursor: 'pointer' }}>Community Guidelines</span> and Hate Speech Policy
            </CheckRow>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              background: canSubmit ? C.plum : C.zorba,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              letterSpacing: '0.01em',
              transition: 'background 0.2s, transform 0.15s',
              border: 'none',
            }}
            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = C.plumDark; }}
            onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = C.plum; }}
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12.5, color: C.hurricane, margin: 0 }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              style={{ color: C.plum, fontWeight: 700, textDecoration: 'underline', background: 'none', cursor: 'pointer', fontSize: 12.5 }}
            >
              Login
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}
