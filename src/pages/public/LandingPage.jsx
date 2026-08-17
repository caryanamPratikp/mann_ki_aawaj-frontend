import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUp,
  ArrowRight,
  Check,
  X,
  UserPlus,
  BadgeCheck,
  Globe,
  Zap,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import heroBg from '../../assets/hero_bg.png';
import logoMKA from '../../assets/logo_MKA.png';

/* ── Decorative Botanical Branch Component ── */
function BotanicalBranch({ width = 150, height = 115, style = {}, flip = false, color = "#C99E85" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: flip ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <g opacity="0.75">
        {/* Main Curved Stem */}
        <path
          d="M 15 115 Q 45 65 125 15"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Leaf 1 - Bottom Left */}
        <path
          d="M 32 90 C 8 75 14 55 36 70 C 44 80 38 90 32 90 Z"
          fill="#E5C7B7"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* Leaf 2 - Mid Left */}
        <path
          d="M 52 65 C 22 45 32 25 58 42 C 64 54 58 65 52 65 Z"
          fill="#DEC0AE"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* Leaf 3 - Upper Left */}
        <path
          d="M 78 38 C 52 18 66 3 88 22 C 92 32 86 38 78 38 Z"
          fill="#E8CCBC"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* Leaf 4 - Top Leaf */}
        <path
          d="M 125 15 C 120 -8 142 -8 138 15 C 132 22 125 18 125 15 Z"
          fill="#DDBBA7"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* Leaf 5 - Mid Right */}
        <path
          d="M 64 58 C 86 46 100 60 84 75 C 74 77 66 68 64 58 Z"
          fill="#E2C1AF"
          stroke={color}
          strokeWidth="1.2"
        />
        {/* Leaf 6 - Bottom Right */}
        <path
          d="M 42 84 C 66 76 78 90 58 104 C 48 106 43 94 42 84 Z"
          fill="#E8CCA0"
          stroke={color}
          strokeWidth="1.2"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

export function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [vsInView, setVsInView] = useState(false);
  const vsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for VS section coming together animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVsInView(true);
        }
      },
      { threshold: 0.25 }
    );
    if (vsRef.current) observer.observe(vsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        backgroundColor: '#FFF8F2',
        color: '#17151A',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .font-playfair {
          font-family: "Playfair Display", Georgia, serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .font-inter {
          font-family: "Inter", sans-serif;
        }

        .btn-accent {
          background-color: #F2B08D;
          color: #17151A;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14.5px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: "Inter", sans-serif;
        }
        .btn-accent:hover {
          background-color: #E29F7C;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(242, 176, 141, 0.35);
        }

        .btn-outline {
          background: transparent;
          color: #FFF8F2;
          border: 1px solid rgba(242, 176, 141, 0.4);
          font-weight: 600;
          padding: 12px 26px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14.5px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: "Inter", sans-serif;
        }
        .btn-outline:hover {
          background: rgba(242, 176, 141, 0.12);
          border-color: rgba(242, 176, 141, 0.7);
          transform: translateY(-2px);
        }

        .nav-item {
          color: #F4EDE8;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .nav-item:hover {
          color: #F2B08D;
        }

        .section-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .section-space {
          padding: 88px 0;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-float {
          animation: floatSlow 6s ease-in-out infinite;
        }

        /* ── HOVER EFFECTS FOR "WHAT MAKES US DIFFERENT" ── */
        .diff-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid #E9DDD3;
          border-radius: 18px;
          padding: 36px 26px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          box-shadow: 0 4px 18px rgba(48, 31, 25, 0.04);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .diff-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #F2B08D 0%, #63344F 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .diff-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 52, 79, 0.12);
          border-color: rgba(242, 176, 141, 0.6);
          background: #FFFDFC;
        }

        .diff-card:hover::before {
          opacity: 1;
        }

        .diff-icon-box {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background-color: #FFF8F2;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 18px rgba(99, 52, 79, 0.08);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .diff-card:hover .diff-icon-box {
          transform: scale(1.08) rotate(-5deg);
          background-color: #63344F;
          box-shadow: 0 10px 24px rgba(99, 52, 79, 0.22);
        }

        .diff-card:hover .diff-icon-box svg {
          stroke: #F2B08D !important;
        }

        .learn-more-link {
          background: none;
          border: none;
          color: #63344F;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          transition: all 0.25s ease;
        }

        .diff-card:hover .learn-more-link {
          color: #F2B08D;
          transform: translateX(5px);
        }

        /* ── HOVER EFFECTS FOR "BUILT FOR EVERY VOICE" ── */
        .voice-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 12px;
          background-color: #FFFDFC;
          border: 1px solid #E8DDD5;
          font-size: 14.5px;
          font-weight: 600;
          color: #332821;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }

        .voice-chip:hover {
          background-color: #63344F;
          color: #FFF8F2;
          border-color: #63344F;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 20px rgba(99, 52, 79, 0.18);
        }

        .voice-chip:hover svg {
          stroke: #F2B08D !important;
        }

        .sanctuary-card {
          width: 100%;
          border-radius: 24px;
          background: linear-gradient(135deg, #63344F 0%, #4A243A 100%);
          padding: 50px 38px;
          color: #FFF8F2;
          box-shadow: 0 16px 36px rgba(99, 52, 79, 0.15);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .sanctuary-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 28px 56px rgba(99, 52, 79, 0.28);
        }

        /* ── COMPACT 4-STEP HOW IT WORKS CARD HOVER ── */
        .step-card {
          background-color: #FFFDFC;
          border: 1px solid #E8DDD5;
          border-radius: 18px;
          padding: 32px 22px;
          display: flex;
          flexDirection: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(70, 45, 35, 0.03);
        }
        .step-card:hover {
          transform: translateY(-6px);
          border-color: #F2B08D;
          box-shadow: 0 16px 32px rgba(99, 52, 79, 0.1);
        }

        /* ── FOOTER STYLING ── */
        .footer-link {
          color: #A0A5BD;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .footer-link:hover {
          color: #F2B08D;
        }
      `}</style>

      {/* ── STICKY NAVBAR OVER HERO ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '14px 0',
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(8, 10, 24, 0.96)' : 'rgba(8, 10, 24, 0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="section-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img
              src={logoMKA}
              alt="Aawaj Man Ki Logo"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <span
              className="font-playfair"
              style={{ fontSize: '24px', fontWeight: 700, color: '#FFF8F2', letterSpacing: '-0.02em' }}
            >
              Aawaj Man Ki
            </span>
          </div>

          {/* Menu Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
            <span className="nav-item" style={{ color: '#FFF8F2', position: 'relative' }} onClick={() => onNavigate('/')}>
              Home
              <span style={{ position: 'absolute', bottom: '-4px', left: '0', width: '16px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px' }} />
            </span>
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
                color: '#F4EDE8',
                fontSize: '14px',
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
              style={{ padding: '8px 20px', fontSize: '13.5px' }}
              onClick={() => onNavigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── 1. MODE A: HERO SECTION ── */}
      <section
        style={{
          backgroundColor: '#080A18',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          color: '#FFF8F2',
          paddingTop: '120px',
          paddingBottom: '90px',
          position: 'relative',
          minHeight: '660px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Dark Left Gradient Overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #080A18 0%, rgba(8, 10, 24, 0.94) 42%, rgba(8, 10, 24, 0.45) 68%, rgba(8, 10, 24, 0) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* Left Column */}
            <div style={{ flex: '1 1 480px', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Top Shield Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(41, 32, 58, 0.7)',
                  border: '1px solid rgba(242, 176, 141, 0.25)',
                  width: 'fit-content',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ShieldCheck strokeWidth={1.8} size={16} color="#F2B08D" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#F4EDE8', letterSpacing: '0.02em' }}>
                  India's Anonymous Discussion Platform
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-playfair"
                style={{
                  fontSize: 'clamp(46px, 5.8vw, 64px)',
                  lineHeight: 1.02,
                  fontWeight: 700,
                  color: '#FFF8F2',
                  margin: 0,
                }}
              >
                Where Thoughts<br />
                <span style={{ color: '#F2B08D' }}>Matter More</span><br />
                Than Identity.
              </h1>

              {/* Description Paragraph */}
              <p
                className="font-inter"
                style={{
                  fontSize: '15.5px',
                  lineHeight: 1.6,
                  color: '#DDD5D0',
                  margin: 0,
                  fontWeight: 400,
                  maxWidth: '520px',
                }}
              >
                Share your thoughts, opinions, experiences and emotions freely without revealing who you are. AI-powered moderation keeps conversations respectful, meaningful and safe.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
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
            </div>

            {/* Right Side Column (Artwork Space) */}
            <div style={{ flex: '1 1 480px', minHeight: '320px' }} />
          </div>

          {/* Single Horizontal Row Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'nowrap',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              whiteSpace: 'nowrap',
              overflowX: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F2B08D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12z"></path>
                <path d="M7 10c1-1 3-1 4 0"></path>
                <path d="M13 10c1-1 3-1 4 0"></path>
                <path d="M9 16s1.5 1.5 3 1.5 3-1.5 3-1.5"></path>
              </svg>
              <span>Anonymous by Design</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <ShieldCheck strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>AI Moderated</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <Mic strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>Voice-to-Text</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#F4EDE8', fontWeight: 600 }}>
              <Globe strokeWidth={1.8} size={18} color="#F2B08D" />
              <span>Indian Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MODE B: WHY AAWAJ MAN KI? (SCROLL CONVERGENCE ANIMATION) ── */}
      <section ref={vsRef} className="section-space" style={{ backgroundColor: '#FFF8F2', position: 'relative', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Left Column Narrative */}
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#63344F', letterSpacing: '0.04em' }}>
                  Why Aawaj Man Ki?
                </span>
                <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', marginTop: '4px' }} />
              </div>

              <h2 className="font-playfair" style={{ fontSize: '42px', lineHeight: 1.1, color: '#17151A', margin: 0 }}>
                Social media is<br />
                built for followers.<br />
                <span style={{ color: '#63344F' }}>We are built<br />for conversations.</span>
              </h2>

              <p style={{ fontSize: '14.5px', color: '#766D68', lineHeight: 1.6, margin: 0, maxWidth: '380px' }}>
                A calm, judgment-free space designed for ideas, empathy, and your authentic voice.
              </p>

              {/* Botanical Branch 1 */}
              <div style={{ marginTop: '16px' }}>
                <BotanicalBranch width={160} height={120} />
              </div>
            </div>

            {/* Right Column: Side-by-Side VS Comparison Cards */}
            <div style={{ flex: '1 1 540px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative' }}>
                
                {/* Floating VS Circle Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: vsInView ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.2)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, opacity 0.5s ease 0.4s',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFDFC',
                    border: '1.5px solid #F2B08D',
                    boxShadow: '0 6px 18px rgba(99, 52, 79, 0.18)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    color: '#63344F',
                    zIndex: 10,
                  }}
                >
                  VS
                </div>

                {/* Left Card: Traditional Social Media */}
                <div
                  style={{
                    backgroundColor: '#FFFDFC',
                    border: '1px solid #E8DDD5',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transform: vsInView ? 'translateX(0)' : 'translateX(-50px)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
                    boxShadow: vsInView ? '0 8px 24px rgba(70, 45, 35, 0.06)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#332821', textAlign: 'center', borderBottom: '1px solid #F0E7E0', paddingBottom: '12px' }}>
                    Traditional Social Media
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Followers', 'Likes', 'Personal Branding', 'Identity', 'Popularity', 'Toxicity & Hate'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#766D68' }}>
                        <div style={{ width: '17px', height: '17px', borderRadius: '50%', backgroundColor: '#D94B48', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <X size={11} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Aawaj Man Ki */}
                <div
                  style={{
                    backgroundColor: '#FFFDFC',
                    border: '1px solid #E8DDD5',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transform: vsInView ? 'translateX(0)' : 'translateX(50px)',
                    opacity: vsInView ? 1 : 0,
                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 0.8s ease 0.15s',
                    boxShadow: vsInView ? '0 12px 30px rgba(99, 52, 79, 0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#332821', borderBottom: '1px solid #F0E7E0', paddingBottom: '12px' }}>
                    <img src={logoMKA} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '5px' }} />
                    <span>Aawaj Man Ki</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Anonymous', 'Respectful', 'Ideas First', 'AI Moderated', 'Meaningful Discussions', 'Toxicity Free'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#17151A', fontWeight: 600 }}>
                        <div style={{ width: '17px', height: '17px', borderRadius: '50%', backgroundColor: '#29965A', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Check size={11} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
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

      {/* ── 3. WHAT MAKES US DIFFERENT ── */}
      <section id="features" className="section-space" style={{ backgroundColor: '#F2E8DF', borderTop: '1px solid #E9DDD3', borderBottom: '1px solid #E9DDD3' }}>
        <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <h2 className="font-playfair" style={{ fontSize: '40px', color: '#17151A', margin: 0 }}>
              What Makes Us Different
            </h2>
            <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', margin: '12px auto 0 auto' }} />
          </div>

          {/* Top 3 Featured Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="diff-card">
              <div className="diff-icon-box">
                <Lock strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>Anonymous by Design</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                No real names. No public profiles. Pure text & voice expression.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>

            <div className="diff-card">
              <div className="diff-icon-box">
                <ShieldCheck strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>AI-Powered Safety</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                Detects hate speech. Filters abuse. Protects conversations.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>

            <div className="diff-card">
              <div className="diff-icon-box">
                <Mic strokeWidth={1.75} size={38} color="#63344F" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#63344F', margin: 0 }}>Voice-to-Text</h3>
              <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                Speak naturally. Supports Indian languages. Audio deleted after processing.
              </p>
              <button
                type="button"
                className="learn-more-link"
                onClick={() => onNavigate('/register')}
              >
                Learn More <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Bottom Row Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MessageCircle strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Discussion First</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  Ideas over popularity. Quality conversations that matter.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Lock strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Privacy First</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  No identity exposure. No follower counts. Privacy by default.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF8F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Users strokeWidth={1.75} size={22} color="#63344F" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#63344F', margin: '0 0 4px 0' }}>Community Moderation</h4>
                <p style={{ fontSize: '13.5px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>
                  Report harmful content. Human + AI review for healthy discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BUILT FOR EVERY VOICE ── */}
      <section className="section-space" style={{ backgroundColor: '#FFF8F2', position: 'relative', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 className="font-playfair" style={{ fontSize: '42px', color: '#17151A', margin: 0 }}>
                  Built for Every Voice
                </h2>
                <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', marginTop: '6px' }} />
              </div>

              <p style={{ fontSize: '16px', color: '#766D68', lineHeight: 1.6, margin: 0 }}>
                A space for every Indian who wants to share, listen and connect.
              </p>

              {/* Interactive Voice Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', paddingTop: '10px' }}>
                {['Students', 'Young Professionals', 'Creators', 'Thinkers', 'Dreamers', 'Parents', 'Professionals', 'Anyone'].map((item, i) => (
                  <div key={i} className="voice-chip">
                    <Check strokeWidth={2.2} size={15} color="#29965A" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 520px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Botanical Branch 2 */}
              <BotanicalBranch
                width={170}
                height={130}
                flip={true}
                style={{ position: 'absolute', right: '-35px', top: '-45px', zIndex: 1 }}
              />

              <div className="sanctuary-card" style={{ zIndex: 2 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', color: '#F7D7C4', letterSpacing: '0.04em' }}>
                  A Sanctuary For All
                </span>
                <h3 className="font-playfair" style={{ fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
                  "Finally a platform where my thoughts matter more than my job title or social standing."
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF8F2', color: '#63344F', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                    AN
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700 }}>@mindful_soul</div>
                    <div style={{ fontSize: '12px', color: '#F7D7C4' }}>Anonymous Community Member</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. RE-ALIGNED SLEEK 4-STEP HOW IT WORKS (SOCIAL MEDIA FRIENDLY FLOW) ── */}
      <section id="how-it-works" className="section-space" style={{ backgroundColor: '#F2E8DF', borderTop: '1px solid #E9DDD3', borderBottom: '1px solid #E9DDD3' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#63344F', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Simple & Fast
            </span>
            <h2 className="font-playfair" style={{ fontSize: '38px', color: '#17151A', margin: '6px 0 0 0' }}>
              How It Works
            </h2>
            <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', margin: '10px auto 0 auto' }} />
          </div>

          {/* Compact 4-Step Social Media Friendly Horizontal Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '22px', position: 'relative' }}>
            {[
              { icon: UserPlus, step: '1', title: 'Sign Up Anonymously', desc: 'Register instantly with your email or mobile. No real-name requirement.' },
              { icon: BadgeCheck, step: '2', title: 'Choose Unique Handle', desc: 'Pick your unique handle (e.g. @mindful_soul) to represent your voice.' },
              { icon: Mic, step: '3', title: 'Express & Share', desc: 'Post thoughts via text, media, or AI voice-to-text in 22 Indian languages.' },
              { icon: MessagesSquare, step: '4', title: 'Connect & Discuss', desc: 'Join live topic discussions, react with empathy, and chat safely.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="step-card">
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(99, 52, 79, 0.08)' }}>
                      <Icon strokeWidth={1.8} size={24} color="#63344F" />
                    </div>
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F2B08D', color: '#17151A', fontWeight: 800, fontSize: '11.5px', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      {item.step}
                    </div>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#332821', margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: '13px', color: '#766D68', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. EXPRESS YOURSELF YOUR WAY ── */}
      <section className="section-space" style={{ backgroundColor: '#FFF8F2', position: 'relative', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 460px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 className="font-playfair" style={{ fontSize: '42px', color: '#17151A', margin: 0 }}>
                  Express Yourself Your Way
                </h2>
                <div style={{ width: '28px', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px', marginTop: '6px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                {[
                  { icon: FileText, title: 'Text Posts', desc: 'Share your thoughts in words.' },
                  { icon: Image, title: 'Images & Videos', desc: 'Share what you see and feel.' },
                  { icon: Mic, title: 'Voice-to-Text', desc: 'Speak your mind, we convert to text.' },
                  { icon: MessagesSquare, title: 'Comments', desc: 'Comment and join the conversation.' },
                  { icon: Smile, title: 'Reactions', desc: 'React and express your feelings.' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#FFFDFC', border: '1px solid #E8DDD5', flexShrink: 0 }}>
                        <Icon strokeWidth={1.75} size={20} color="#63344F" />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#332821' }}>{item.title}</div>
                        <div style={{ fontSize: '13px', color: '#766D68' }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Phone Mockup UI Showcase */}
            <div style={{ flex: '1 1 420px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Botanical Branch 3 */}
              <BotanicalBranch
                width={180}
                height={135}
                style={{ position: 'absolute', right: '-40px', bottom: '-40px', zIndex: 1 }}
              />

              <div
                className="animate-float"
                style={{
                  width: '310px',
                  borderRadius: '38px',
                  background: '#080A18',
                  padding: '14px',
                  boxShadow: '0 24px 60px rgba(48, 31, 25, 0.16)',
                  border: '3px solid #F2B08D',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    borderRadius: '26px',
                    background: '#FFF8F2',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700, color: '#63344F' }}>
                    <span>Aawaj Man Ki Feed</span>
                    <span>Live 🟢</span>
                  </div>

                  <div
                    style={{
                      background: '#FFFDFC',
                      border: '1px solid #E8DDD5',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#63344F', color: '#FFF', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>
                        QP
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#17151A' }}>@quietparagraph</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#17151A', lineHeight: 1.4 }}>
                      "Overcoming internal fear without seeking applause is the truest sign of maturity."
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: '#63344F', fontWeight: 700 }}>
                      <span>❤️ 14 Relate</span>
                      <span>💡 22 Well Said</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '16px',
                      background: '#63344F',
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

      {/* ── 7. CTA SECTION ── */}
      <section className="section-space" style={{ backgroundColor: '#FCE9DD', textAlign: 'center', borderTop: '1px solid #F2D7C7', borderBottom: '1px solid #F2D7C7', position: 'relative', overflow: 'hidden' }}>
        {/* Botanical Branch 4 */}
        <BotanicalBranch
          width={180}
          height={135}
          style={{ position: 'absolute', left: '16px', bottom: '-20px', zIndex: 1 }}
        />

        <div className="section-container" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <h2 className="font-playfair" style={{ fontSize: '42px', color: '#332821', margin: 0, lineHeight: 1.1 }}>
            Join India's Anonymous<br />Conversation Platform
          </h2>
          <p style={{ fontSize: '16px', color: '#766D68', margin: 0, lineHeight: 1.6 }}>
            Share your thoughts freely. Join meaningful discussions. Stay anonymous.
          </p>
          <div style={{ paddingTop: '6px' }}>
            <button
              type="button"
              className="btn-accent"
              style={{ fontSize: '15px', padding: '13px 32px', backgroundColor: '#6B3D5A', color: '#FFF8F2' }}
              onClick={() => onNavigate('/register')}
            >
              Get Started Now <ArrowRight size={16} />
            </button>
          </div>
          <span style={{ fontSize: '12.5px', color: '#766D68' }}>
            Free to use. No identity required.
          </span>
        </div>
      </section>

      {/* ── 8. RECONSTRUCTED & ACCURATE FOOTER (TAILORED FOR AAWAJ MAN KI) ── */}
      <footer id="about" style={{ backgroundColor: '#0B0D1B', color: '#FFFFFF', paddingTop: '68px', paddingBottom: '32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '44px', paddingBottom: '52px' }}>
            
            {/* Column 1: Logo & Brand Narrative */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={logoMKA}
                  alt="Aawaj Man Ki Logo"
                  style={{
                    width: '36px',
                    height: '36px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
                <span className="font-playfair" style={{ fontSize: '22px', fontWeight: 700, color: '#FFF8F2' }}>Aawaj Man Ki</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0 }}>
                India's first 18+ anonymous, text-first social platform designed for self-expression without public social pressure.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Quick Links</h4>
              <span onClick={() => onNavigate('/')} className="footer-link">Home</span>
              <a href="#features" className="footer-link">Features</a>
              <a href="#how-it-works" className="footer-link">How It Works</a>
              <a href="#safety" className="footer-link">Safety</a>
              <span onClick={() => onNavigate('/about')} className="footer-link">About Us</span>
            </div>

            {/* Column 3: Resources & Support */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Resources</h4>
              <span onClick={() => onNavigate('/help')} className="footer-link">FAQs</span>
              <span onClick={() => onNavigate('/community-guidelines')} className="footer-link">Community Guidelines</span>
              <span onClick={() => onNavigate('/help')} className="footer-link">Help & Support</span>
              <span onClick={() => onNavigate('/privacy-policy')} className="footer-link">Delete My Account</span>
            </div>

            {/* Column 4: Contact Us */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Contact Us</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
                <Mail size={16} color="#F2B08D" />
                <span>support@awaazmanki.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
                <Phone size={16} color="#F2B08D" />
                <span>+91 99999 99999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#A0A5BD' }}>
                <MapPin size={16} color="#F2B08D" />
                <span>Pune, Maharshtra</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '13.5px', color: '#A0A5BD' }}>
              Developed by <strong style={{ color: '#F2B08D' }}>Caryanamindia Pvt Ltd</strong>
            </span>

            <span style={{ fontSize: '13.5px', color: '#A0A5BD' }}>
              © 2026 Aawaj Man Ki. All rights reserved by Caryanamindia Pvt Ltd
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span onClick={() => onNavigate('/privacy-policy')} className="footer-link" style={{ fontSize: '13px' }}>Privacy Policy</span>
              <span onClick={() => onNavigate('/community-guidelines')} className="footer-link" style={{ fontSize: '13px' }}>Terms & Conditions</span>
              
              <button
                type="button"
                onClick={scrollToTop}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  marginLeft: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F2B08D';
                  e.currentTarget.style.color = '#0B0D1B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                title="Back to Top"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
