import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authService } from '../../services/authService.js';
import { ArrowLeft, KeyRound, Mail, Smartphone, Lock, Eye, EyeOff, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage({ onNavigate }) {
  const { addToast } = useToast();

  // Wizard Steps: 1 = Identifier Input, 2 = Verify OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 30-Second Cool-down Timer for OTP Resend
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isMobileInput = /^\d+$/.test(identifier.trim());

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(cleanId);
      addToast('Verification OTP sent successfully.', 'success');
      setStep(2);
      setResendTimer(30); // Start 30s cool-down timer
    } catch (err) {
      console.error(err);
      if (err?.status === 404 || err?.message?.toLowerCase().includes('not found') || err?.message?.toLowerCase().includes('account not found')) {
        const notFoundText = 'Account not found. No account is registered with this email or mobile number.';
        setErrorMsg(notFoundText);
        addToast(notFoundText, 'error');
      } else {
        const msg = err?.message || 'Failed to send recovery OTP. Please try again.';
        setErrorMsg(msg);
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler with 30s cool-down check
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await authService.forgotPassword(identifier.trim());
      addToast('New verification OTP sent successfully.', 'success');
      setResendTimer(30); // Reset 30s cool-down timer
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Failed to resend OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyForgotPasswordOtp(identifier.trim(), otp.trim());
      addToast('OTP verified successfully.', 'success');
      setStep(3);
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Invalid or expired OTP. Please try again.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(identifier.trim(), otp.trim(), newPassword);
      addToast('Password reset successfully.', 'success');
      setStep(4);
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Failed to reset password. Please try again.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Back Link */}
        {step !== 4 && (
          <button
            type="button"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else onNavigate('/login');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--hurricane)',
              fontSize: '13px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}

        {/* ── STEP 1: Enter Email or Mobile ── */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '4px' }}>
                Forgot Password
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hurricane)', lineHeight: 1.5, margin: 0 }}>
                Enter your registered email address or mobile number to receive a 6-digit recovery OTP.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                Email Address or Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none', display: 'flex' }}>
                  {isMobileInput ? <Smartphone size={16} /> : <Mail size={16} />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter you registered mail or mobile "
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: errorMsg ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
                    fontSize: '14px',
                    color: 'var(--eclipse)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {errorMsg && (
                <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={13} /> {errorMsg}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '8px',
                background: loading ? 'var(--zorba)' : 'var(--deep-plum)',
                color: 'var(--pure-white)',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                marginTop: '4px',
              }}
            >
              <KeyRound size={17} />
              {loading ? 'Checking Account...' : 'Send Recovery OTP'}
            </button>
          </form>
        )}

        {/* ── STEP 2: Verify OTP (with 30s Cool-Down) ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '4px' }}>
                Verify OTP Code
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hurricane)', lineHeight: 1.5, margin: 0 }}>
                Verification OTP sent to <strong style={{ color: 'var(--deep-plum)' }}>{identifier}</strong>. Please enter the 6-digit code below.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                6-Digit OTP Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                placeholder="Enter OTP "
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errorMsg ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  color: 'var(--eclipse)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errorMsg && (
                <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={13} /> {errorMsg}
                </span>
              )}
            </div>

            {/* 30-Second Resend Cool-Down Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--hurricane)' }}>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? 'var(--hurricane)' : 'var(--deep-plum)',
                  fontWeight: 700,
                  cursor: resendTimer > 0 || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: resendTimer > 0 ? 'none' : 'underline',
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '8px',
                background: loading ? 'var(--zorba)' : 'var(--eclipse)',
                color: 'var(--pure-white)',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                marginTop: '4px',
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* ── STEP 3: Reset Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '4px' }}>
                Create New Password
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--hurricane)', lineHeight: 1.5, margin: 0 }}>
                Set a strong new password for your account.
              </p>
            </div>

            {/* New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none', display: 'flex' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="At least 8 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    borderRadius: '8px',
                    border: errorMsg ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
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
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hurricane)', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--eclipse)' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hurricane)', pointerEvents: 'none', display: 'flex' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="Re-enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    borderRadius: '8px',
                    border: errorMsg ? '2px solid var(--error)' : '1.5px solid var(--border-light)',
                    fontSize: '14px',
                    color: 'var(--eclipse)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {errorMsg && (
                <span style={{ fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={13} /> {errorMsg}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '8px',
                background: loading ? 'var(--zorba)' : 'var(--deep-plum)',
                color: 'var(--pure-white)',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                marginTop: '4px',
              }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* ── STEP 4: Success Message ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '16px 0' }}>
            <CheckCircle2 size={48} color="#10B981" />
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '6px' }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--hurricane)', lineHeight: 1.5, margin: 0 }}>
                Your account password has been updated. You can now login with your new credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '8px',
                background: 'var(--eclipse)',
                color: 'var(--pure-white)',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                marginTop: '8px',
              }}
            >
              Return to Login
            </button>
          </div>
        )}

      </div>
    </AuthLayout>
  );
}
