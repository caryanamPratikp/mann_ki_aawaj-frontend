import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { loginSchema } from '../../utils/validationSchemas.js';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    // Zod validation
    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const errMap = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0]] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      // Admins live in the backend Admin table and deliberately have no user profile.
      // Role must be checked before the profile-onboarding condition.
      if (res?.user?.role === 'ADMIN') {
        onNavigate('/admin/dashboard');
        return;
      }
      // Check if user has completed profile setup (GET /api/profile/me)
      if (res && res.hasProfile === false) {
        addToast('Please complete your profile setup.', 'info');
        onNavigate('/profile-setup');
      } else {
        onNavigate('/home');
      }
    } catch (err) {
      console.error(err);
      if (err?.errors && typeof err.errors === 'object') {
        setErrors(err.errors);
      } else {
        addToast(err?.message || 'Invalid email or password.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Header */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '4px' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--hurricane)', lineHeight: 1.5, margin: 0 }}>
            Sign in to your account using your email and password.
          </p>
        </div>

        {/* Email Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none', display: 'flex' }}>
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: null })); }}
              placeholder="aman@example.com"
              required
              style={{
                width: '100%',
                padding: '11px 12px 11px 38px',
                borderRadius: '8px',
                border: errors.email ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
                fontSize: '14px',
                color: 'var(--eclipse)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {errors.email && (
            <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} /> {errors.email}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none', display: 'flex' }}>
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: null })); }}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '11px 40px 11px 38px',
                borderRadius: '8px',
                border: errors.password ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
                fontSize: '14px',
                color: 'var(--eclipse)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--hurricane)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && (
            <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} /> {errors.password}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '8px',
            background: submitting ? 'var(--zorba)' : 'var(--eclipse)',
            color: 'var(--pure-white)',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            marginTop: '6px',
            transition: 'background 0.18s ease',
          }}
        >
          <LogIn size={17} />
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--hurricane)', margin: 0 }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            style={{
              color: 'var(--deep-plum)',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Create Anonymous Account
          </button>
        </p>

      </form>
    </AuthLayout>
  );
}
