import React, { useState, useEffect } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  ShieldCheck,
  ShieldAlert,
  Feather,
  Heart,
  Sparkles,
  MessageSquare,
  Lock,
  Users,
  Globe,
  ArrowRight,
  Eye,
  Languages,
  CheckCircle2,
  Star,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Mic2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATS = [
  { number: '50,000+', label: 'Anonymous Voices' },
  { number: '22', label: 'Indian Languages' },
  { number: '1.2M+', label: 'Thoughts Shared' },
  { number: '100%', label: 'Identity Protected' },
];

const FEATURES = [
  {
    icon: Lock,
    title: 'Full Anonymity Guaranteed',
    desc: 'Your real name, phone, and email are completely hidden. You get a unique anonymous handle and initial avatar — that is all others see.',
    color: 'var(--deep-plum)',
  },
  {
    icon: Languages,
    title: '22 Indian Languages',
    desc: 'Write in your native language — Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, and more. AI-powered translation for every reader.',
    color: '#3F7772',
  },
  {
    icon: MessageSquare,
    title: 'Anonymous 1-on-1 Chat',
    desc: 'Connect privately with any member. Send end-to-end shielded direct messages without ever revealing your identity.',
    color: '#8C5E3C',
  },
  {
    icon: ShieldCheck,
    title: 'AI Moderation Engine',
    desc: 'Real-time hate speech detection and content moderation keeps conversations respectful and safe for everyone on the platform.',
    color: '#5E5B8C',
  },
  {
    icon: Feather,
    title: 'Multiple Post Formats',
    desc: 'Share Thoughts, Confessions, Experiences, Questions, Positive Notes, and more — with comments, replies, and reactions.',
    color: '#7B6E5E',
  },
  {
    icon: Globe,
    title: 'Real-Time Translation',
    desc: 'Every post and comment auto-translates to your preferred language. Switch language live from the navbar at any time.',
    color: '#3A6B7A',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create Your Anonymous Account',
    desc: 'Sign up with just an email. We generate your anonymous handle and avatar instantly. Your real identity is never visible.',
  },
  {
    step: '02',
    title: 'Set Your Language Preference',
    desc: 'Select your preferred Indian language from 22 options during onboarding. The entire interface translates in real-time.',
  },
  {
    step: '03',
    title: 'Share Your Unspoken Thoughts',
    desc: 'Write freely — confessions, personal experiences, questions, or positive notes. Our AI moderation ensures safety.',
  },
  {
    step: '04',
    title: 'Connect & Interact Anonymously',
    desc: 'React, comment, reply, and even chat 1-on-1 with other members — all while staying completely anonymous.',
  },
];

const POST_TYPES = [
  { label: 'Thought', color: 'var(--deep-plum)', post: 'Nobody claps for the quiet battles you win inside your own head — but those are the ones that rebuild you.' },
  { label: 'Positive Note', color: '#3F7772', post: 'You don\'t have to solve your entire life today. Focus on taking one gentle step forward.' },
  { label: 'Question', color: '#8C5E3C', post: 'Does anyone else feel completely drained after trying to meet everyone\'s expectations at work?' },
  { label: 'Confession', color: '#5E5B8C', post: 'I pretend to be confident every day at work, but inside I still feel like I don\'t belong here.' },
];

const TESTIMONIALS = [
  {
    username: '@quietchapter',
    lang: 'Hindi',
    text: 'This platform gave me a safe space to talk about career burnout without the fear of being judged by my colleagues. The anonymity is real.',
  },
  {
    username: '@hiddenpage',
    lang: 'Telugu',
    text: 'Being able to write in Telugu and have others understand through translation changed everything. I finally feel heard.',
  },
  {
    username: '@thoughtwindow',
    lang: 'Bengali',
    text: 'The 1-on-1 anonymous chat helped me connect with someone who went through the same family pressure. I felt less alone.',
  },
  {
    username: '@plaintruth',
    lang: 'Marathi',
    text: 'I have been wanting to confess something for 2 years. Writing it here anonymously was the first time I felt truly free.',
  },
];

const FAQS = [
  {
    q: 'Is my identity truly protected?',
    a: 'Yes. We never display your real name, email, or phone number to any other user. You only see anonymous usernames and initial avatars across the entire platform.',
  },
  {
    q: 'Can I write in my regional language?',
    a: 'Absolutely. Man Ki Aavaj supports all 22 official scheduled Indian languages. You can write in your preferred language, and readers can translate posts to their own language in one click.',
  },
  {
    q: 'What is the age requirement?',
    a: 'This platform is designed for users aged 18 and above. The content includes personal experiences, confessions, and sensitive topics that require maturity.',
  },
  {
    q: 'How does the moderation work?',
    a: 'We use a real-time AI hate speech and harassment detection engine that checks all posts and comments before they are published. Flagged content goes to human admin review.',
  },
  {
    q: 'Can someone find out who I am?',
    a: 'No. Your generated anonymous handle is not linked to your real identity in any way that is visible to other members. Even in 1-on-1 chats, both parties remain anonymous.',
  },
];

export function LandingPage({ onNavigate }) {
  const [activePostType, setActivePostType] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePostType((prev) => (prev + 1) % POST_TYPES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <PublicLayout activeRoute="/" onNavigate={onNavigate}>

      {/* ─────────────────────────────────────────────── */}
      {/* HERO SECTION */}
      {/* ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #F5F0EE 0%, #EDE8E6 50%, #E1DCDB 100%)',
          padding: '80px 20px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(111,64,95,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(63,119,114,0.07)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          {/* Left: Copy */}
          <div className="flex-col gap-md">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#C0392B',
                color: '#fff',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 14px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                width: 'fit-content',
                boxShadow: '0 2px 10px rgba(192,57,43,0.35)',
              }}
            >
              <ShieldAlert size={14} />
              18+ Strictly
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1.15,
                color: 'var(--eclipse)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Share your thoughts,<br />
              <span style={{ color: 'var(--deep-plum)' }}>not your identity.</span>
            </h1>

            <p style={{ fontSize: '18px', lineHeight: 1.65, color: 'var(--hurricane)', maxWidth: '500px' }}>
              Share confessions, experiences, questions, and ideas anonymously in India's first multilingual anonymous writing platform — with zero public identity exposure.
            </p>

            <div className="flex-row items-center gap-md" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                onClick={() => onNavigate('/register')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--deep-plum)', color: 'var(--pure-white)',
                  padding: '14px 28px', borderRadius: 'var(--radius-pill)',
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(111,64,95,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(111,64,95,0.40)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(111,64,95,0.35)'; }}
              >
                Start Writing Free <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('/explore')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'transparent', color: 'var(--eclipse)',
                  padding: '14px 28px', borderRadius: 'var(--radius-pill)',
                  fontSize: '16px', fontWeight: 500, cursor: 'pointer',
                  border: '2px solid var(--eclipse)',
                }}
              >
                Explore Thoughts
              </button>
            </div>

            <div className="flex-row items-center gap-md" style={{ marginTop: '8px', flexWrap: 'wrap' }}>
              {['No real name required', '22 Indian languages', 'Free forever'].map((tag) => (
                <span key={tag} className="flex-row items-center gap-xs" style={{ fontSize: '13px', color: 'var(--hurricane)', fontWeight: 500 }}>
                  <CheckCircle2 size={15} style={{ color: '#3F7772' }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Animated Post Preview */}
          <div className="flex-col gap-md" style={{ position: 'relative' }}>
            {/* Active Post Card */}
            <div
              key={activePostType}
              className="mka-card"
              style={{
                borderLeft: `5px solid ${POST_TYPES[activePostType].color}`,
                padding: '24px',
                animation: 'fadeIn 0.4s ease',
              }}
            >
              <div className="flex-row items-center gap-sm" style={{ marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: POST_TYPES[activePostType].color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>A</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--eclipse)' }}>@anonymous{(activePostType * 47 + 12) % 99}</div>
                  <span style={{ background: POST_TYPES[activePostType].color, color: 'white', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                    {POST_TYPES[activePostType].label}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'var(--eclipse)', fontStyle: 'italic' }}>
                "{POST_TYPES[activePostType].post}"
              </p>
              <div className="flex-row items-center gap-md" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--swiss-coffee)' }}>
                <span className="caption-text flex-row items-center gap-xs"><Heart size={13} /> 47 I Relate</span>
                <span className="caption-text flex-row items-center gap-xs"><MessageSquare size={13} /> 12 Comments</span>
              </div>
            </div>

            {/* Post type dots */}
            <div className="flex-row items-center gap-xs" style={{ justifyContent: 'center' }}>
              {POST_TYPES.map((pt, i) => (
                <button
                  key={i}
                  onClick={() => setActivePostType(i)}
                  style={{
                    width: i === activePostType ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: i === activePostType ? pt.color : 'var(--zorba)',
                    transition: 'all 0.3s',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            {/* Stacked subtle cards behind */}
            <div style={{ position: 'absolute', top: '12px', right: '-12px', zIndex: -1, width: '85%', height: '100%', background: 'var(--swiss-coffee)', borderRadius: 'var(--radius-lg)', opacity: 0.5 }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* STATS BAR */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--eclipse)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="flex-col items-center text-center gap-xs">
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', fontWeight: 700, color: 'var(--swiss-coffee)', lineHeight: 1 }}>
                {stat.number}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--zorba)', fontWeight: 500, letterSpacing: '0.03em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FEATURES GRID */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 20px', background: 'var(--soft-white)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="flex-col items-center text-center gap-sm" style={{ marginBottom: '52px' }}>
            <span style={{ background: 'rgba(111,64,95,0.1)', color: 'var(--deep-plum)', borderRadius: 'var(--radius-pill)', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
              Why Man Ki Aavaj
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--eclipse)', fontWeight: 700, maxWidth: '560px' }}>
              Everything you need to speak without fear
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--hurricane)', maxWidth: '580px', lineHeight: 1.65 }}>
              Built specifically for the Indian audience — in every language, with privacy-first design at every layer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="mka-card flex-col gap-sm"
                  style={{ background: 'var(--pure-white)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${feat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} style={{ color: feat.color }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--eclipse)', fontWeight: 700 }}>{feat.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--hurricane)', lineHeight: 1.65 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* HOW IT WORKS */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 20px', background: 'var(--swiss-coffee)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="flex-col items-center text-center gap-sm" style={{ marginBottom: '52px' }}>
            <span style={{ background: 'rgba(111,64,95,0.1)', color: 'var(--deep-plum)', borderRadius: 'var(--radius-pill)', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
              Simple as it gets
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--eclipse)', fontWeight: 700 }}>
              How Man Ki Aavaj Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
            {STEPS.map((step, i) => (
              <div key={step.step} className="flex-col gap-sm" style={{ position: 'relative' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: '24px', left: 'calc(50% + 24px)', width: 'calc(100% - 24px)', height: '2px', background: 'var(--zorba)', display: window.innerWidth > 768 ? 'block' : 'none', zIndex: 0 }} />
                )}
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--deep-plum)', color: 'var(--pure-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, zIndex: 1, position: 'relative' }}>
                  {step.step}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--eclipse)', fontWeight: 700, marginTop: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--hurricane)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex-col items-center" style={{ marginTop: '52px' }}>
            <button
              onClick={() => onNavigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--deep-plum)', color: 'var(--pure-white)',
                padding: '14px 32px', borderRadius: 'var(--radius-pill)',
                fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(111,64,95,0.3)',
              }}
            >
              Create Your Anonymous Account <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* LANGUAGE BAND */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 20px', background: 'var(--pure-white)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div className="flex-col gap-md">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--eclipse)', fontWeight: 700 }}>
              Write in your language.<br />
              <span style={{ color: 'var(--deep-plum)' }}>Be understood by everyone.</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--hurricane)', lineHeight: 1.7 }}>
              Post in Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Gujarati, Urdu, Odia, Marathi, or any of our 22 supported Indian languages. Our real-time translation engine ensures every reader sees the post in their own tongue.
            </p>
            <button
              onClick={() => onNavigate('/register')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--deep-plum)', fontWeight: 600, fontSize: '15px', background: 'transparent', cursor: 'pointer' }}
            >
              Start writing in your language <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['हिन्दी', 'বাংলা', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'मराठी', 'ગુજરાતી', 'اردو', 'ਪੰਜਾਬੀ', 'ଓଡ଼ିଆ', 'മലയാളം', 'অসমীয়া', 'मैथिली', 'Sanskrit'].map((lang) => (
              <span
                key={lang}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--swiss-coffee)',
                  color: 'var(--eclipse)',
                  fontSize: '15px',
                  fontWeight: 500,
                  border: '1px solid var(--border-light)',
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* TESTIMONIALS */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 20px', background: 'var(--soft-white)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="flex-col items-center text-center gap-sm" style={{ marginBottom: '48px' }}>
            <span style={{ background: 'rgba(111,64,95,0.1)', color: 'var(--deep-plum)', borderRadius: 'var(--radius-pill)', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
              Real Voices
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--eclipse)', fontWeight: 700 }}>
              What our members say
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.username}
                className="mka-card flex-col gap-md"
                style={{ background: 'var(--pure-white)' }}
              >
                <div className="flex-row items-center gap-xs" style={{ color: '#E6A817' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} style={{ fill: '#E6A817' }} />)}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--eclipse)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div className="flex-row items-center gap-sm" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--swiss-coffee)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--deep-plum)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                    {t.username[1].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>{t.username}</div>
                    <div style={{ fontSize: '11px', color: 'var(--hurricane)' }}>Writing in {t.lang}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FAQ */}
      {/* ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 20px', background: 'var(--swiss-coffee)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex-col items-center text-center gap-sm" style={{ marginBottom: '48px' }}>
            <span style={{ background: 'rgba(111,64,95,0.1)', color: 'var(--deep-plum)', borderRadius: 'var(--radius-pill)', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
              FAQs
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--eclipse)', fontWeight: 700 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex-col gap-sm">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="mka-card"
                style={{ background: 'var(--pure-white)', padding: '0', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex-row justify-between items-center"
                  style={{ width: '100%', padding: '18px 20px', textAlign: 'left', gap: '16px' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--eclipse)' }}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} style={{ color: 'var(--deep-plum)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--hurricane)', flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--swiss-coffee)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--hurricane)', lineHeight: 1.7, paddingTop: '14px' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FINAL CTA SECTION */}
      {/* ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, var(--eclipse) 0%, #3D2535 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(225,220,219,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(111,64,95,0.15)' }} />

        <div style={{ maxWidth: '700px', margin: '0 auto' }} className="flex-col items-center text-center gap-md">
          <Mic2 size={48} style={{ color: 'var(--swiss-coffee)' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--swiss-coffee)', fontWeight: 700, lineHeight: 1.2 }}>
            Your voice matters.<br />Even when it's unheard.
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--zorba)', lineHeight: 1.7, maxWidth: '520px' }}>
            Join thousands of anonymous writers from across India sharing their truth in their own language — safely and freely.
          </p>

          <div className="flex-row items-center gap-md" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <button
              onClick={() => onNavigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--swiss-coffee)', color: 'var(--eclipse)',
                padding: '15px 32px', borderRadius: 'var(--radius-pill)',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              Start Writing Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('/explore')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: 'var(--swiss-coffee)',
                padding: '15px 32px', borderRadius: 'var(--radius-pill)',
                fontSize: '16px', fontWeight: 500, cursor: 'pointer',
                border: '2px solid rgba(225,220,219,0.4)',
              }}
            >
              Explore First
            </button>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--zorba)', opacity: 0.7 }}>
            No credit card. No real name. No exposure.
          </p>
        </div>
      </section>

    </PublicLayout>
  );
}
