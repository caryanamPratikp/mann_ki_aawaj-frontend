import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ArrowLeft, KeyRound } from 'lucide-react';

export function ForgotPasswordPage({ onNavigate }) {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    addToast('Password reset link sent to your verified email.', 'success');
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <button onClick={() => onNavigate('/login')} className="flex-row items-center gap-xs secondary-text" style={{ fontSize: '13px' }}>
          <ArrowLeft size={14} /> Back to Login
        </button>

        <div>
          <h2 className="card-heading" style={{ fontSize: '22px' }}>
            Reset Password
          </h2>
          <p className="secondary-text" style={{ fontSize: '13px' }}>
            Enter your private email address to receive a secure recovery code.
          </p>
        </div>

        {sent ? (
          <div className="mka-panel p-md text-center flex-col gap-sm">
            <KeyRound size={32} style={{ color: 'var(--success)', margin: '0 auto' }} />
            <p className="body-text">Check your inbox for reset instructions.</p>
            <Button variant="primary" onClick={() => onNavigate('/login')}>
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-col gap-md">
            <Input
              label="Private Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
            <Button type="submit" variant="primary" fullWidth icon={KeyRound}>
              Send Recovery Code
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
