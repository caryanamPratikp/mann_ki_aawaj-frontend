import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Shield,
  Lock,
  MessageCircle,
  MessagesSquare,
  Mic,
  Bot,
  Users,
  Image,
  Video,
  Smile,
  Flag,
  ArrowUp,
  ArrowRight,
  Check,
  X,
  UserPlus,
  BadgeCheck,
  Globe,
  Zap,
  ChevronRight,
  FileText,
  EyeOff,
} from 'lucide-react';
import heroBg from '../../assets/hero_bg.png';

export function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        fontFamily: '"Inter", sans-serif',
        backgroundColor: '#F8F4EE',
        color: '#181818',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .font-playfair {
          font-family: "Playfair Display", serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .font-inter {
          font-family: "Inter", sans-serif;
        }

        .btn-accent {
          background-color: #D89C7A;
          color: #0B0A16;
          font-weight: 600;
          padding: 12px 28px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: "Inter", sans-serif;
        }
        .btn-accent:hover {
          background-color: #C58967;
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.25);
          font-weight: 500;
          padding: 12px 26px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.25s ease;
          font-family: "Inter", sans-serif;
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .nav-item {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .nav-item:hover {
          color: #D89C7A;
        }

        .card-cream {
          background-color: #FFFDFB;
          border: 1px solid #E8DDD4;
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 4px 20px rgba(45, 29, 21, 0.03);
          transition: all 0.25s ease;
        }
        .card-cream:hover {
          border-color: #D89C7A;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(45, 29, 21, 0.06);
        }

        .section-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-space {
          padding: 120px 0;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-float {
          animation: floatSlow 6s ease-in-out infinite;
        }
      `}</style>

      {/* ── STICKY GLASS NAVBAR OVER HERO ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '16px 0',
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(11, 10, 22, 0.95)' : 'rgba(11, 10, 22, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="section-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#D89C7A',
                color: '#0B0A16',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: '19px',
                fontFamily: '"Playfair Display", serif',
              }}
            >
              M
            </div>
            <span
              className="font-playfair"
              style={{ fontSize: '23px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}
            >
              Man Ki Aavaj
            </span>
          </div>

          {/* Menu Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
            <span className="nav-item" onClick={() => onNavigate('/')}>Home</span>
            <a href="#features" className="nav-item">Features</a>
            <a href="#how-it-works" className="nav-item">How It Works</a>
            <a href="#safety" className="nav-item">Safety</a>
            <a href="#about" className="nav-item">About Us</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 12px',
              }}
            >
              Login
            </button>
            <button
              type="button"
              className="btn-accent"
              onClick={() => onNavigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── 1. HERO SECTION (NO TOP GAP, HERO_BG BACKDROP) ── */}
      <section
        style={{
          backgroundColor: '#0B0A16',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          color: '#FFFFFF',
          paddingTop: '110px', // Removed top gap completely
          paddingBottom: '90px',
          position: 'relative',
          minHeight: '620px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Dark Left Gradient Overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(11, 10, 22, 0.96) 0%, rgba(11, 10, 22, 0.82) 48%, rgba(11, 10, 22, 0.2) 100%)',
            zIndex: 1,
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
            {/* Left Column (45%) */}
            <div style={{ flex: '1 1 480px', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Small Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', width: 'fit-content' }}>
                <ShieldCheck strokeWidth={1.75} size={18} color="#D89C7A" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                  India's Anonymous Discussion Platform
                </span>
              </div>

              {/* Headline: Playfair Display 700, 3 lines */}
              <h1
                className="font-playfair"
                style={{
                  fontSize: 'clamp(44px, 5.5vw, 62px)',
                  lineHeight: 1.08,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Where Thoughts<br />
                Matter More<br />
                <span style={{ color: '#D89C7A' }}>Than Identity.</span>
              </h1>

              {/* Paragraph */}
              <p
                className="font-inter"
                style={{
                  fontSize: '16.5px',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Share your thoughts, experiences and opinions without revealing your identity. AI moderation keeps discussions respectful.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <button
                  type="button"
                  className="btn-accent"
                  onClick={() => onNavigate('/register')}
                >
                  Get Started
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Features
                </button>
              </div>

              {/* Trust Row Badges (Matching Screenshot 2 Icons) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                  paddingTop: '18px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D89C7A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12z"></path>
                    <path d="M7 10c1-1 3-1 4 0"></path>
                    <path d="M13 10c1-1 3-1 4 0"></path>
                    <path d="M9 16s1.5 1.5 3 1.5 3-1.5 3-1.5"></path>
                  </svg>
                  <span>Anonymous by Design</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  <ShieldCheck strokeWidth={1.75} size={18} color="#D89C7A" />
                  <span>AI Moderated</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  <Mic strokeWidth={1.75} size={18} color="#D89C7A" />
                  <span>Voice-to-Text</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  <Globe strokeWidth={1.75} size={18} color="#D89C7A" />
                  <span>Indian Languages</span>
                </div>
              </div>
            </div>

            {/* Right Side (55%): Background illustration artwork space */}
            <div style={{ flex: '1 1 480px', minHeight: '360px' }} />
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP (CREAM BACKGROUND #F8F4EE - MATCHING SCREENSHOT 3) ── */}
      <section style={{ backgroundColor: '#F8F4EE', borderBottom: '1px solid #E8DDD4', padding: '32px 0' }}>
        <div className="section-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            {[
              { label: 'Privacy First', icon: Shield },
              { label: 'AI Moderated', icon: Bot },
              { label: 'Discussion Focused', icon: MessageCircle },
              { label: 'Built for India', icon: Globe },
              { label: 'Real-time', icon: Zap },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={index}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                    <Icon strokeWidth={1.75} size={22} color="#D89C7A" />
                    <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#181818' }}>
                      {item.label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div
                      style={{
                        width: '1px',
                        height: '28px',
                        backgroundColor: '#E8DDD4',
                      }}
                      className="hidden-mobile"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. WHY MAN KI AAVAJ? (MATCHING SCREENSHOT 4 SIDE-BY-SIDE VS COMPARISON) ── */}
      <section className="section-space" style={{ backgroundColor: '#F8F4EE' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Left Column Narrative */}
            <div style={{ flex: '1 1 440px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D89C7A' }}>
                Why Man Ki Aavaj?
              </span>
              <h2 className="font-playfair" style={{ fontSize: '42px', lineHeight: 1.15, color: '#181818', margin: 0 }}>
                Social media is<br />
                built for followers.<br />
                <span style={{ color: '#6F405F' }}>We are built for conversations.</span>
              </h2>
              <div style={{ width: '40px', height: '3px', backgroundColor: '#D89C7A', borderRadius: '2px' }} />

              {/* Plant Accent Illustration at Bottom Left */}
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>🪴</span>
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#666666', fontStyle: 'italic', maxWidth: '320px' }}>
                  A calm, judgment-free space designed for ideas and true voice.
                </span>
              </div>
            </div>

            {/* Right Column: Side-by-Side VS Comparison Cards */}
            <div style={{ flex: '1 1 540px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative' }}>
                {/* Center Floating VS Circle Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFDFB',
                    border: '1px solid #E8DDD4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#181818',
                    zIndex: 10,
                  }}
                >
                  VS
                </div>

                {/* Left Card: Traditional Social Media */}
                <div
                  style={{
                    backgroundColor: '#FFFDFB',
                    border: '1px solid #E8DDD4',
                    borderRadius: '20px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#181818', textAlign: 'center', borderBottom: '1px solid #E8DDD4', paddingBottom: '12px' }}>
                    Traditional Social Media
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Followers', 'Likes', 'Personal Branding', 'Identity', 'Popularity', 'Toxicity & Hate'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666666' }}>
                        <X size={15} color="#E85D5D" strokeWidth={2.5} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Man Ki Aavaj */}
                <div
                  style={{
                    backgroundColor: '#FFFDFB',
                    border: '1px solid #E8DDD4',
                    borderRadius: '20px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 700, color: '#181818', borderBottom: '1px solid #E8DDD4', paddingBottom: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '5px', backgroundColor: '#D89C7A', color: '#0B0A16', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 900 }}>M</div>
                    <span>Man Ki Aavaj</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Anonymous', 'Respectful', 'Ideas First', 'AI Moderated', 'Meaningful Discussions', 'Toxicity Free'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#181818', fontWeight: 600 }}>
                        <Check size={15} color="#3BA55D" strokeWidth={2.5} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. WHAT MAKES US DIFFERENT (EXACT MATCH TO SCREENSHOT 5: 3 TOP ARTWORK CARDS + 3 BOTTOM CLEAN ITEMS) ── */}
      <section id="features" className="section-space" style={{ backgroundColor: '#FFFDFB', borderTop: '1px solid #E8DDD4', borderBottom: '1px solid #E8DDD4' }}>
        <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h2 className="font-playfair" style={{ fontSize: '42px', color: '#181818', margin: 0 }}>
              What Makes Us Different
            </h2>
            <div style={{ width: '40px', height: '3px', backgroundColor: '#D89C7A', borderRadius: '2px', margin: '12px auto 0 auto' }} />
          </div>

          {/* Top 3 Featured Cards with Artwork & "Learn More ->" (Screenshot 5 Top Row) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Card 1: Anonymous by Design */}
            <div
              style={{
                backgroundColor: '#FFFDFB',
                border: '1px solid #E8DDD4',
                borderRadius: '24px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(45,29,21,0.03)',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#F8F4EE',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 8px 20px rgba(111,64,95,0.08)',
                }}
              >
                <Lock strokeWidth={1.75} size={42} color="#6F405F" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#6F405F', margin: 0 }}>Anonymous by Design</h3>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                No real names. No public profiles. Custom anonymous avatars.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6F405F',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                Learn More <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 2: AI-Powered Safety */}
            <div
              style={{
                backgroundColor: '#FFFDFB',
                border: '1px solid #E8DDD4',
                borderRadius: '24px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(45,29,21,0.03)',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#F8F4EE',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 8px 20px rgba(111,64,95,0.08)',
                }}
              >
                <ShieldCheck strokeWidth={1.75} size={42} color="#6F405F" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#6F405F', margin: 0 }}>AI-Powered Safety</h3>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                Detects hate speech. Filters abuse. Protects conversations.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6F405F',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                Learn More <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 3: Voice-to-Text */}
            <div
              style={{
                backgroundColor: '#FFFDFB',
                border: '1px solid #E8DDD4',
                borderRadius: '24px',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(45,29,21,0.03)',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#F8F4EE',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 8px 20px rgba(111,64,95,0.08)',
                }}
              >
                <Mic strokeWidth={1.75} size={42} color="#6F405F" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#6F405F', margin: 0 }}>Voice-to-Text</h3>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                Speak naturally. Supports Indian languages. Voice deleted after processing.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6F405F',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                Learn More <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Bottom 3 Clean Items (Screenshot 5 Bottom Row) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', paddingTop: '20px' }}>
            {/* Item 1: Discussion First */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F8F4EE', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MessageCircle strokeWidth={1.75} size={24} color="#6F405F" />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#6F405F', margin: '0 0 4px 0' }}>Discussion First</h4>
                <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                  Ideas over popularity. Quality conversations that matter.
                </p>
              </div>
            </div>

            {/* Item 2: Privacy First */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F8F4EE', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Lock strokeWidth={1.75} size={24} color="#6F405F" />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#6F405F', margin: '0 0 4px 0' }}>Privacy First</h4>
                <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                  No identity exposure. No follower counts. Privacy by default.
                </p>
              </div>
            </div>

            {/* Item 3: Community Moderation */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F8F4EE', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Users strokeWidth={1.75} size={24} color="#6F405F" />
              </div>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#6F405F', margin: '0 0 4px 0' }}>Community Moderation</h4>
                <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                  Report harmful content. Human + AI review for healthy discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BUILT FOR EVERY VOICE (AUDIENCE INCLUSIVENESS) ── */}
      <section className="section-space" style={{ backgroundColor: '#F8F4EE' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Left Content */}
            <div style={{ flex: '1 1 440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D89C7A' }}>
                Audience Inclusiveness
              </span>
              <h2 className="font-playfair" style={{ fontSize: '42px', color: '#181818', margin: 0 }}>
                Built For Every Voice.
              </h2>
              <p style={{ fontSize: '17px', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                Whether you're carrying a quiet win, seeking advice, or processing life—Man Ki Aavaj welcomes you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                {['Students', 'Creators', 'Professionals', 'Parents', 'Thinkers', 'Dreamers', 'Anyone with something meaningful to share'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600, color: '#181818' }}>
                    <Check strokeWidth={1.75} size={16} color="#3BA55D" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Large Illustration (60%) */}
            <div style={{ flex: '1 1 540px', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, #6F405F 0%, #8E527A 100%)',
                  padding: '48px',
                  color: '#FFFFFF',
                  boxShadow: '0 20px 40px rgba(111,64,95,0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#FFD1E8' }}>
                  A Sanctuary For All
                </span>
                <h3 className="font-playfair" style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>
                  "Finally a platform where my thoughts matter more than my job title or social standing."
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFFDFB', color: '#6F405F', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                    AN
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>@mindful_soul</div>
                    <div style={{ fontSize: '12px', color: '#FFD1E8' }}>Anonymous Community Member</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS (TIMELINE 4 STEPS) ── */}
      <section id="how-it-works" className="section-space" style={{ backgroundColor: '#FFFDFB', borderTop: '1px solid #E8DDD4', borderBottom: '1px solid #E8DDD4' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 80px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D89C7A' }}>
              Simple Process
            </span>
            <h2 className="font-playfair" style={{ fontSize: '42px', color: '#181818', marginTop: '10px' }}>
              Getting started is easy.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { icon: UserPlus, step: '1', title: 'Create Account', desc: 'Quick sign up with your email. Instant verification.' },
              { icon: BadgeCheck, step: '2', title: 'Choose Username', desc: 'Pick a unique anonymous handle and custom avatar.' },
              { icon: MessageCircle, step: '3', title: 'Share Thoughts', desc: 'Post or speak your mind safely without identity fear.' },
              { icon: Users, step: '4', title: 'Join Discussions', desc: 'Engage in live topics and 1-on-1 private chats.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#F8F4EE',
                    border: '1px solid #E8DDD4',
                    borderRadius: '20px',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFFDFB', border: '1px solid #E8DDD4', display: 'grid', placeItems: 'center' }}>
                    <Icon strokeWidth={1.75} size={20} color="#D89C7A" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#181818', margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. EXPRESS YOURSELF YOUR WAY (PRODUCT SHOWCASE) ── */}
      <section className="section-space" style={{ backgroundColor: '#F8F4EE' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Left Content */}
            <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D89C7A' }}>
                Product Features
              </span>
              <h2 className="font-playfair" style={{ fontSize: '42px', color: '#181818', margin: 0 }}>
                Express Yourself Your Way
              </h2>
              <p style={{ fontSize: '17px', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                Full freedom to communicate through multiple formats tailored to your mood.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
                {[
                  { icon: FileText, title: 'Text Posts', desc: 'Share thoughts, questions, or personal confessions.' },
                  { icon: Image, title: 'Images & Media', desc: 'Attach photos or graphics to illustrate your thoughts.' },
                  { icon: Video, title: 'Video Sharing', desc: 'Post short video clips anonymously.' },
                  { icon: Mic, title: 'Voice-to-Text', desc: 'Convert spoken speech into text in 22 languages.' },
                  { icon: MessagesSquare, title: 'Comments & Replies', desc: 'Participate in live topic discussions.' },
                  { icon: Smile, title: 'Empathy Reactions', desc: 'React with Relate, Well Said, Helpful, or Stay Strong.' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#FFFDFB', border: '1px solid #E8DDD4' }}>
                        <Icon strokeWidth={1.75} size={20} color="#D89C7A" />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#181818' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#666666' }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Phone Mockup UI Showcase */}
            <div style={{ flex: '1 1 440px', display: 'flex', justifyContent: 'center' }}>
              <div
                className="animate-float"
                style={{
                  width: '320px',
                  borderRadius: '40px',
                  background: '#0B0A16',
                  padding: '16px',
                  boxShadow: '0 24px 60px rgba(45,29,21,0.18)',
                  border: '4px solid #D89C7A',
                }}
              >
                <div
                  style={{
                    borderRadius: '28px',
                    background: '#F8F4EE',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, color: '#6F405F' }}>
                    <span>Man Ki Aavaj Feed</span>
                    <span>Live 🟢</span>
                  </div>

                  <div
                    style={{
                      background: '#FFFDFB',
                      border: '1px solid #E8DDD4',
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#6F405F', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>
                        QP
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#181818' }}>@quietparagraph</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#181818', lineHeight: 1.4 }}>
                      "Overcoming internal fear without seeking applause is the truest sign of maturity."
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: '#6F405F', fontWeight: 700 }}>
                      <span>❤️ 14 Relate</span>
                      <span>💡 22 Well Said</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '20px',
                      background: '#6F405F',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    🎙️ Tap Mic to Speak Thought
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FINAL CTA SECTION (SOFT PEACH GRADIENT) ── */}
      <section className="section-space" style={{ background: 'linear-gradient(135deg, #F8F4EE 0%, #F5EAE2 100%)', textAlign: 'center', borderTop: '1px solid #E8DDD4' }}>
        <div className="section-container" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h2 className="font-playfair" style={{ fontSize: '42px', color: '#181818', margin: 0 }}>
            Join India's Anonymous<br />Conversation Platform
          </h2>
          <p style={{ fontSize: '18px', color: '#666666', margin: 0, lineHeight: 1.6 }}>
            Share your thoughts freely. Join meaningful discussions. Stay 100% anonymous.
          </p>
          <div style={{ paddingTop: '10px' }}>
            <button
              type="button"
              className="btn-accent"
              style={{ fontSize: '16px', padding: '14px 32px' }}
              onClick={() => onNavigate('/register')}
            >
              Get Started Now <ArrowRight size={18} />
            </button>
          </div>
          <span style={{ fontSize: '14px', color: '#666666' }}>
            Free to use. No identity required.
          </span>
        </div>
      </section>

      {/* ── 9. FOOTER SECTION ── */}
      <footer id="about" style={{ backgroundColor: '#0B0A16', color: '#FFFFFF', paddingTop: '80px', paddingBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', paddingBottom: '60px' }}>
            {/* Logo Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#D89C7A', color: '#0B0A16', display: 'grid', placeItems: 'center', fontWeight: 900, fontFamily: '"Playfair Display", serif' }}>
                  M
                </div>
                <span className="font-playfair" style={{ fontSize: '20px', fontWeight: 700 }}>Man Ki Aavaj</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
                Share your thoughts,<br />not your identity.
              </p>

              {/* Monochrome Social Icons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', color: '#666666' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>About</h4>
              <span onClick={() => onNavigate('/about')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>About Us</span>
              <span onClick={() => onNavigate('/privacy-policy')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>Privacy Policy</span>
              <span onClick={() => onNavigate('/community-guidelines')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>Terms & Conditions</span>
              <span onClick={() => onNavigate('/help')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>Help & Support</span>
            </div>

            {/* Platform */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Platform</h4>
              <a href="#how-it-works" style={{ color: '#666666', textDecoration: 'none', fontSize: '14px' }}>How It Works</a>
              <a href="#safety" style={{ color: '#666666', textDecoration: 'none', fontSize: '14px' }}>Safety Tips</a>
              <span onClick={() => onNavigate('/community-guidelines')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>Community Guidelines</span>
              <span onClick={() => onNavigate('/help')} style={{ color: '#666666', cursor: 'pointer', fontSize: '14px' }}>FAQ</span>
            </div>

            {/* Support & Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Contact</h4>
              <span style={{ color: '#666666', fontSize: '14px' }}>support@manakiaavaj.com</span>
              <span style={{ color: '#666666', fontSize: '14px' }}>+91 94218 73407</span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '13.5px', color: '#666666' }}>
              © 2026 Caryanam. All rights reserved. Caryanamindia
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              title="Back to Top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
