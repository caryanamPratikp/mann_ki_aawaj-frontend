import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Search, HelpCircle, Shield, User, MessageSquare, FileText, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function HelpSupportPage({ onNavigate }) {
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Account & Handle');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const { t } = useLanguage();

  const categories = [
    { titleKey: 'accountAndHandle', defaultTitle: 'Account & Handle', icon: User, descKey: 'accountAndHandleDesc', defaultDesc: 'Handle selection, email verification, passwords.' },
    { titleKey: 'privacyAndSecurity', defaultTitle: 'Privacy & Security', icon: Shield, descKey: 'privacyAndSecurityDesc', defaultDesc: 'Identity shielding, search indexing, privacy options.' },
    { titleKey: 'postingAndContent', defaultTitle: 'Posting & Content', icon: FileText, descKey: 'postingAndContentDesc', defaultDesc: 'Publishing thoughts, voice-to-text, post deletion.' },
    { titleKey: 'directMessaging', defaultTitle: 'Direct Messaging', icon: MessageSquare, descKey: 'directMessagingDesc', defaultDesc: 'Message requests, blocking, safety controls.' },
  ];

  const faqs = [
    {
      q: 'How does anonymity work on Man Ki Aavaj?',
      a: 'Your real full name, phone number, and email address are strictly private and never displayed publicly. Only your selected anonymous handle (e.g. @quietparagraph) is visible to other platform members.',
    },
    {
      q: 'Can anyone see my real email or phone number?',
      a: 'No. Your contact details are shielded behind secure end-to-end user storage. Other users cannot see your identity, email, or mobile number under any circumstances.',
    },
    {
      q: 'How do I delete my published thoughts or posts?',
      a: 'Go to your "My Posts" section from the left sidebar or click the three dots (...) menu on your post card, then click "Delete Post". The post is permanently hard-deleted instantly from the feed and database.',
    },
    {
      q: 'How does the voice-to-text feature work when creating posts or comments?',
      a: 'Click the microphone icon on any post composer or comment bar. Speak clearly, and our speech recognition API will automatically transcribe your spoken voice into text in real time.',
    },
    {
      q: 'What happens if someone sends unwanted direct message requests?',
      a: 'You can decline any incoming message request with one click, block the sender, or adjust who can send you requests under Settings > Privacy Preferences.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      addToast('Please fill out the subject and description.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketSubmitted(true);
      addToast('Support ticket submitted! Reference #MKA-8924', 'success');
      setTicketSubject('');
      setTicketMessage('');
    }, 800);
  };

  return (
    <UserLayout activeRoute="/help" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        {/* Header Hero */}
        <div
          style={{
            padding: '24px 20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6F405F 0%, #4A2B40 100%)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={28} color="#FFD1E8" />
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{t('helpAndSupportCenter')}</h1>
              <p style={{ fontSize: '13px', color: '#E0C8D6', margin: 0 }}>
                {t('findAnswersDesc')}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '540px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchHelpArticles')}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: '24px',
                border: 'none',
                fontSize: '13.5px',
                outline: 'none',
                color: '#2D1D15',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </div>

        {/* Quick Category Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="mka-card"
                style={{ padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--deep-plum-light)', color: 'var(--deep-plum)' }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--eclipse)' }}>{t(cat.titleKey) || cat.defaultTitle}</h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--hurricane)', margin: 0, lineHeight: 1.4 }}>{t(cat.descKey) || cat.defaultDesc}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="mka-card flex-col gap-md">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--eclipse)' }}>
            {t('frequentlyAskedQuestions')}
          </h2>

          <div className="flex-col gap-xs">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    backgroundColor: isOpen ? '#FAF8F7' : '#FFFFFF',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--eclipse)',
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--deep-plum)" /> : <ChevronDown size={18} color="var(--hurricane)" />}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 16px 14px 16px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: '#4A3E3D',
                        borderTop: '1px solid #EDE8E6',
                        paddingTop: '10px',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Ticket Form */}
        <div className="mka-card flex-col gap-md">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--eclipse)' }}>
            {t('stillNeedHelp', 'Still Need Help? Contact Community Support')}
          </h2>
          <p className="secondary-text" style={{ fontSize: '13px', margin: 0 }}>
            {t('submitTicketDesc', 'Submit a confidential support ticket. Our team responds within 24 hours.')}
          </p>

          {ticketSubmitted ? (
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56,142,60,0.08)',
                border: '1px solid rgba(56,142,60,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={24} color="#2E7D32" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E20' }}>
                  {t('ticketSubmitted', 'Support Ticket Submitted (#MKA-8924)')}
                </div>
                <div style={{ fontSize: '12.5px', color: '#388E3C' }}>
                  {t('ticketThanks', 'Thank you! Our support team will review your inquiry and get back to you via your notification panel.')}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="flex-col gap-md">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="flex-col gap-xs">
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>{t('category', 'Category')}</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option>{t('accountAndHandle', 'Account & Handle')}</option>
                    <option>{t('privacyAndSecurity', 'Privacy & Security')}</option>
                    <option>{t('technicalBug', 'Technical Bug / Issue')}</option>
                    <option>{t('reportMisconduct', 'Report Misconduct')}</option>
                  </select>
                </div>

                <div className="flex-col gap-xs">
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>{t('subject', 'Subject')}</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={t('subjectPlaceholder', 'Brief summary of your inquiry...')}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div className="flex-col gap-xs">
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>{t('description', 'Description')}</label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder={t('descPlaceholder', 'Provide details about your issue or question...')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div className="flex-row justify-end">
                <Button type="submit" variant="primary" icon={Send} disabled={submitting}>
                  {submitting ? t('submitting', 'Submitting...') : t('submitSupportTicket', 'Submit Support Ticket')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

