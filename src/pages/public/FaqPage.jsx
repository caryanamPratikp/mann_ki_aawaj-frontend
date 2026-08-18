import React, { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { HelpCircle, Search, ChevronDown, ShieldCheck, Lock, Trash2, Mic, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function FaqPage({ onNavigate }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = ['All', 'Identity & Privacy', 'Posting & Voice', '30-Day Data Rule', 'Safety & 3-Strikes'];


  const faqs = [
    {
      category: 'Identity & Privacy',
      question: 'How does identity shielding work on Aawaj Man Ki?',
      answer: 'Aawaj Man Ki strictly segregates your registration credentials (Full Name, Phone Number, Email) from your public handles (e.g. @mindful_soul). Your real identity is never exposed to other members, search engines, or public feeds under any circumstances.',
    },
    {
      category: '30-Day Data Rule',
      question: 'What is the 30-Day Data Deletion Grace Period?',
      answer: 'When you initiate an account deletion request, your profile, handle reservation, published posts, comments, and direct messages enter a 30-day grace period. During these 30 days, your account is hidden. After 30 days, all your data is permanently and irreversibly destroyed from server storage.',
    },
    {
      category: 'Safety & 3-Strikes',
      question: 'How does the 3-Warning Account Suspension policy work?',
      answer: 'To ensure a safe and harassment-free community: Strike 1 issues an official safety warning and removes the offending content; Strike 2 applies a temporary 48-hour mute on creating new posts and DMs; Strike 3 permanently suspends the account, revokes the handle, and blacklists the device.',
    },
    {
      category: 'Posting & Voice',
      question: 'How do I use voice-to-text in 22 Indian regional languages?',
      answer: 'Click the microphone icon on any post composer or comment bar. Speak clearly in your preferred Indian language (Hindi, Marathi, Tamil, Bengali, etc.), and our AI voice engine will automatically transcribe your speech into text in real-time.',
    },
    {
      category: 'Identity & Privacy',
      question: 'Can other users see my email address or phone number?',
      answer: 'No. Your phone number and email address are encrypted at rest and used strictly for OTP verification and account recovery. They are never rendered in public APIs, profiles, or post metadata.',
    },
    {
      category: 'Posting & Voice',
      question: 'Can I delete my published posts or comments immediately?',
      answer: 'Yes! You have full ownership of your content. Click the three dots (...) menu on any of your posts or comments and select "Delete". The content is permanently erased from the live stream immediately.',
    },
    {
      category: 'Safety & 3-Strikes',
      question: 'Are external links and phone numbers allowed in public posts?',
      answer: 'No. To protect members from spam, scams, and doxxing, our automated client-side and backend moderation systems block posts, comments, and DMs containing personal phone numbers, email addresses, or unverified external links.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout activeRoute="/help" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(242, 176, 141, 0.15)', border: '1px solid #F2B08D' }}>
              <HelpCircle size={16} color="#F2B08D" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Knowledge Base & FAQ
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 4vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: '15.5px', color: '#A0A5BD', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
              Find instant answers regarding identity shielding, 3-strike safety rules, 30-day data deletion, and AI voice posting.
            </p>

            {/* Search Input Bar */}
            <div style={{ width: '100%', maxWidth: '520px', position: 'relative', marginTop: '8px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. 30-day rule, anonymity, voice)..."
                style={{
                  width: '100%',
                  padding: '12px 18px 12px 46px',
                  borderRadius: '28px',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  backgroundColor: '#0F1226',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'border-color 0.25s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-24px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          
          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    backgroundColor: isActive ? '#63344F' : '#FFFDFC',
                    color: isActive ? '#FFF8F2' : '#332821',
                    border: isActive ? '1.5px solid #63344F' : '1.5px solid #E8DDD5',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 14px rgba(99, 52, 79, 0.22)' : '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '18px', padding: '40px 20px', textAlign: 'center', color: '#766D68' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>No questions found matching "{searchQuery}"</p>
                <span style={{ fontSize: '13px' }}>Try searching another term or select "All" categories.</span>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#FFFDFC',
                      border: isOpen ? '1.5px solid #F2B08D' : '1.5px solid #E8DDD5',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: isOpen ? '0 8px 24px rgba(99, 52, 79, 0.08)' : '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      style={{
                        width: '100%',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: 700, color: '#17151A', lineHeight: 1.35 }}>
                        {faq.question}
                      </span>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: isOpen ? '#FCE9DD' : '#F5ECE5',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <ChevronDown size={18} color="#63344F" />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 22px 20px 22px',
                          fontSize: '14px',
                          color: '#524741',
                          lineHeight: 1.6,
                          borderTop: '1px solid #F3EAE4',
                          paddingTop: '14px',
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Need More Assistance Banner */}
          <div
            style={{
              marginTop: '36px',
              backgroundColor: '#080A18',
              borderRadius: '22px',
              padding: '28px 32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F2B08D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Still Have Questions?
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#FFF8F2' }}>
                Submit a Direct Inquiry to Admin
              </h3>
              <p style={{ fontSize: '13.5px', color: '#A0A5BD', margin: 0 }}>
                Our support team logs ticket references and responds within 24 hours.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '24px',
                backgroundColor: '#F2B08D',
                color: '#17151A',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(242, 176, 141, 0.25)',
              }}
            >
              <MessageSquare size={16} /> Submit Inquiry <ArrowRight size={15} />
            </button>
          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
