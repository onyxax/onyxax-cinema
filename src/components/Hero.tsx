import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LOGO_BASE_URL } from '../services/tmdb';
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

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const nextIndex = (currentIndex + 1) % movies.length;
    setCurrentIndex(nextIndex);
    onIndexChange?.(nextIndex);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, movies.length, currentIndex, onIndexChange]);

  useEffect(() => {
    const timer = setInterval(handleNext, 10000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  if (movies.length === 0) return <div className="hero-placeholder" />;

  const currentMovie = movies[currentIndex];

  const handlePlay = () => {
    navigate(`/watch/${currentMovie.media_type || 'movie'}/${currentMovie.id}`);
  };

  return (
    <div className="hero">
      <div
        className="hero-slides-container"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        {movies.map((movie, index) => (
          <div key={movie.id} className={`hero-slide ${index === currentIndex ? 'active' : ''}`}>
            <div className="hero-backdrop">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                alt={movie.title || movie.name}
                decoding="async"
                className={`hero-image ${loadedImages[movie.id] ? 'img-loaded' : ''}`}
                onLoad={() => handleImageLoad(movie.id)}
              />
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
            className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
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
