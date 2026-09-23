import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader, Globe, Check, Eye, EyeOff, KeyRound, Film, Tv, PlayCircle, Crown, TrendingUp } from 'lucide-react';
import { signIn, signUp, supabase } from '../services/supabase';
import { fetchTrendingToday } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Auth: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    avatarUrl: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [trending, setTrending] = useState<{ id: number; title: string; poster: string; type: 'movie' | 'tv' }[]>([]);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [backdrops, setBackdrops] = useState<string[]>([]);
  const backdrop = backdrops.length > 0 ? backdrops[bgIndex] : null;
  const langRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    fetchTrendingToday('movie').then((movies) => {
      if (cancelled) return;
      const safe = movies.filter(m => m.backdrop_path && m.poster_path).slice(0, 5);
      if (safe.length > 0) {
        const bgs = safe.map(m => `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`);
        setBackdrops(bgs);
        setTrending(safe.map(m => ({
          id: m.id,
          title: m.title || m.name || '',
          poster: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
          type: 'movie'
        })));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backdrops.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backdrops]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const passwordsMatch = confirmPassword === '' || confirmPassword === formData.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!emailValid) {
        setError(t('auth.invalidEmail'));
        return;
      }
      if (passwordStrength < 2) {
        setError(t('auth.weakPassword'));
        return;
      }
      if (confirmPassword !== formData.password) {
        setError(t('auth.passwordsDontMatch'));
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await signUp(
          formData.email.trim(),
          formData.password.trim(),
          formData.displayName.trim() || formData.email.split('@')[0],
          formData.avatarUrl.trim()
        );
        if (signUpError) throw signUpError;

        const { error: signInError } = await signIn(formData.email.trim(), formData.password.trim());
        if (!signInError) {
          navigate('/', { replace: true });
        } else {
          setError(t('auth.accountCreated'));
          switchMode('signin');
        }
      } else {
        const { error: signInError } = await signIn(formData.email.trim(), formData.password.trim());
        if (signInError) throw signInError;
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError(t('auth.invalidCredentials'));
      } else if (msg.includes('Email not confirmed')) {
        setError(t('auth.emailNotConfirmed'));
      } else if (msg.includes('already registered')) {
        setError(t('auth.emailExists'));
      } else if (msg.includes('rate limit')) {
        setError(t('auth.tooManyAttempts'));
      } else {
        setError(t('auth.authFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailValid) {
      setError(t('auth.enterEmailFirst'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim());
      if (error) throw error;
      setResetSent(true);
    } catch {
      setError(t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setResetSent(false);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' }
  ];

  const handleLanguageChange = (code: string) => {
    if (code === i18n.language) {
      setIsLangMenuOpen(false);
      return;
    }
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };

  const features = [
    { icon: Film, text: t('auth.featureMovies') },
    { icon: Tv, text: t('auth.featureShows') },
    { icon: PlayCircle, text: t('auth.featureAnime') },
    { icon: Crown, text: t('auth.featureFree') }
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        {backdrops.length > 1 ? (
          <div className="bg-slideshow">
            {backdrops.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`bg-slide ${i === bgIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        ) : (
          backdrop && (
            <div className={`bg-image-wrap ${backdropLoaded ? 'loaded' : ''}`}>
              <img
                src={backdrop}
                alt=""
                onLoad={() => setBackdropLoaded(true)}
                onError={() => setBackdropLoaded(false)}
              />
            </div>
          )
        )}
        <div className="bg-overlay" />
        <div className="bg-gradient-side" />
      </div>

      <div className="auth-lang-switcher" ref={langRef}>
        <button
          className={`lang-trigger ${isLangMenuOpen ? 'active' : ''}`}
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          aria-label={t('profile.language')}
        >
          <Globe size={15} />
          <span>{languages.find(l => l.code === i18n.language)?.label || t('profile.language')}</span>
        </button>

        {isLangMenuOpen && (
          <div className="lang-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                {lang.label}
                {i18n.language === lang.code && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="auth-visual-side">
        <div className="visual-content">
          <div className="brand-badge">ONYXAX CINEMA</div>
          <h1>{t('auth.experienceCinema')}</h1>
          <div className="feature-list">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <f.icon size={15} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {trending.length > 0 && (
            <div className="auth-trending">
              <div className="trending-label">
                <TrendingUp size={14} />
                <span>{t('auth.trendingNow')}</span>
              </div>
              <div className="trending-row">
                {trending.map((m, i) => (
                  <div key={m.id} className="trending-poster" style={{ animationDelay: `${i * 0.08}s` }}>
                    <img src={m.poster} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card-minimal">
          <div key={mode} className="card-swap">
          <div className="auth-header">
            <h2>{mode === 'signup' ? t('auth.signUp') : t('auth.welcomeBack')}</h2>
            <p>
              {mode === 'signup'
                ? t('auth.joinCommunity')
                : t('auth.accessUniverse')}
            </p>
          </div>

          {resetSent && (
            <div className="auth-success-box">{t('auth.resetSent')}</div>
          )}

          <form onSubmit={handleSubmit} className="minimal-form" noValidate>
            {error && <div className="auth-error-box">{error}</div>}

            {mode === 'signup' && (
              <div className="minimal-input-group">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  placeholder={t('auth.displayName')}
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  autoComplete="name"
                />
              </div>
            )}

            <div className={`minimal-input-group ${emailValid ? 'valid' : ''}`}>
              <Mail size={17} className="input-icon" />
              <input
                type="email"
                placeholder={t('auth.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
              {emailValid && <Check size={15} className="input-valid-check" />}
            </div>

            <div className="minimal-input-group">
              <Lock size={17} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={t('auth.togglePassword')}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {mode === 'signup' && (
              <>
                <div className="minimal-input-group">
                  <KeyRound size={17} className="input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t('auth.confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                    aria-label={t('auth.toggleConfirmPassword')}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <div className="field-hint error">{t('auth.passwordsDontMatch')}</div>
                )}

                {formData.password && (
                  <div className="password-meter">
                    <div className="meter-bars">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`meter-bar ${i <= passwordStrength ? `level-${passwordStrength}` : ''}`}
                        />
                      ))}
                    </div>
                    <span className="meter-label">
                      {passwordStrength <= 1
                        ? t('auth.strengthWeak')
                        : passwordStrength === 2
                          ? t('auth.strengthFair')
                          : passwordStrength === 3
                            ? t('auth.strengthGood')
                            : t('auth.strengthStrong')}
                    </span>
                  </div>
                )}
              </>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
              >
                {t('auth.forgotPassword')}
              </button>
            )}

            <button type="submit" className="primary-auth-btn" disabled={loading}>
              {loading ? (
                <Loader className="spinner" size={18} />
              ) : (
                <>
                  <span>{mode === 'signup' ? t('auth.signUp') : t('auth.signIn')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>{t('auth.or')}</span>
          </div>

          <div className="auth-footer">
            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? t('auth.noAccount') : t('auth.alreadyMember')}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
