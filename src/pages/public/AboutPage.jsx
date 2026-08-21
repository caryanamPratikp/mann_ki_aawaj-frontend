import React, { useLayoutEffect } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { Heart, ShieldCheck, Mic, Sparkles, ArrowLeft } from 'lucide-react';

export function AboutPage({ onNavigate }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <PublicLayout activeRoute="/about" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(242, 176, 141, 0.15)', border: '1px solid #F2B08D' }}>
              <Sparkles size={16} color="#F2B08D" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Our Mission & Philosophy
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 4vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              About Aawaj Man Ki
            </h1>
            <p style={{ fontSize: '15.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
              India's first 18+ anonymous social platform built for authentic self-expression, identity protection, and judgment-free conversations.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-30px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Core Philosophy */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Heart size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    1. Core Philosophy & Vision
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Freeing expression from social pressure</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                We believe that written and spoken thoughts carry deep emotional resonance when freed from popularity algorithms, public follower counts, and real-name judgment. Aawaj Man Ki gives every individual a safe, quiet space to share what lies deep inside their heart.
              </p>
            </div>

            {/* Card 2: AI Moderation & Toxicity Protection */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <ShieldCheck size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    2. AI-Powered Safety & Moderation
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Zero tolerance for hate speech and harassment</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Our platform uses automated real-time moderation engines to filter hate speech, doxxing, harassment, and toxic language. All public interactions operate under a transparent 3-strike warning policy to ensure community safety.
              </p>
            </div>

            {/* Card 3: Voice & 22 Indian Languages */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <Mic size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    3. Expression in 22 Indian Languages
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Empowering voice-to-text in regional tongues</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Language should never be a barrier to self-expression. Aawaj Man Ki supports seamless voice-to-text input across 22 official Indian languages, making anonymous conversation accessible to everyone across India.
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

