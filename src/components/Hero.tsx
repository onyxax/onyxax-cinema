import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LOGO_BASE_URL, IMAGE_BASE_URL } from '../services/tmdb';
import LogoImage from './LogoImage';
import './Hero.css';

interface HeroProps {
  movies: any[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

const Hero: React.FC<HeroProps> = ({ movies, initialIndex = 0, onIndexChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [backdropErrors, setBackdropErrors] = useState<Record<number, number>>({});
  const imageTimers = useRef<Map<string, number>>(new Map());

  const safeIndex = currentIndex % movies.length;
  if (currentIndex !== safeIndex) setCurrentIndex(safeIndex);

  const handleNext = useCallback(() => {
    if (isAnimating || movies.length === 0) return;
    setIsAnimating(true);
    const nextIndex = (safeIndex + 1) % movies.length;
    setCurrentIndex(nextIndex);
    onIndexChange?.(nextIndex);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, movies.length, safeIndex, onIndexChange]);

  useEffect(() => {
    const timer = setInterval(handleNext, 10000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleImageLoad = (id: number, level: number) => {
    const key = `${id}-${level}`;
    const timer = imageTimers.current.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      imageTimers.current.delete(key);
    }
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const backdropSource = (movie: any): { src: string; alt: string } | null => {
    const level = backdropErrors[movie.id] || 0;
    const backdrop = movie.backdrop_path || movie.poster_path;
    if (level === 0 && backdrop) {
      return { src: `${IMAGE_BASE_URL}${backdrop}`, alt: movie.title || movie.name };
    }
    if (level === 1 && movie.poster_path && movie.poster_path !== movie.backdrop_path) {
      return { src: `${IMAGE_BASE_URL}${movie.poster_path}`, alt: movie.title || movie.name };
    }
    return null;
  };

  useEffect(() => {
    movies.forEach(movie => {
      if (!movie?.id || loadedImages[movie.id]) return;
      const level = backdropErrors[movie.id] || 0;
      const backdrop = movie.backdrop_path || movie.poster_path;
      const hasSource = (level === 0 && backdrop)
        || (level === 1 && movie.poster_path && movie.poster_path !== movie.backdrop_path);
      if (!hasSource) return;
      const key = `${movie.id}-${level}`;
      if (imageTimers.current.has(key)) return;
      const timer = window.setTimeout(() => {
        setBackdropErrors(prev => ({ ...prev, [movie.id]: (prev[movie.id] || 0) + 1 }));
      }, 8000);
      imageTimers.current.set(key, timer);
    });
  }, [movies, loadedImages, backdropErrors]);

  useEffect(() => () => {
    imageTimers.current.forEach(timer => clearTimeout(timer));
    imageTimers.current.clear();
  }, []);

  if (movies.length === 0) return <div className="hero-placeholder" />;

  const currentMovie = movies[safeIndex];

  const handlePlay = () => {
    navigate(`/watch/${currentMovie.media_type || 'movie'}/${currentMovie.id}`);
  };

  return (
    <div className="hero">
      <div
        className="hero-slides-container"
        style={{
          transform: `translateX(-${safeIndex * 100}%)`,
          transition: 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        {movies.map((movie, index) => (
          <div key={movie.id} className={`hero-slide ${index === safeIndex ? 'active' : ''}`}>
            <div className="hero-backdrop">
              {backdropSource(movie) ? (
                <img
                  key={`${movie.id}-${backdropErrors[movie.id] || 0}`}
                  src={backdropSource(movie)!.src}
                  alt={backdropSource(movie)!.alt}
                  decoding="async"
                  className={`hero-image ${loadedImages[movie.id] ? 'img-loaded' : ''}`}
                  onLoad={() => handleImageLoad(movie.id, backdropErrors[movie.id] || 0)}
                  onError={() => setBackdropErrors(prev => ({ ...prev, [movie.id]: (prev[movie.id] || 0) + 1 }))}
                />
              ) : (
                <div className="hero-backdrop-fallback" />
              )}
              <div className="hero-gradient" />
            </div>

            <div className="hero-content">
              <div className="hero-text">
                {movie.logo_path ? (
                  <LogoImage
                    src={`${LOGO_BASE_URL}${movie.logo_path}`}
                    alt={movie.title || movie.name}
                    className="hero-logo"
                    fallback={<h1 className="hero-title">{movie.title || movie.name}</h1>}
                  />
                ) : (
                  <h1 className="hero-title">{movie.title || movie.name}</h1>
                )}
                <div className="hero-info">
                  <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || ''}</span>
                  <span className="hero-dot" />
                  <span>{(movie as any).media_type === 'tv' ? t('hero.series') : t('hero.film')}</span>
                </div>
                <p className="hero-overview">{movie.overview}</p>
              </div>
              <button className="hero-btn" onClick={handlePlay}>
                <Play fill="currentColor" size={18} />
                <span>{t('hero.play')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-dots">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === safeIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentIndex(index);
              onIndexChange?.(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
