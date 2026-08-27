import React, { useLayoutEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function DeleteAccountPage({ onNavigate }) {
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await authService.deleteAccount(email.trim(), password);
      logout();
      setDeleted(true);
      setPassword('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete account. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%', border: '1.5px solid #D8CEC8', borderRadius: '10px', padding: '12px 14px',
    background: '#FFFFFF', color: '#17151A', font: 'inherit', outlineColor: '#63344F', boxSizing: 'border-box',
  };

  return (
    <PublicLayout activeRoute="/delete-account" onNavigate={onNavigate}>
      <div style={{ minHeight: '70vh', background: '#FFF8F2', padding: '64px 20px 80px' }}>
        <main style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <div style={{ width: 54, height: 54, margin: '0 auto 14px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#FDECEC', color: '#B42318' }}>
              <Trash2 size={26} />
            </div>
            <h1 className="font-playfair" style={{ margin: 0, color: '#2D1D15', fontSize: 'clamp(30px, 5vw, 42px)' }}>Delete User Account</h1>
            <p style={{ color: '#756966', lineHeight: 1.6 }}>Verify your account email and password to request deletion.</p>
          </div>

          <section style={{ background: '#FFFDFC', border: '1px solid #E8DDD5', borderRadius: 20, padding: 'clamp(22px, 5vw, 34px)', boxShadow: '0 12px 35px rgba(70,45,35,.08)' }}>
            {deleted ? (
              <div role="status" style={{ textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
                <CheckCircle2 size={46} color="#287A50" />
                <h2 style={{ margin: 0, color: '#2D1D15' }}>Deletion request received</h2>
                <p style={{ margin: 0, color: '#756966', lineHeight: 1.6 }}>Your account is now deactivated and scheduled for deletion under our data-retention policy.</p>
                <button type="button" onClick={() => onNavigate('/')} style={{ marginTop: 8, border: 0, borderRadius: 999, padding: '11px 22px', background: '#63344F', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Return to home</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 12, background: '#FFF4E5', color: '#7A3E00' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>This hides your account immediately. After the retention period, your account data cannot be recovered.</span>
                </div>

                <label style={{ display: 'grid', gap: 7, color: '#2D1D15', fontWeight: 700 }}>
                  Gmail / Email address
                  <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" style={fieldStyle} />
                </label>

                <label style={{ display: 'grid', gap: 7, color: '#2D1D15', fontWeight: 700 }}>
                  Password
                  <span style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" style={{ ...fieldStyle, paddingRight: 46 }} />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, padding: 5, background: 'transparent', color: '#756966', cursor: 'pointer', display: 'grid' }}>
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                </label>

                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: '#574B47', fontSize: 13.5, lineHeight: 1.45 }}>
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} style={{ marginTop: 3, accentColor: '#B42318' }} />
                  I understand that my account will be deactivated immediately and later permanently deleted.
                </label>

                {error && <div role="alert" style={{ padding: '11px 13px', borderRadius: 10, background: '#FDECEC', color: '#B42318', fontSize: 13.5 }}>{error}</div>}

                <button type="submit" disabled={!confirmed || submitting} style={{ border: 0, borderRadius: 999, padding: '12px 22px', background: !confirmed || submitting ? '#D7CFCC' : '#B42318', color: '#fff', fontWeight: 800, cursor: !confirmed || submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Deleting account…' : 'Delete my account'}
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </PublicLayout>
  );
}
