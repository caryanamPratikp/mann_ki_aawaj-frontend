import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authService } from '../../services/authService.js';
import { ShieldCheck, User, Mail, Phone, Lock, ArrowRight, Activity, Terminal } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function DashboardPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const token = localStorage.getItem('auth_token');

  const runApiTest = async (type) => {
    setTesting(true);
    setTestResult('');
    try {
      let res;
      if (type === 'auth') res = await authService.testAuth();
      else if (type === 'user') res = await authService.testUserAccess();
      else if (type === 'admin') res = await authService.testAdminAccess();

      const resultText = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
      setTestResult(`✓ ${type.toUpperCase()} Response (200 OK): ${resultText}`);
      addToast(`API Test ${type} succeeded!`, 'success');
    } catch (err) {
      console.error(err);
      setTestResult(`❌ Error (${err.status || '500'}): ${err.message || 'Access denied'}`);
      addToast(err.message || 'API call failed.', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <UserLayout activeRoute="/dashboard" onNavigate={onNavigate}>
      <div className="flex-col gap-md">

        {/* Dashboard Banner */}
        <div className="mka-card flex-col gap-sm" style={{ background: 'var(--soft-white)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex-row items-center justify-between flex-wrap gap-md">
            <div>
              <div className="flex-row items-center gap-xs" style={{ marginBottom: '4px' }}>
                <span className="badge badge-plum" style={{ fontSize: '11px' }}>
                  ROLE: {currentUser?.role || 'USER'}
                </span>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  Authenticated
                </span>
              </div>
              <h1 className="card-heading" style={{ fontSize: '24px', margin: 0 }}>
                Welcome to your Dashboard, {currentUser?.fullName || 'User'}
              </h1>
              <p className="secondary-text" style={{ fontSize: '14px', marginTop: '4px', margin: 0 }}>
                Manage your authenticated session and protected API access.
              </p>
            </div>

            <Button variant="primary" onClick={() => onNavigate('/home')} icon={ArrowRight}>
              Go to Feed
            </Button>
          </div>
        </div>

        {/* Account & Session Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

          {/* Account Details */}
          <div className="mka-card flex-col gap-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="card-heading" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <User size={18} style={{ color: 'var(--deep-plum)' }} /> User Account Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <div className="flex-row items-center justify-between" style={{ padding: '8px 12px', background: 'var(--soft-white)', borderRadius: '8px' }}>
                <span className="caption-text" style={{ fontSize: '12px' }}>Full Name</span>
                <span className="bold" style={{ fontSize: '13.5px', color: 'var(--eclipse)' }}>{currentUser?.fullName || 'N/A'}</span>
              </div>
              <div className="flex-row items-center justify-between" style={{ padding: '8px 12px', background: 'var(--soft-white)', borderRadius: '8px' }}>
                <span className="caption-text" style={{ fontSize: '12px' }}>Email</span>
                <span className="bold" style={{ fontSize: '13.5px', color: 'var(--eclipse)' }}>{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex-row items-center justify-between" style={{ padding: '8px 12px', background: 'var(--soft-white)', borderRadius: '8px' }}>
                <span className="caption-text" style={{ fontSize: '12px' }}>Mobile Number</span>
                <span className="bold" style={{ fontSize: '13.5px', color: 'var(--eclipse)' }}>{currentUser?.mobileNumber || currentUser?.mobile || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* JWT Token Status */}
          <div className="mka-card flex-col gap-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <h3 className="card-heading" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> JWT Token Status
            </h3>
            <p className="secondary-text" style={{ fontSize: '13px', margin: 0 }}>
              Header: <code style={{ fontSize: '12px', background: 'var(--soft-white)', padding: '2px 6px', borderRadius: '4px' }}>Authorization: Bearer &lt;token&gt;</code>
            </p>
            <div style={{ padding: '10px 12px', background: 'var(--soft-white)', borderRadius: '8px', overflow: 'hidden' }}>
              <span className="caption-text" style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Active Token Preview:</span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--eclipse)' }}>
                {token ? `${token.slice(0, 42)}...` : 'Mock Token Active'}
              </span>
            </div>
          </div>

        </div>

        {/* Protected API Test Controls */}
        <div className="mka-card flex-col gap-md" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div>
            <h3 className="card-heading" style={{ fontSize: '17px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Terminal size={18} style={{ color: 'var(--deep-plum)' }} /> Protected API Endpoint Tests
            </h3>
            <p className="secondary-text" style={{ fontSize: '13px', marginTop: '3px', margin: 0 }}>
              Test your Bearer token authorization against protected backend endpoints at <code style={{ fontSize: '12px' }}>http://localhost:8080</code>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={testing}
              onClick={() => runApiTest('auth')}
            >
              GET /api/test (Auth)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={testing}
              onClick={() => runApiTest('user')}
            >
              GET /api/user/test (USER Role)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={testing}
              onClick={() => runApiTest('admin')}
            >
              GET /api/admin/test (ADMIN Role)
            </Button>
          </div>

          {testResult && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--eclipse)', color: '#ffffff', fontSize: '12.5px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {testResult}
            </div>
          )}
        </div>

      </div>
    </UserLayout>
  );
}
