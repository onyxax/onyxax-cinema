import React, { useMemo } from 'react';
import { Clock, Film, Heart, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHeroCarousel } from '../../hooks/useHeroCarousel';
import { THUMBNAIL_BASE_URL } from '../../services/tmdb';
import type { TMDBMovie, WatchProgress } from '../../types/tmdb';
import './MyListHero.css';

type HeroItem = Partial<TMDBMovie> &
  Partial<WatchProgress> & {
    type?: 'movie' | 'tv' | 'anime';
    media_type?: 'movie' | 'tv' | 'anime';
  };

interface Props {
  items: HeroItem[];
  counts: { all: number; movie: number; likes: number; continue: number };
  title: string;
  subtitle: string;
}

const getTitle = (it: HeroItem) => (it.title || it.name || '').trim();
const getPoster = (it: HeroItem) => it.poster_path || it.poster || null;
const getType = (it: HeroItem): 'movie' | 'tv' | 'anime' => it.type || it.media_type || 'movie';
const getProgress = (it: HeroItem) => {
  if (typeof it.watched !== 'number' || typeof it.duration !== 'number') return 0;
  if (it.duration <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((it.watched / it.duration) * 100)));
};

const MyListHero: React.FC<Props> = ({ items, counts, title, subtitle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const displayItems = useMemo(() => items.slice(0, 8), [items]);
  const { index, bind } = useHeroCarousel({
    length: displayItems.length,
    autoPlayMs: 5200,
    enabled: displayItems.length > 1,
  });

  const current = useMemo(() => {
    if (!displayItems.length) return null;
    return displayItems[index] ?? displayItems[0] ?? null;
  }, [displayItems, index]);

  const currentTitle = current ? getTitle(current) : '';
  const currentType = current ? getType(current) : 'movie';
  const currentPoster = current ? getPoster(current) : null;
  const currentProgress = current ? getProgress(current) : 0;
  const hasProgress = currentProgress > 1;

  if (!current) {
    return (
      <section className="mylist-hero mylist-hero--minimal mylist-hero--empty" aria-label={title}>
        <div className="hero-bg" aria-hidden>
          <img src="/AppIcon512.png" alt="" className="hero-watermark" />
        </div>
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-brand">
              <img src="/AppIcon64.png" alt="" width={28} height={28} className="hero-brand-icon" aria-hidden />
              <span className="hero-brand-name">ONYXAX <span>CINEMA</span></span>
              <span className="hero-brand-sep">•</span>
              <span className="hero-brand-count">{counts.all} titles</span>
            </div>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-sub">{subtitle}</p>
          </div>
        </div>
      </section>
    );
  }

  const handleResume = () => navigate(`/watch/${currentType}/${String(current.id)}`);

  return (
    <section
      className="mylist-hero mylist-hero--minimal"
      role="region"
      aria-label={t('myList.title')}
      aria-roledescription="carousel"
      tabIndex={0}
      {...bind}
    >
      <div className="hero-bg" aria-hidden>
        <img src="/AppIcon512.png" alt="" className="hero-watermark" />
      </div>

      <div className="hero-inner">
        {/* Left — static page identity */}
        <div className="hero-left">
          <div className="hero-brand">
            <img src="/AppIcon64.png" alt="" width={28} height={28} className="hero-brand-icon" aria-hidden />
            <span className="hero-brand-name">ONYXAX <span>CINEMA</span></span>
            <span className="hero-brand-sep">•</span>
            <span className="hero-brand-count">{counts.all} titles</span>
          </div>

          <h1 className="hero-title">{title}</h1>
          <p className="hero-sub">{subtitle}</p>

          <div className="hero-stats" aria-label="Library stats">
            <span className="stat stat--movie"><Film size={14} /> <strong>{counts.movie}</strong> Movies</span>
            <span className="stat-sep">•</span>
            <span className="stat stat--likes"><Heart size={14} /> <strong>{counts.likes}</strong> Likes</span>
            <span className="stat-sep">•</span>
            <span className="stat stat--continue"><Clock size={14} /> <strong>{counts.continue}</strong> Watching</span>
          </div>

          <button type="button" className="hero-cta" onClick={handleResume} aria-label={`${t('myList.resumePlayback')}: ${currentTitle}`}>
            <span className="cta-thumb">
              {currentPoster ? (
                <img key={`thumb-${String(current.id)}`} src={`${THUMBNAIL_BASE_URL}${currentPoster}`} alt="" className="cta-thumb-img cta-thumb-img--smooth" loading="eager" />
              ) : (
                <span className="cta-thumb-fallback"><img src="/AppIcon64.png" alt="" width={22} height={22} /></span>
              )}
            </span>
            <span className="cta-copy" key={`copy-${String(current.id)}`}>
              <span className="cta-label">{t('myList.resumePlayback')}</span>
              <span className="cta-title cta-title--smooth" title={currentTitle}>{currentTitle.length > 26 ? `${currentTitle.slice(0, 26)}…` : currentTitle}</span>
            </span>
            <span className="cta-play"><Play size={14} fill="white" /></span>
            {hasProgress && <span className="cta-progress" aria-hidden>{currentProgress}%</span>}
          </button>
        </div>

        {/* Right — single featured poster, no stack, no backdrop */}
        <div className="hero-right" aria-hidden>
          <div className="hero-poster">
            {currentPoster ? (
              <img key={String(current.id)} src={`${THUMBNAIL_BASE_URL}${currentPoster}`} alt="" className="hero-poster-img hero-poster-img--smooth" />
            ) : (
              <div key="fallback" className="hero-poster-fallback"><img src="/AppIcon180.png" alt="" width={56} height={56} /></div>
            )}
            <span className="hero-poster-type">{currentType}</span>
            {hasProgress && (
              <div className="hero-poster-progress">
                <div className="hero-poster-fill" style={{ width: `${currentProgress}%` }} />
              </div>
            )}
          </div>
          <div className="hero-poster-meta">
            <h3 className="hero-poster-title" title={currentTitle}>{currentTitle || '—'}</h3>
          </div>
        </div>
      </div>

      {/* dots removed as requested — no "you are in any image" indicator */}
    </section>
  );
};

export default MyListHero;
