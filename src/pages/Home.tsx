import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import BackToTop from '../components/BackToTop';
import { useTranslation } from 'react-i18next';
import useDiscordRPC from '../hooks/useDiscordRPC';
import {
  fetchTrending,
  fetchTrendingToday,
  fetchTopRated,
  fetchMovies,
  fetchTVShows,
  fetchAnime,
  fetchByNetwork,
  prefetchImage,
  IMAGE_BASE_URL,
  fetchImages,
  LOGO_BASE_URL
} from '../services/tmdb';
import { ChevronDown, Flame, Tv, Award, Sparkles, Film, Monitor, TrendingUp } from 'lucide-react';
import type { TMDBMovie } from '../types/tmdb';

const CACHE_KEY_PREFIX = 'onyxax_cache_';

const getInitialCache = (url: string, params: any = {}) => {
  try {
    const keyParams = JSON.stringify(params);
    const cacheKey = `${CACHE_KEY_PREFIX}${url}_${keyParams}`;
    const persistent = localStorage.getItem(cacheKey);
    if (persistent) {
      const { data } = JSON.parse(persistent);
      return data.results || data;
    }
  } catch { /* ignore */ }
  return [];
};

// Session-persistent cache to eliminate flicker during navigation
let homeSessionCache: any = null;

// Platform Section Configuration (Static)
const PLATFORMS = [
  { name: 'Netflix', color: '#E50914', id: 213 },
  { name: 'Prime Video', color: '#00A8E1', id: 1024 },
  { name: 'Max', color: '#0047FF', id: 49 },
  { name: 'Disney+', color: '#113CCF', id: 2739 },
  { name: 'Apple TV+', color: '#999999', id: 2552 },
  { name: 'Paramount+', color: '#0064FF', id: 4330 },
  { name: 'Hulu', color: '#1CE783', id: 453 },
];

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [trending, setTrending] = useState<TMDBMovie[]>(() => homeSessionCache?.trending || getInitialCache('/trending/all/week'));
  const [trendingToday, setTrendingToday] = useState<TMDBMovie[]>(() => homeSessionCache?.trendingToday || getInitialCache('/trending/all/day'));
  const [topRated, setTopRated] = useState<TMDBMovie[]>(() => homeSessionCache?.topRated || getInitialCache('/top_rated'));
  const [featuredMovies, setFeaturedMovies] = useState<TMDBMovie[]>(() => {
    if (homeSessionCache?.featuredMovies) return homeSessionCache.featuredMovies;
    const cachedFeatured = localStorage.getItem('onyxax_featured_with_logos');
    if (cachedFeatured) return JSON.parse(cachedFeatured);
    const t = getInitialCache('/trending/all/week');
    return Array.isArray(t) ? t.filter((m: any) => m.backdrop_path || m.poster_path).slice(0, 5) : [];
  });
  const [movies, setMovies] = useState<TMDBMovie[]>(() => homeSessionCache?.movies || getInitialCache('/discover/movie', {
    include_adult: false,
    page: 1,
    sort_by: "popularity.desc",
    without_keywords: "1228|158718|10244|190370|193026|155477|6111|10014"
  }));
  const [tvShows, setTvShows] = useState<TMDBMovie[]>(() => homeSessionCache?.tvShows || getInitialCache('/discover/tv', {
    include_adult: false,
    page: 1,
    sort_by: "popularity.desc",
    with_genres: undefined,
    without_genres: "16",
    without_keywords: "1228|158718|10244|190370|193026|155477|6111|10014"
  }));
  const [anime, setAnime] = useState<TMDBMovie[]>(() => homeSessionCache?.anime || getInitialCache('/discover/tv', {
    include_adult: false,
    page: 1,
    sort_by: "popularity.desc",
    with_genres: "16",
    with_keywords: "210024|287501",
    without_keywords: "1228|158718|10244|190370|193026|155477|6111|10014"
  }));

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0]);
  const [platformContent, setPlatformContent] = useState<TMDBMovie[]>([]);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isPlatformLoading, setIsPlatformLoading] = useState(true);
  const platformMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (platformMenuRef.current && !platformMenuRef.current.contains(event.target as Node)) {
        setIsPlatformMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingData, todayData, ratedData, moviesData, tvData, animeData, platformData] = await Promise.all([
          fetchTrending(),
          fetchTrendingToday(),
          fetchTopRated(),
          fetchMovies(undefined, 'popularity.desc', 60),
          fetchTVShows(undefined, 'popularity.desc', 60),
          fetchAnime(undefined, 'popularity.desc', 100),
          fetchByNetwork(activePlatform.id)
        ]);

        const filterSafe = (data: TMDBMovie[]) => data.filter(m => !m.adult);

        const filteredTrending = filterSafe(trendingData);
        const filteredToday = filterSafe(todayData);
        const filteredRated = filterSafe(ratedData);
        const filteredMovies = filterSafe(moviesData);
        const filteredTV = filterSafe(tvData);

        const withImages = filteredTrending.filter(m => m.backdrop_path || m.poster_path);

        const featuredWithLogos = await Promise.all(
          withImages.slice(0, 5).map(async (movie) => {
            const images = await fetchImages(movie.id, movie.media_type || 'movie');
            const uiLang = i18n.language?.split('-')[0] || 'en';
            const logo = images.logos?.find(l => l.iso_639_1 === uiLang) || 
                         images.logos?.find(l => l.iso_639_1 === 'en') || 
                         images.logos?.[0];
            return { ...movie, logo_path: logo?.file_path };
          })
        );

        setFeaturedMovies(featuredWithLogos);
        localStorage.setItem('onyxax_featured_with_logos', JSON.stringify(featuredWithLogos));
        setTrending(filteredTrending);
        setTrendingToday(filteredToday);
        setTopRated(filteredRated);
        setMovies(filteredMovies);
        setTvShows(filteredTV);
        setAnime(animeData.slice(0, 20));
        setPlatformContent(platformData);

        homeSessionCache = {
          trending: filteredTrending,
          trendingToday: filteredToday,
          topRated: filteredRated,
          movies: filteredMovies,
          tvShows: filteredTV,
          anime: animeData,
          featuredMovies: featuredWithLogos
        };

        const allItems = [...withImages, ...movies, ...tvShows, ...animeData].slice(0, 30);
        allItems.forEach(m => {
          if (m.backdrop_path) prefetchImage(`${IMAGE_BASE_URL}${m.backdrop_path}`);
          if (m.poster_path) prefetchImage(`${IMAGE_BASE_URL}${m.poster_path}`);
        });

        featuredWithLogos.forEach(m => {
          if (m.logo_path) prefetchImage(`${LOGO_BASE_URL}${m.logo_path}`);
        });
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    let cancelled = false;
    const uiLang = i18n.language?.split('-')[0] || 'en';
    Promise.all(
      featuredMovies.slice(0, 5).map(async (movie) => {
        const images = await fetchImages(movie.id, movie.media_type || 'movie');
        if (cancelled) return movie;
        const logo = images.logos?.find(l => l.iso_639_1 === uiLang)
          || images.logos?.find(l => l.iso_639_1 === 'en')
          || images.logos?.[0];
        return { ...movie, logo_path: logo?.file_path };
      })
    ).then((updated) => {
      if (cancelled) return;
      setFeaturedMovies(updated);
      localStorage.setItem('onyxax_featured_with_logos', JSON.stringify(updated));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [i18n.language]);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useDiscordRPC({ details: 'Exploring OnyxaxCinema', state: 'Browsing Home' }, []);

  const [prevPlatformId, setPrevPlatformId] = useState(activePlatform.id);
  if (prevPlatformId !== activePlatform.id) {
    setPrevPlatformId(activePlatform.id);
    setIsPlatformLoading(true);
  }

  useEffect(() => {
    const startTime = Date.now();
    fetchByNetwork(activePlatform.id).then((data) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 200 - elapsed);
      setTimeout(() => {
        setPlatformContent(data);
        setIsPlatformLoading(false);
      }, remaining);
    });
  }, [activePlatform]);

  if (isInitialLoading && trending.length === 0 && movies.length === 0) {
    return (
      <div className="home-page">
        <div className="skeleton-hero" />
        <div className="rows-container" style={{ padding: '40px 4%' }}>
          <div className="skeleton-section">
            <div className="skeleton-row-label" />
            <div className="skeleton-row-cards">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card-lg" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          </div>
          <div className="skeleton-section">
            <div className="skeleton-row-label" />
            <div className="skeleton-row-cards">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card-lg" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          </div>
        </div>
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Hero
        movies={featuredMovies}
        initialIndex={homeSessionCache?.heroIndex || 0}
        onIndexChange={(idx) => {
          if (!homeSessionCache) homeSessionCache = {};
          homeSessionCache.heroIndex = idx;
        }}
      />

      <div className="rows-container">
        <div className="home-categories">
          <button className="home-category-pill" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Flame size={12} /> {t('home.top10Today')}
          </button>
          <button className="home-category-pill" onClick={() => document.querySelector('.platform-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Monitor size={12} /> {t('home.onlyOn')}
          </button>
          <button className="home-category-pill" onClick={() => document.querySelector('[data-section="popular-tv"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Tv size={12} /> {t('home.popularTV')}
          </button>
          <button className="home-category-pill" onClick={() => document.querySelector('[data-section="anime"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Sparkles size={12} /> {t('home.anime')}
          </button>
          <button className="home-category-pill" onClick={() => document.querySelector('[data-section="top-rated"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Award size={12} /> {t('home.topRated')}
          </button>
          <button className="home-category-pill" onClick={() => document.querySelector('[data-section="action-movies"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Film size={12} /> {t('home.actionMovies')}
          </button>
        </div>

        <div className="home-section-panel">
          <div className="home-dash-grid">
            <div className="home-dash-grid-line" />
            <div className="home-dash-divider">
              <TrendingUp size={14} />
              <span>{t('home.top10Today')}</span>
            </div>
            <div className="home-dash-grid-line" />
          </div>
          <ContentRow
            title=""
            items={trendingToday.slice(0, 10)}
            type="movie"
            showRank={true}
            sectionId="top10"
          />
        </div>

        <div className="home-section-panel">
          <div className="home-dash-grid">
            <div className="home-dash-grid-line" />
            <div className="home-dash-divider">
              <Monitor size={14} />
              <span>{t('home.onlyOn')}</span>
            </div>
            <div className="home-dash-grid-line" />
          </div>
          <div className={`platform-section ${isPlatformMenuOpen ? 'menu-open' : ''}`}>
            <div className="platform-header">
              <span className="platform-label">{t('home.onlyOn')}</span>
              <div className="platform-selector-wrapper" ref={platformMenuRef}>
                <button
                  className="platform-selector-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlatformMenuOpen(prev => !prev);
                  }}
                >
                  <span style={{ color: activePlatform.color }}>{activePlatform.name}</span>
                  <ChevronDown size={20} className={isPlatformMenuOpen ? 'rotate' : ''} />
                </button>
                {isPlatformMenuOpen && (
                  <div className="platform-menu glass">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        className={`platform-menu-item ${activePlatform.id === p.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlatform(p);
                          setIsPlatformMenuOpen(false);
                        }}
                      >
                        <div className="platform-dot" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={`platform-content-wrapper ${isPlatformLoading ? 'is-loading' : ''}`}>
              <ContentRow title="" items={platformContent} type="tv" sectionId="platform" />
            </div>
          </div>
        </div>

        <div className="home-section-panel">
          <div className="home-dash-grid">
            <div className="home-dash-grid-line" />
            <div className="home-dash-divider">
              <Tv size={14} />
              <span>{t('home.popularTV')}</span>
            </div>
            <div className="home-dash-grid-line" />
          </div>
          <ContentRow title="" items={tvShows} type="tv" sectionId="popular-tv" />
          {anime.length > 0 && (
            <>
              <div className="home-dash-grid">
                <div className="home-dash-grid-line" />
                <div className="home-dash-divider">
                  <Sparkles size={14} />
                  <span>{t('home.anime')}</span>
                </div>
                <div className="home-dash-grid-line" />
              </div>
              <ContentRow title="" items={anime} type="anime" sectionId="anime" />
            </>
          )}
        </div>

        <div className="home-section-panel">
          <div className="home-dash-grid">
            <div className="home-dash-grid-line" />
            <div className="home-dash-divider">
              <Award size={14} />
              <span>{t('home.topRated')}</span>
            </div>
            <div className="home-dash-grid-line" />
          </div>
          <ContentRow title="" items={topRated} type="movie" sectionId="top-rated" />
          <div className="home-dash-grid">
            <div className="home-dash-grid-line" />
            <div className="home-dash-divider">
              <Film size={14} />
              <span>{t('home.actionMovies')}</span>
            </div>
            <div className="home-dash-grid-line" />
          </div>
          <ContentRow title="" items={movies} type="movie" sectionId="action-movies" />
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-mark">O</div>
            <span className="footer-brand-name">ONYXAX</span>
          </div>
          <p className="footer-disclaimer">
            <span className="brand-small">OnyxaxCinema</span>: This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
          </p>
          <div className="footer-links">
            <Link to="/legal" className="footer-legal-link">{t('common.legal')}</Link>
            <div className="footer-dots" />
            <span>&copy; 2026 OnyxaxCinema</span>
            <div className="footer-dots" />
            <span>High Quality Cinematic Experience</span>
            <div className="footer-dots" />
            <span>v1.2.7</span>
          </div>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
};

export default Home;
