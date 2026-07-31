import React, { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield } from 'lucide-react';

export function AdminLoginPage({ onNavigate }) {
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(username, password);
      onNavigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate}>
      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <div className="text-center">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--eclipse)',
              color: 'var(--swiss-coffee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <Shield size={24} />
          </div>
          <h2 className="card-heading" style={{ fontSize: '22px' }}>
            Moderator Portal Access
          </h2>
          <p className="secondary-text" style={{ fontSize: '13px' }}>
            Enter credentials to manage content reports and review queues.
          </p>
        </div>

        <Input
          label="Admin Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin@example.com"
          required
        />

        <Input
          label="Admin Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" fullWidth icon={Shield}>
          Access Admin Dashboard
        </Button>
      </form>
    </AuthLayout>
  );
}
