import React, { useState } from 'react';
import { Shield, FileText, Lock, AlertTriangle, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Legal.css';

const Legal: React.FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState('disclaimer');

  const sections = [
    { id: 'disclaimer', label: t('legalPage.disclaimer'), icon: AlertTriangle },
    { id: 'dmca', label: t('legalPage.dmca'), icon: Shield },
    { id: 'terms', label: t('legalPage.terms'), icon: FileText },
    { id: 'privacy', label: t('legalPage.privacy'), icon: Lock },
  ];

  return (
    <div className="legal-page">
      <div className="legal-header">
        <Scale size={22} />
        <h1>{t('legalPage.title')}</h1>
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
            <h2>{t('legalPage.disclaimerTitle')}</h2>
            <p>{t('legalPage.disclaimerP1')}</p>
            <p>{t('legalPage.disclaimerP2')}</p>
            <p>{t('legalPage.disclaimerP3')}</p>
            <p>{t('legalPage.disclaimerP4')}</p>
          </div>
        )}

        {active === 'dmca' && (
          <div className="legal-section">
            <h2>{t('legalPage.dmcaTitle')}</h2>
            <p>{t('legalPage.dmcaP1')}</p>
            <h3>{t('legalPage.dmcaToFile')}</h3>
            <ul>
              <li>{t('legalPage.dmcaLi1')}</li>
              <li>{t('legalPage.dmcaLi2')}</li>
              <li>{t('legalPage.dmcaLi3')}</li>
              <li>{t('legalPage.dmcaLi4')}</li>
              <li>{t('legalPage.dmcaLi5')}</li>
              <li>{t('legalPage.dmcaLi6')}</li>
            </ul>
            <h3>{t('legalPage.dmcaCounter')}</h3>
            <p>{t('legalPage.dmcaCounterP')}</p>
          </div>
        )}

        {active === 'terms' && (
          <div className="legal-section">
            <h2>{t('legalPage.termsTitle')}</h2>
            <p>{t('legalPage.termsP1')}</p>
            <h3>{t('legalPage.termsH1')}</h3>
            <p>{t('legalPage.termsH1P')}</p>
            <h3>{t('legalPage.termsH2')}</h3>
            <p>{t('legalPage.termsH2P')}</p>
            <h3>{t('legalPage.termsH3')}</h3>
            <ul>
              <li>{t('legalPage.termsH3Li1')}</li>
              <li>{t('legalPage.termsH3Li2')}</li>
              <li>{t('legalPage.termsH3Li3')}</li>
              <li>{t('legalPage.termsH3Li4')}</li>
            </ul>
            <h3>{t('legalPage.termsH4')}</h3>
            <p>{t('legalPage.termsH4P')}</p>
            <h3>{t('legalPage.termsH5')}</h3>
            <p>{t('legalPage.termsH5P')}</p>
            <h3>{t('legalPage.termsH6')}</h3>
            <p>{t('legalPage.termsH6P')}</p>
          </div>
        )}

        {active === 'privacy' && (
          <div className="legal-section">
            <h2>{t('legalPage.privacyTitle')}</h2>
            <p>{t('legalPage.privacyP1')}</p>
            <h3>{t('legalPage.privacyH1')}</h3>
            <ul>
              <li>{t('legalPage.privacyH1Li1')}</li>
              <li>{t('legalPage.privacyH1Li2')}</li>
              <li>{t('legalPage.privacyH1Li3')}</li>
            </ul>
            <h3>{t('legalPage.privacyH2')}</h3>
            <ul>
              <li>{t('legalPage.privacyH2Li1')}</li>
              <li>{t('legalPage.privacyH2Li2')}</li>
              <li>{t('legalPage.privacyH2Li3')}</li>
            </ul>
            <h3>{t('legalPage.privacyH3')}</h3>
            <p>{t('legalPage.privacyH3P')}</p>
            <h3>{t('legalPage.privacyH4')}</h3>
            <p>{t('legalPage.privacyH4P')}</p>
            <ul>
              <li>{t('legalPage.privacyH4Li1')}</li>
              <li>{t('legalPage.privacyH4Li2')}</li>
              <li>{t('legalPage.privacyH4Li3')}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legal;
