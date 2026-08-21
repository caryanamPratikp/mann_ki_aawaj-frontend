import React, { useLayoutEffect } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { ShieldCheck, Lock, Trash2, EyeOff, Server, ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage({ onNavigate }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <PublicLayout activeRoute="/privacy-policy" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(242, 176, 141, 0.15)', border: '1px solid #F2B08D' }}>
              <ShieldCheck size={16} color="#F2B08D" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Data & Privacy Security
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 4vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              Privacy Policy & Data Protection
            </h1>
            <p style={{ fontSize: '15.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
              Your real identity is 100% shielded. Learn how Aawaj Man Ki protects your personal data, handles account deletion, and enforces strict security.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-30px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Absolute Identity Shielding */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <EyeOff size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    1. Absolute Identity Shielding & Isolation
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Strict separation of real identity from public handles</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Aawaj Man Ki strictly segregates your registration credentials (Full Name, Phone Number, Email) from your public handles (e.g. <code>@mindful_soul</code>). Your real personal identity is never exposed to other members, search engines, or third-party callers under any circumstance.
              </p>
            </div>

            {/* Card 2: 30-Day Account Deletion Rule (User Explicit Requirement) */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #F2B08D', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(99, 52, 79, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FCE9DD', border: '1px solid #F2B08D', display: 'grid', placeItems: 'center' }}>
                  <Trash2 size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    2. Account Deletion & 30-Day Data Purge Rule
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#63344F', fontWeight: 600 }}>Grace period & permanent server destruction</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                When you initiate an account deletion request through Account Settings, your profile, handle reservation, posts, comments, and direct messages enter a <strong>30-day grace period</strong>.
              </p>
              <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#63344F' }}>
                  ⏱️ 30-Day Grace Period Details:
                </div>
                <ul style={{ fontSize: '13.5px', color: '#766D68', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li><strong>First 30 Days:</strong> Your account is deactivated and completely hidden from public view and search results. You may log in to cancel deletion and restore your account.</li>
                  <li><strong>After 30 Days:</strong> All your stored data, posts, comments, direct messages, and registration records are <strong>permanently and irreversibly deleted</strong> from server storage.</li>
                </ul>
              </div>
            </div>

            {/* Card 3: Automated Content Moderation & Privacy Safeguards */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Lock size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    3. Automated Contact & Link Moderation
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Preventing accidental exposure of contact details</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                To protect member safety, our system enforces real-time client-side and backend regex filters. Sharing personal phone numbers, email addresses, or external links in public posts, comments, or 1-on-1 private messages is automatically blocked to prevent harassment, scam links, and doxxing.
              </p>
            </div>

            {/* Card 4: Zero Ad Tracking */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Server size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    4. Zero Commercial Data Sale
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>No ad brokers, selling, or third-party trackers</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                We believe privacy is a fundamental human right. Aawaj Man Ki does not sell, rent, or trade your personal information, activity logs, or voice data to third-party ad networks or data brokers.
              </p>
            </div>

            {/* Back to Home Button */}
            <div style={{ textAlign: 'center', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  backgroundColor: '#63344F',
                  color: '#FFF8F2',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(99, 52, 79, 0.2)',
                }}
              >
                <ArrowLeft size={16} /> Back to Home Page
              </button>
            </div>

          </div>
        </div>

      </div>
    </PublicLayout>
  );
}

