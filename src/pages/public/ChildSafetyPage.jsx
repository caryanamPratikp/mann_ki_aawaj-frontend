import React, { useLayoutEffect } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { ShieldAlert, Mail, Shield, AlertTriangle, CheckCircle2, Lock, FileText, UserCheck } from 'lucide-react';

export function ChildSafetyPage({ onNavigate }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <PublicLayout activeRoute="/child-safety" onNavigate={onNavigate}>
      <div style={{ backgroundColor: '#FFF8F2', minHeight: '100vh', paddingBottom: '70px' }}>
        
        {/* Page Header */}
        <div style={{ backgroundColor: '#080A18', color: '#FFF8F2', padding: '60px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(255, 107, 107, 0.15)', border: '1px solid #FF6B6B' }}>
              <ShieldAlert size={16} color="#FF6B6B" />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Safety & Compliance Standards
              </span>
            </div>
            <h1 className="font-playfair" style={{ color: '#FFFFFF', fontSize: 'clamp(30px, 4vw, 44px)', margin: 0, lineHeight: 1.15 }}>
              AawajManki – Child Safety Standards
            </h1>
            <p style={{ fontSize: '14.5px', color: '#A0A5BD', margin: 0 }}>
              Last Updated: August 27, 2026
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ maxWidth: '860px', margin: '-30px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Preamble Card */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FCE9DD', border: '1px solid #F2B08D', display: 'grid', placeItems: 'center' }}>
                  <Shield size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    Our Commitment to Child Safety
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#63344F', fontWeight: 600 }}>Zero-Tolerance Policy</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki is committed to maintaining a safe environment for all users. We have a zero-tolerance policy toward child sexual abuse and exploitation (CSAE), child sexual abuse material (CSAM), grooming, sexual exploitation, and any other activity that may endanger or harm children.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                These Child Safety Standards apply to the AawajManki application, its users, user-generated content, audio content, profiles, comments, messages, and other features or services provided through AawajManki.
              </p>
            </div>

            {/* 1. Zero-Tolerance Policy */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                1. Zero-Tolerance Policy
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki strictly prohibits:
              </p>
              <ul style={{ fontSize: '14px', color: '#4A3E3D', margin: 0, paddingLeft: '22px', lineHeight: 1.7 }}>
                <li>Child sexual abuse or exploitation.</li>
                <li>Child sexual abuse material (CSAM).</li>
                <li>Sexual content involving or depicting minors.</li>
                <li>Grooming or attempting to establish inappropriate sexual relationships with minors.</li>
                <li>Sexual solicitation or exploitation of children.</li>
                <li>Sextortion or threats involving minors.</li>
                <li>Trafficking or exploitation of children.</li>
                <li>Sharing, uploading, requesting, promoting, or distributing CSAM.</li>
                <li>Using AawajManki to facilitate or encourage the sexual exploitation or abuse of children.</li>
                <li>Any other conduct that places a child at risk of sexual abuse, exploitation, or harm.</li>
              </ul>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Users must not create, upload, share, request, distribute, or promote any content or behavior that violates these standards.
              </p>
            </div>

            {/* 2. User Reporting and Child Safety Concerns */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                2. User Reporting and Child Safety Concerns
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki provides users with mechanisms to report safety concerns through the application.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Users can report content, accounts, or activities that they believe may involve:
              </p>
              <ul style={{ fontSize: '14px', color: '#4A3E3D', margin: 0, paddingLeft: '22px', lineHeight: 1.7 }}>
                <li>Child sexual abuse or exploitation.</li>
                <li>CSAM.</li>
                <li>Grooming.</li>
                <li>Sexual solicitation involving a minor.</li>
                <li>Any other child-safety concern.</li>
                <li>Content or behavior that may place a child at risk.</li>
              </ul>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Users should provide sufficient information when submitting a report so that our team can investigate the concern appropriately. Reports concerning the safety of children are treated as a priority.
              </p>
            </div>

            {/* 3. How to Report a Child Safety Concern */}
            <div style={{ backgroundColor: '#FFF8F2', border: '1.5px solid #F2B08D', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(99, 52, 79, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FCE9DD', border: '1px solid #F2B08D', display: 'grid', placeItems: 'center' }}>
                  <Mail size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    3. How to Report a Child Safety Concern
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#63344F', fontWeight: 600 }}>Priority Reporting Channel</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Users can report concerns through the available reporting functionality within the AawajManki application.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                For urgent child-safety concerns or if additional assistance is required, users may also contact our designated child-safety contact:
              </p>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#63344F' }}>Child Safety Contact:</span>
                <span style={{ fontSize: '15px', color: '#17151A', fontWeight: 600 }}>
                  Email: <a href="mailto:asifattar003@gmail.com" style={{ color: '#63344F', textDecoration: 'underline' }}>asifattar003@gmail.com</a>
                </span>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                When contacting us, please include relevant information such as the account, content, or activity being reported and a description of the concern.
              </p>
              <div style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFC0C0', borderRadius: '12px', padding: '12px 16px', color: '#D32F2F', fontSize: '13.5px', fontWeight: 600 }}>
                ⚠️ Please do not intentionally send or redistribute suspected CSAM.
              </div>
            </div>

            {/* 4. Review and Enforcement */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                4. Review and Enforcement
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                When AawajManki becomes aware of content or activity that may violate these Child Safety Standards, we may take appropriate action based on the circumstances and applicable laws.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Possible actions include:
              </p>
              <ul style={{ fontSize: '14px', color: '#4A3E3D', margin: 0, paddingLeft: '22px', lineHeight: 1.7 }}>
                <li>Reviewing the reported content or account.</li>
                <li>Removing prohibited content.</li>
                <li>Restricting or suspending an account.</li>
                <li>Permanently terminating an account where appropriate.</li>
                <li>Preventing users from re-uploading prohibited content where technically and legally appropriate.</li>
                <li>Preserving relevant information where required or permitted by law.</li>
                <li>Cooperating with appropriate authorities when legally required.</li>
                <li>Reporting confirmed CSAM or other serious child-safety violations to the appropriate authorities as required by applicable law.</li>
              </ul>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                AawajManki does not tolerate users who knowingly facilitate, distribute, request, or promote CSAE or CSAM.
              </p>
            </div>

            {/* 5. Handling of CSAM */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                5. Handling of CSAM
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki prohibits CSAM in all forms.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                If we obtain actual knowledge of CSAM or child sexual exploitation on our platform, we will take appropriate action in accordance with our published standards and applicable laws.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                This may include removing or restricting access to the content, taking action against the responsible account, preserving relevant information when legally appropriate, and reporting to the appropriate authorities as required by applicable law.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                We will cooperate with lawful requests from competent authorities relating to child safety investigations.
              </p>
            </div>

            {/* 6. Prevention of Child Sexual Exploitation */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                6. Prevention of Child Sexual Exploitation
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki takes reasonable measures to prevent its services from being used for child sexual exploitation. Our approach includes:
              </p>
              <ul style={{ fontSize: '14px', color: '#4A3E3D', margin: 0, paddingLeft: '22px', lineHeight: 1.7 }}>
                <li>Prohibiting CSAE and CSAM through our platform rules.</li>
                <li>Providing reporting mechanisms for users.</li>
                <li>Reviewing reports and safety complaints.</li>
                <li>Taking enforcement action against accounts that violate our standards.</li>
                <li>Cooperating with relevant authorities when required.</li>
                <li>Maintaining a designated child-safety point of contact.</li>
                <li>Updating our safety practices when necessary to address emerging risks.</li>
              </ul>
            </div>

            {/* 7. Child Safety Point of Contact */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F5ECE5', border: '1px solid #E8DDD5', display: 'grid', placeItems: 'center' }}>
                  <UserCheck size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    7. Child Safety Point of Contact
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#766D68' }}>Official Compliance Contact</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki has designated a child-safety point of contact who can communicate with Google Play and other relevant authorities regarding CSAE prevention, CSAM reports, enforcement procedures, and child-safety compliance.
              </p>
              <div style={{ backgroundColor: '#FFF8F2', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#63344F' }}>Designated Child Safety Contact:</span>
                <span style={{ fontSize: '15px', color: '#17151A', fontWeight: 600 }}>
                  Email: <a href="mailto:asifattar003@gmail.com" style={{ color: '#63344F', textDecoration: 'underline' }}>asifattar003@gmail.com</a>
                </span>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                This contact is responsible for receiving and responding to child-safety concerns and relevant compliance communications.
              </p>
            </div>

            {/* 8. Compliance With Applicable Laws */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                8. Compliance With Applicable Laws
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki is committed to complying with applicable child-safety laws and regulations.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Where required by applicable law, AawajManki will cooperate with law-enforcement agencies and relevant regional or national authorities concerning confirmed child sexual abuse, exploitation, or other serious child-safety matters.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Our policies and enforcement procedures may be updated when required to reflect applicable legal and regulatory requirements.
              </p>
            </div>

            {/* 9. Prohibited User Behavior */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                9. Prohibited User Behavior
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                Users must not use AawajManki to:
              </p>
              <ul style={{ fontSize: '14px', color: '#4A3E3D', margin: 0, paddingLeft: '22px', lineHeight: 1.7 }}>
                <li>Target or groom children for sexual purposes.</li>
                <li>Request or exchange sexual content involving minors.</li>
                <li>Upload or distribute CSAM.</li>
                <li>Encourage child exploitation or abuse.</li>
                <li>Facilitate trafficking or sexual exploitation of children.</li>
                <li>Threaten or blackmail a minor using sexual content.</li>
                <li>Encourage another person to engage in CSAE.</li>
                <li>Circumvent safety mechanisms to distribute prohibited content.</li>
                <li>Use the platform for any activity that endangers children.</li>
              </ul>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Violations may result in immediate account restriction, suspension, or termination and may be reported to appropriate authorities where required.
              </p>
            </div>

            {/* 10. Cooperation With Google Play */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                10. Cooperation With Google Play
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki is committed to complying with Google Play's Child Safety Standards policy applicable to social applications.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                We maintain publicly accessible standards, provide mechanisms for users to report concerns, take appropriate action regarding CSAM and CSAE, and maintain a designated child-safety point of contact.
              </p>
            </div>

            {/* 11. Contact Us */}
            <div style={{ backgroundColor: '#FFF8F2', border: '1.5px solid #F2B08D', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(99, 52, 79, 0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FCE9DD', border: '1px solid #F2B08D', display: 'grid', placeItems: 'center' }}>
                  <Mail size={22} color="#63344F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                    11. Contact Us
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#63344F', fontWeight: 600 }}>Dedicated Contact Information</span>
                </div>
              </div>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                For child-safety concerns, CSAE reports, CSAM reports, or questions regarding these standards:
              </p>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD5', borderRadius: '14px', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#63344F' }}>AawajManki Child Safety Contact</span>
                <span style={{ fontSize: '15px', color: '#17151A', fontWeight: 600 }}>
                  Email: <a href="mailto:asifattar003@gmail.com" style={{ color: '#63344F', textDecoration: 'underline' }}>asifattar003@gmail.com</a>
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#766D68', margin: 0 }}>
                Please use this contact specifically for child-safety and abuse-related concerns.
              </p>
            </div>

            {/* 12. Updates to These Standards */}
            <div style={{ backgroundColor: '#FFFDFC', border: '1.5px solid #E8DDD5', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 30px rgba(70,45,35,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#17151A', margin: 0 }}>
                12. Updates to These Standards
              </h2>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                AawajManki may update these Child Safety Standards from time to time to reflect changes in our services, safety practices, applicable laws, or platform requirements.
              </p>
              <p style={{ fontSize: '14.5px', color: '#332821', lineHeight: 1.6, margin: 0 }}>
                The latest version will always be made publicly available on this webpage.
              </p>
              <div style={{ borderTop: '1px solid #E8DDD5', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#766D68' }}>
                <span>Last Updated: August 27, 2026</span>
                <span>© 2026 AawajManki. All rights reserved.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
