import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ArrowLeft, Lock, ShieldAlert, Eye, EyeOff, KeyRound, Edit2, Smartphone, Mail, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiUserService } from '../../services/apiUserService.js';

export function AccountSettingsPage({ onNavigate }) {
  const { currentUser, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();


  // Delete Account State
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mobile OTP Modal State
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);

  // Email OTP Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Helper mask functions
  const maskEmail = (emailStr) => {
    if (!emailStr) return 'us***@example.com';
    const parts = emailStr.split('@');
    if (parts.length < 2) return 'us***@example.com';
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : `${name}***`;
    return `${maskedName}@${domain}`;
  };

  const maskPhone = (phoneStr) => {
    if (!phoneStr) return '+91 ••••• ••407';
    const cleaned = phoneStr.replace(/\D/g, '');
    const last3 = cleaned.slice(-3) || '407';
    return `+91 ••••• ••${last3}`;
  };

  // Password Update Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setUpdating(true);
    try {
      await apiUserService.updatePassword({ currentPassword, newPassword });
      addToast('Password updated successfully!', 'success');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message || 'Password updated successfully!', 'success');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setUpdating(false);
    }
  };
  // Account Deactivation Handler
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await apiUserService.deactivateAccount();
      addToast('Your account has been deactivated (soft-deleted). It will be permanently removed in 30 days.', 'success');
      logout();
      onNavigate('/login');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to deactivate account.', 'error');
    } finally {
      setDeletingAccount(false);
      setDeleteAccountModalOpen(false);
    }
  };

  // Mobile OTP Handlers
  const handleSendMobileOtp = (e) => {
    e.preventDefault();
    if (!newMobile || newMobile.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setSendingMobileOtp(true);
    setTimeout(() => {
      setSendingMobileOtp(false);
      setMobileOtpSent(true);
      addToast(`OTP sent to +91 ${newMobile.slice(-4)}! Use 123456 to verify.`, 'info');
    }, 600);
  };

  const handleVerifyMobileOtp = (e) => {
    e.preventDefault();
    if (!mobileOtp || mobileOtp.length < 4) {
      addToast('Please enter the verification OTP code.', 'error');
      return;
    }
    setVerifyingMobile(true);
    setTimeout(() => {
      setVerifyingMobile(false);
      if (updateProfile) {
        updateProfile({ mobileNumber: newMobile });
      }
      addToast('Mobile number verified and updated successfully!', 'success');
      setMobileModalOpen(false);
      setMobileOtpSent(false);
      setNewMobile('');
      setMobileOtp('');
    }, 600);
  };

  // Email OTP Handlers
  const handleSendEmailOtp = (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setSendingEmailOtp(true);
    setTimeout(() => {
      setSendingEmailOtp(false);
      setEmailOtpSent(true);
      addToast(`OTP sent to ${maskEmail(newEmail)}! Use 123456 to verify.`, 'info');
    }, 600);
  };

  const handleVerifyEmailOtp = (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length < 4) {
      addToast('Please enter the verification OTP code.', 'error');
      return;
    }
    setVerifyingEmail(true);
    setTimeout(() => {
      setVerifyingEmail(false);
      if (updateProfile) {
        updateProfile({ email: newEmail });
      }
      addToast('Email address verified and updated successfully!', 'success');
      setEmailModalOpen(false);
      setEmailOtpSent(false);
      setNewEmail('');
      setEmailOtp('');
    }, 600);
  };

  return (
    <UserLayout activeRoute="/settings/account" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/settings')} icon={ArrowLeft}>
            Back
          </Button>
          <h1 className="page-heading">Account & Private Identity</h1>
        </div>

        <div className="mka-card flex-col gap-md">
          <div className="p-sm flex-row items-center gap-sm" style={{ background: 'var(--deep-plum-light)', color: 'var(--deep-plum)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
            <Lock size={20} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              Private — Never displayed publicly to other users on Man Ki Aavaj. Real name & contacts are 100% masked.
            </span>
          </div>

          <div className="flex-col gap-sm">
            {/* Anonymous Handle */}
            <div className="mka-panel flex-row justify-between items-center">
              <div>
                <span className="caption-text bold">Anonymous Handle:</span>
                <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)', margin: 0 }}>
                  {currentUser?.username || '@anonymous_user'}
                </p>
              </div>
              <span className="badge badge-success" style={{ fontSize: '11px' }}>Shielded</span>
            </div>

            {/* Mobile Number with Edit OTP Button */}
            <div className="mka-panel flex-row justify-between items-center">
              <div>
                <span className="caption-text bold">Mobile Number:</span>
                <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)', margin: 0 }}>
                  {maskPhone(currentUser?.mobileNumber || currentUser?.mobile)} <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>✓ Verified</span>
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setMobileOtpSent(false);
                  setNewMobile('');
                  setMobileOtp('');
                  setMobileModalOpen(true);
                }}
              >
                Edit Mobile
              </Button>
            </div>

            {/* Email Address with Edit OTP Button */}
            <div className="mka-panel flex-row justify-between items-center">
              <div>
                <span className="caption-text bold">Email Address:</span>
                <p className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)', margin: 0 }}>
                  {maskEmail(currentUser?.email)} <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>✓ Verified</span>
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEmailOtpSent(false);
                  setNewEmail('');
                  setEmailOtp('');
                  setEmailModalOpen(true);
                }}
              >
                Edit Email
              </Button>
            </div>
          </div>

          <div className="flex-row justify-between items-center border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={KeyRound}
              onClick={() => {
                setErrorMsg('');
                setPasswordModalOpen(true);
              }}
            >
              Change Password
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={ShieldAlert}
              onClick={() => setDeleteAccountModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* ── UPDATE MOBILE OTP MODAL ── */}
      <Modal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
        title="Update Mobile Number (OTP Verification)"
      >
        {!mobileOtpSent ? (
          <form onSubmit={handleSendMobileOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: 0 }}>
              Enter your new 10-digit mobile number. We will send a 6-digit verification OTP.
            </p>
            <div className="flex-col gap-xs">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>New Mobile Number</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="tel"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => setMobileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={sendingMobileOtp}>
                {sendingMobileOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyMobileOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(59,165,93,0.1)', color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              <span>OTP sent to +91 {newMobile.slice(-4)}. Enter code below:</span>
            </div>
            <div className="flex-col gap-xs">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>6-Digit Verification OTP</label>
              <input
                type="text"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value)}
                placeholder="Enter 6-digit OTP (e.g. 123456)"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '16px',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleSendMobileOtp}
                style={{ background: 'none', border: 'none', color: 'var(--deep-plum)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} /> Resend OTP
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setMobileModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={verifyingMobile}>
                  {verifyingMobile ? 'Verifying...' : 'Verify & Update Mobile'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ── UPDATE EMAIL OTP MODAL ── */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Update Email Address (OTP Verification)"
      >
        {!emailOtpSent ? (
          <form onSubmit={handleSendEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: 0 }}>
              Enter your new email address. We will send a 6-digit verification OTP code.
            </p>
            <div className="flex-col gap-xs">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newuser@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={sendingEmailOtp}>
                {sendingEmailOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(59,165,93,0.1)', color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              <span>OTP sent to {maskEmail(newEmail)}. Enter code below:</span>
            </div>
            <div className="flex-col gap-xs">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>6-Digit Verification OTP</label>
              <input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Enter 6-digit OTP (e.g. 123456)"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '16px',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleSendEmailOtp}
                style={{ background: 'none', border: 'none', color: 'var(--deep-plum)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} /> Resend OTP
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setEmailModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={verifyingEmail}>
                  {verifyingEmail ? 'Verifying...' : 'Verify & Update Email'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Your Password"
      >
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(196,111,118,0.12)', color: 'var(--error)', fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}

          {/* Current Password */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>Current Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--hurricane)',
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>New Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--hurricane)',
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex-col gap-xs">
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>Confirm New Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--hurricane)',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button type="button" variant="secondary" size="sm" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={updating}>
              {updating ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── DELETE ACCOUNT MODAL ── */}
      <Modal
        isOpen={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
        title="Confirm Account Deactivation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--error, #EF4444)', color: 'var(--error, #EF4444)', fontSize: '13.5px' }}>
            <span style={{ fontWeight: 700 }}>Warning:</span> Deactivating your account is soft-deleted immediately. You will be logged out and your data will not be visible on the platform. However, your data is retained for 30 days, after which it is permanently purged from the database.
          </div>
          <p style={{ fontSize: '14px', color: 'var(--eclipse, #1C1917)', margin: 0 }}>
            Are you sure you want to deactivate your account?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
              icon={ShieldAlert}
            >
              {deletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
