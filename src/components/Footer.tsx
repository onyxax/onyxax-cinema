import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, Sparkles, Heart, Search, Shield, FileText, Scale, ExternalLink, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../lib/constants';
import './Footer.css';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-col footer-col--brand">
          <Link to="/" className="footer-brand">
            <img src="/AppIcon64.png" alt="" className="footer-logo" width={32} height={32} />
            <span className="footer-brand-name">ONYXAX <span>CINEMA</span></span>
            <span className="footer-version">v{APP_VERSION}</span>
          </Link>
          <p className="footer-desc">{t('footer.disclaimer')}</p>
          <div className="footer-meta">
            <span>© 2026 Onyxax</span>
            <span className="dot">•</span>
            <span>HD • 4K</span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading"><Search size={13} /> {t('footer.explore')}</h4>
          <nav className="footer-nav">
            <Link to="/movies" className="footer-link"><Film size={13} /> {t('dock.movies')}</Link>
            <Link to="/tv" className="footer-link"><Tv size={13} /> {t('dock.tvShows')}</Link>
            <Link to="/anime" className="footer-link"><Sparkles size={13} /> {t('dock.anime')}</Link>
            <Link to="/mylist" className="footer-link"><Heart size={13} /> {t('dock.myList')}</Link>
            <Link to="/search" className="footer-link"><Search size={13} /> {t('dock.searchMovies')}</Link>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading"><Shield size={13} /> {t('common.legal')}</h4>
          <nav className="footer-nav">
            <Link to="/legal" className="footer-link"><FileText size={13} /> {t('legalPage.terms')}</Link>
            <Link to="/legal" className="footer-link"><Shield size={13} /> {t('legalPage.privacy')}</Link>
            <Link to="/legal" className="footer-link"><Scale size={13} /> {t('legalPage.dmca')}</Link>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading"><ExternalLink size={13} /> {t('footer.connect')}</h4>
          <nav className="footer-nav">
            <a href="https://github.com/onyxax/onyxax-cinema" target="_blank" rel="noreferrer" className="footer-link"><ExternalLink size={13} /> {t('footer.github')}</a>
            <a href="https://github.com/onyxax/onyxax-cinema/issues" target="_blank" rel="noreferrer" className="footer-link"><Mail size={13} /> {t('footer.support')}</a>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 <strong>ONYXAX CINEMA</strong> — {t('footer.highQuality')}</span>
        <span className="footer-bottom-links">
          <Link to="/legal" className="footer-link--bottom">{t('legalPage.terms')}</Link>
          <span className="sep">·</span>
          <Link to="/legal" className="footer-link--bottom">{t('legalPage.privacy')}</Link>
          <span className="sep">·</span>
          <span>v{APP_VERSION}</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
