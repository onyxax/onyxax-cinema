import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, Mail, Scale } from 'lucide-react';
import './Legal.css';

const sections = [
  { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
  { id: 'dmca', label: 'DMCA', icon: Shield },
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const Legal: React.FC = () => {
  const [active, setActive] = useState('disclaimer');

  return (
    <div className="legal-page">
      <div className="legal-header">
        <Scale size={22} />
        <h1>Legal</h1>
      </div>

      <div className="legal-tabs">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              className={`legal-tab ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              <Icon size={14} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="legal-content">
        {active === 'disclaimer' && (
          <div className="legal-section">
            <h2>Disclaimer</h2>
            <p>
              Onyxax Cinema does not host, store, or distribute any copyrighted content on its servers.
              All video content displayed within this application is embedded from third-party services
              that are publicly available on the internet. We do not control, verify, or endorse the
              content provided by these third-party services.
            </p>
            <p>
              The application functions solely as a user interface that organizes and displays links to
              content hosted by external platforms. We do not upload, download, or transmit any
              copyrighted material. All content is publicly accessible via third-party sources.
            </p>
            <p>
              Users are responsible for ensuring that their use of this application and any linked
              content complies with applicable laws in their jurisdiction. Onyxax Cinema strongly
              encourages users to support content creators by accessing content through official
              and authorized channels.
            </p>
            <p>
              This application does not promote piracy. Any references to copyrighted material are
              for informational and organizational purposes only. If you believe your copyrighted
              work has been made accessible in a way that constitutes copyright infringement,
              please contact us through the DMCA notice procedure below.
            </p>
          </div>
        )}

        {active === 'dmca' && (
          <div className="legal-section">
            <h2>DMCA Notice & Takedown Policy</h2>
            <p>
              Onyxax Cinema respects the intellectual property rights of others. We do not host
              any copyrighted content on our servers. However, if you believe that any content
              accessible through our application infringes your copyright, you may submit a
              notification pursuant to the Digital Millennium Copyright Act (DMCA).
            </p>

            <h3>To file a DMCA notice, please include:</h3>
            <ul>
              <li>Identification of the copyrighted work you claim has been infringed</li>
              <li>Identification of the material that is claimed to be infringing, including enough detail for us to locate it</li>
              <li>Your contact information (address, telephone number, and email address)</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
              <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ul>

            <h3>Submit DMCA notices to:</h3>
            <p>
              Email: <a href="mailto:dmca@onyxaxcinema.app">dmca@onyxaxcinema.app</a><br />
              We will respond to all valid DMCA notices within 48 hours.
            </p>

            <h3>Counter-Notification</h3>
            <p>
              If you believe that material you posted was removed or disabled by mistake or
              misidentification, you may submit a counter-notification. Please include your
              contact information, identification of the removed material, and a statement
              under penalty of perjury that you consent to jurisdiction of the federal court
              in your district.
            </p>
          </div>
        )}

        {active === 'terms' && (
          <div className="legal-section">
            <h2>Terms of Service</h2>
            <p>
              By using Onyxax Cinema, you agree to the following terms and conditions.
            </p>

            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using the application, you agree to be bound by these Terms of
              Service. If you do not agree, do not use the application.
            </p>

            <h3>2. Description of Service</h3>
            <p>
              Onyxax Cinema provides a user interface that organizes and displays links to
              publicly available content from third-party sources. We do not host, store,
              or distribute any media files.
            </p>

            <h3>3. User Responsibilities</h3>
            <ul>
              <li>You must comply with all applicable laws in your jurisdiction</li>
              <li>You must not use the service for any illegal purpose</li>
              <li>You must not attempt to circumvent any security measures</li>
              <li>You are responsible for your own internet usage</li>
            </ul>

            <h3>4. Intellectual Property</h3>
            <p>
              All trademarks, service marks, and logos displayed in the application are the
              property of their respective owners. Content metadata is provided by TMDB
              (The Movie Database) and is used in accordance with their terms.
            </p>

            <h3>5. Limitation of Liability</h3>
            <p>
              Onyxax Cinema is provided "as is" without any warranty. We are not liable for
              any damages arising from the use of this application or any linked content.
              We do not guarantee the availability, accuracy, or legality of third-party content.
            </p>

            <h3>6. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              application after changes constitutes acceptance of the new terms.
            </p>
          </div>
        )}

        {active === 'privacy' && (
          <div className="legal-section">
            <h2>Privacy Policy</h2>
            <p>
              This Privacy Policy explains how Onyxax Cinema collects, uses, and protects
              your information.
            </p>

            <h3>Information We Collect</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address and display name if you sign up via Supabase authentication</li>
              <li><strong>Watch Progress:</strong> Locally stored data about your viewing progress (never sent to our servers)</li>
              <li><strong>Preferences:</strong> Language, theme, and other settings stored locally on your device</li>
            </ul>

            <h3>How We Use Your Information</h3>
            <ul>
              <li>To provide and maintain the application functionality</li>
              <li>To personalize your experience (language, preferences)</li>
              <li>To authenticate your account via Supabase</li>
            </ul>

            <h3>Data Storage</h3>
            <p>
              Most of your data (watch progress, preferences, my list) is stored locally on
              your device using browser localStorage. This data is never transmitted to our
              servers. Account information is handled by Supabase, a third-party authentication
              provider, in accordance with their privacy policy.
            </p>

            <h3>Third-Party Services</h3>
            <p>
              This application integrates with:
            </p>
            <ul>
              <li><strong>TMDB (The Movie Database):</strong> Provides movie/TV metadata. See <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer">TMDB Privacy Policy</a></li>
              <li><strong>Supabase:</strong> Provides authentication services. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
              <li><strong>VIDEASY:</strong> Third-party video streaming service. We have no control over their data collection practices</li>
            </ul>

            <h3>Contact</h3>
            <p>
              For privacy-related inquiries, contact us at <a href="mailto:privacy@onyxaxcinema.app">privacy@onyxaxcinema.app</a>.
            </p>
          </div>
        )}

        {active === 'contact' && (
          <div className="legal-section">
            <h2>Contact Us</h2>
            <p>
              For any inquiries, including DMCA notices, legal questions, or general support,
              please reach out to us via email.
            </p>

            <div className="legal-contact-list">
              <div className="legal-contact-item">
                <Mail size={16} />
                <div>
                  <strong>General Inquiries</strong>
                  <a href="mailto:contact@onyxaxcinema.app">contact@onyxaxcinema.app</a>
                </div>
              </div>
              <div className="legal-contact-item">
                <Shield size={16} />
                <div>
                  <strong>DMCA / Copyright</strong>
                  <a href="mailto:dmca@onyxaxcinema.app">dmca@onyxaxcinema.app</a>
                </div>
              </div>
              <div className="legal-contact-item">
                <Lock size={16} />
                <div>
                  <strong>Privacy</strong>
                  <a href="mailto:privacy@onyxaxcinema.app">privacy@onyxaxcinema.app</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legal;
