import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogIn, User, Mail, Phone } from 'lucide-react';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [idFocused, setIdFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  // Detect what the user is typing to show the right hint icon
  const getIdentifierType = () => {
    if (!identifier) return null;
    if (identifier.startsWith('@')) return 'username';
    if (/^\d/.test(identifier)) return 'mobile';
    if (identifier.includes('@') && !identifier.startsWith('@')) return 'email';
    return null;
  };

  const idType = getIdentifierType();

  const IdentifierIcon = idType === 'email' ? Mail : idType === 'mobile' ? Phone : User;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setSubmitting(true);
    try {
      // Pass identifier — mockAuthService will match username, email or mobile
      await login(identifier.trim(), password);
      onNavigate('/home');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = {
    width: '100%',
    padding: '13px 14px 13px 42px',
    borderRadius: '10px',
    fontSize: '15px',
    color: 'var(--eclipse)',
    background: 'var(--pure-white)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '4px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '6px' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--hurricane)', lineHeight: 1.5 }}>
            Log in with your <strong>username</strong>, <strong>mobile number</strong>, or <strong>email address</strong>.
          </p>
        </div>

        {/* Identifier field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
            Username / Mobile / Email
          </label>
          <div style={{ position: 'relative' }}>
            {/* Left icon */}
            <div style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: idFocused ? 'var(--deep-plum)' : 'var(--hurricane)',
              display: 'flex', alignItems: 'center', pointerEvents: 'none',
              transition: 'color 0.2s',
            }}>
              <IdentifierIcon size={16} />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={() => setIdFocused(true)}
              onBlur={() => setIdFocused(false)}
              placeholder="@handle  •  +91 9876543210  •  you@email.com"
              required
              style={{
                ...inputBase,
                border: idFocused
                  ? '2px solid var(--deep-plum)'
                  : '2px solid var(--border-light)',
                boxShadow: idFocused ? '0 0 0 3px rgba(111,64,95,0.10)' : 'none',
              }}
            />
          </div>
          {/* Tiny type hint */}
          {idType && (
            <span style={{ fontSize: '11px', color: 'var(--deep-plum)', fontWeight: 600, marginTop: '-2px' }}>
              {idType === 'username' && '→ Signing in by username'}
              {idType === 'email' && '→ Signing in by email'}
              {idType === 'mobile' && '→ Signing in by mobile number'}
            </span>
          )}
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: pwFocused ? 'var(--deep-plum)' : 'var(--hurricane)',
              display: 'flex', alignItems: 'center', pointerEvents: 'none',
              fontSize: '16px', letterSpacing: '2px',
              transition: 'color 0.2s',
            }}>
              •••
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              placeholder="Enter your password"
              required
              style={{
                ...inputBase,
                border: pwFocused
                  ? '2px solid var(--deep-plum)'
                  : '2px solid var(--border-light)',
                boxShadow: pwFocused ? '0 0 0 3px rgba(111,64,95,0.10)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Forgot password */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
          <button
            type="button"
            onClick={() => onNavigate('/forgot-password')}
            style={{ fontSize: '13px', color: 'var(--deep-plum)', fontWeight: 500 }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            background: submitting ? 'var(--hurricane)' : 'var(--eclipse)',
            color: 'var(--pure-white)',
            fontSize: '15px',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s, transform 0.15s',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <LogIn size={17} />
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--hurricane)', marginTop: '-4px' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            style={{ color: 'var(--deep-plum)', fontWeight: 700, textDecoration: 'underline' }}
          >
            Register anonymous handle
          </button>
        </p>

      </form>
    </AuthLayout>
  );
}
