import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { AlertTriangle, Shield, Heart, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function CommunityGuidelinesPage({ onNavigate }) {
  return (
    <PublicLayout activeRoute="/community-guidelines" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(242, 176, 141, 0.15)', border: '1px solid #F2B08D' }}>
              <Shield size={16} color="#F2B08D" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Safety & Community Harmony
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 4vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              Community Guidelines & Terms
            </h1>
            <p style={{ fontSize: '15.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
              Aawaj Man Ki is designed for respectful, judgment-free conversations. Read our community standards, 3-strike warning policy, and safety rules below.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-30px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: 3-Strike Warning & Account Suspension Policy (User Explicit Requirement) */}
            <div style={{ backgroundColor: '#FFFDFC', border: '2px solid #D94B48', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(217, 75, 72, 0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FDF0F0', border: '1.5px solid #D94B48', display: 'grid', placeItems: 'center' }}>
                  <AlertTriangle size={24} color="#D94B48" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    1. The 3-Warning Account Suspension Policy
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#D94B48', fontWeight: 700 }}>Strict Enforcement for Community Safety</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                To maintain a safe and harassment-free environment, Aawaj Man Ki operates under a strict <strong>3-Strike Enforcement System</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', paddingTop: '6px' }}>
                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#63344F' }}>⚠️ Strike 1: Warning Notice</div>
                  <p style={{ fontSize: '12.5px', color: '#766D68', margin: 0, lineHeight: 1.45 }}>
                    Content is removed by moderation. An in-app warning notification is sent to your account explaining the violation.
                  </p>
                </div>

                <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#D97706' }}>⛔ Strike 2: 48-Hour Mute</div>
                  <p style={{ fontSize: '12.5px', color: '#766D68', margin: 0, lineHeight: 1.45 }}>
                    Temporary 48-hour restriction on creating new posts, posting comments, and sending 1-on-1 chat requests.
                  </p>
                </div>

                <div style={{ backgroundColor: '#FDF0F0', border: '1px solid #F87171', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#D94B48' }}>🚫 Strike 3: Permanent Ban</div>
                  <p style={{ fontSize: '12.5px', color: '#766D68', margin: 0, lineHeight: 1.45 }}>
                    Your account is <strong>permanently suspended, handle revoked, and device blacklisted</strong> from Aawaj Man Ki.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Zero-Tolerance Content Violations */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Shield size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    2. Strictly Prohibited Content
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Automated AI & admin moderation filtering</span>
                </div>
              </div>
              
              <ul style={{ fontSize: '14px', color: '#332821', lineHeight: 1.65, margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Hate Speech & Bullying:</strong> Slurs, personal attacks, body shaming, and threats directed at individuals or communities.</li>
                <li><strong>Contact Sharing (Doxxing):</strong> Sharing real phone numbers, emails, or home addresses in public posts or comments.</li>
                <li><strong>External Link Spam:</strong> Posting external promotional links, affiliate URLs, or phishing domains.</li>
                <li><strong>Religious & Political Conflict:</strong> Incitement of communal hatred, religious offense, or political violence.</li>
              </ul>
            </div>

            {/* Card 3: Respectful & Empathetic Engagement */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Heart size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    3. Supportive & Empathetic Engagement
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Building a compassionate community</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Use supportive reactions (<em>❤️ I Relate</em>, <em>💡 Made Me Think</em>, <em>🤝 Well Said</em>, <em>✨ Stay Strong</em>) to encourage fellow members. When engaging in 1-on-1 private chat, keep conversations respectful and safe.
              </p>
            </div>

            {/* Card 4: 30-Day Data Deletion Reminder */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <FileText size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    4. Account Deletion & 30-Day Data Removal
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Your data retention rights</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                As detailed in our Privacy Policy, if you request account deletion, your data enters a <strong>30-day grace period</strong>. After 30 days, your account data, handles, posts, and messages are permanently erased from server storage.
              </p>
            </div>

            {/* Back Button */}
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

