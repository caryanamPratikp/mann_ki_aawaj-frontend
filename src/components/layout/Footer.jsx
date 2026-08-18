import React from 'react';
import logoMKA from '../../assets/logo_MKA.png';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="about" style={{ backgroundColor: '#0B0D1B', color: '#FFFFFF', paddingTop: '68px', paddingBottom: '32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="section-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '44px', paddingBottom: '52px' }}>
          
          {/* Column 1: Logo & Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onNavigate('/')}>
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
              Your trusted platform for anonymous, safe, and judgment-free conversations. AI-powered moderation keeps discussions respectful and toxicity-free.
            </p>
          </div>

          {/* Column 2: Quick Links (Landing Page Sections & About) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Quick Links</h4>
            <span onClick={() => onNavigate('/')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Home</span>
            <a href="/#features" onClick={(e) => { e.preventDefault(); onNavigate('/'); setTimeout(() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="footer-link" style={{ color: '#A0A5BD', textDecoration: 'none', cursor: 'pointer', fontSize: '14px' }}>Features</a>
            <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); onNavigate('/'); setTimeout(() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="footer-link" style={{ color: '#A0A5BD', textDecoration: 'none', cursor: 'pointer', fontSize: '14px' }}>How It Works</a>
            <span onClick={() => onNavigate('/about')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>About Us</span>
          </div>

          {/* Column 3: Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Resources</h4>
            <span onClick={() => onNavigate('/faq')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>FAQs</span>
            <span onClick={() => onNavigate('/privacy-policy')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Privacy Policy</span>
            <span onClick={() => onNavigate('/community-guidelines')} className="footer-link" style={{ color: '#A0A5BD', cursor: 'pointer', fontSize: '14px' }}>Community Guidelines</span>
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
              <span>Pune, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
  style={{
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <span style={{ fontSize: '13.5px', color: '#A0A5BD' }}>
    © 2026 Aawaj Man Ki. All rights reserved by Caryanamindia Pvt Ltd
  </span>
</div>
      </div>
    </footer>
  );
}

