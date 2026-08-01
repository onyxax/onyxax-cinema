import React from 'react';
import { useNavigate } from 'react-router-dom';
import { THUMBNAIL_BASE_URL } from '../services/tmdb';
import { Play, Plus, ChevronDown, X } from 'lucide-react';
import { fetchDetails } from '../services/tmdb';
import type { TMDBMovie, WatchProgress } from '../types/tmdb';
import { useTranslation } from 'react-i18next';
import './MovieCard.css';

interface MovieCardProps {
  item: Partial<TMDBMovie> | WatchProgress;
  type: 'movie' | 'tv' | 'anime';
  isWide?: boolean;
  progress?: { watched: number; duration: number };
  rank?: number;
  isContinueWatching?: boolean;
  index?: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, type, isWide, progress: propProgress, rank, isContinueWatching, index = 0 }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Smartly detect content type
  const contentType = (item as TMDBMovie).media_type || (item as WatchProgress).type || type;

  // Get progress from localStorage if not provided via props
  const getProgress = () => {
    if (propProgress) return propProgress;
    
    // Check if the item itself has progress (if it's a WatchProgress object)
    if ((item as WatchProgress).watched !== undefined) {
      return { 
        watched: (item as WatchProgress).watched, 
        duration: (item as WatchProgress).duration || 3600 
      };
    }

    // Fallback: check localStorage
    const allProgress = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
    const saved = allProgress[item.id!];
    if (saved && saved.watched) {
      return { watched: saved.watched, duration: saved.duration || 3600 };
    }
    
    return null;
  };

  const progress = getProgress();
  const progressPercent = progress ? (progress.watched / progress.duration) * 100 : 0;
  const remainingTime = progress ? Math.ceil((progress.duration - progress.watched) / 60) : 0;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${contentType}/${item.id}`);
  };

  const handlePrefetch = () => {
    if (item.id) {
      fetchDetails(String(item.id), contentType).catch(() => {});
    }
  };

  const handleRemoveProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!item.id) return;
    const allProgress = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
    delete allProgress[item.id];
    localStorage.setItem('onyxax_progress', JSON.stringify(allProgress));
    window.dispatchEvent(new Event('progress_changed'));
  };

  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    window.addEventListener('progress_changed', handler);
    return () => window.removeEventListener('progress_changed', handler);
  }, []);
  
  const imagePath = isWide 
    ? (item.backdrop_path || item.backdrop || item.poster_path) 
    : (item.poster_path || item.poster);
  
  const title = item.title || item.name;
  const overview = item.overview;
  const voteAverage = item.vote_average;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const getRating = () => {
    const ratings = ['G', 'PG', 'PG-13', 'G', 'PG'];
    const index = (Number(item.id) || 0) % ratings.length;
    return ratings[index];
  };


  return (
    <div 
      className={`movie-card ${isWide ? 'wide' : ''}`} 
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/details/${contentType}/${item.id}`)}
      onMouseEnter={handlePrefetch}
    >
      <div className={`card-image-container ${imageLoaded ? 'loaded' : ''}`}>
        {rank && (
          <div className="rank-badge">
            <span className="rank-top">{t('movieCard.top')}</span>
            <span className="rank-num">{rank.toString().padStart(2, '0')}</span>
          </div>
        )}
        {isContinueWatching && (
          <button className="remove-progress-btn" onClick={handleRemoveProgress} title={t('details.removeFromList')}>
            <X size={16} />
          </button>
        )}
        {imagePath ? (
          <img 
            src={`${THUMBNAIL_BASE_URL}${imagePath}`} 
            alt={title} 
            className={`card-image img-smooth ${imageLoaded ? 'img-loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=' + encodeURIComponent(title || '');
            }}
          />
        ) : (
          <div className="card-placeholder">
            <span className="placeholder-title">{title}</span>
          </div>
        )}
        {isWide && (
          <>
            <div className="card-top-gradient" />
            <div className="card-title-overlay">{title}</div>
          </>
        )}

        {progress && progressPercent > 1 && (
          isWide ? (
            <div className="card-bottom-bar">
              <div className="card-bottom-progress">
                <div className="card-bottom-progress-fill" style={{ width: `${Math.min(100, progressPercent)}%` }} />
              </div>
              <span className="card-bottom-time">{remainingTime}{t('details.min')}</span>
            </div>
          ) : (
            <div className="card-progress-container">
              <div className="card-progress-bar" style={{ width: `${Math.min(100, progressPercent)}%` }} />
            </div>
          )
        )}
      </div>
      
      <div className="card-hover-info">
        <div className="card-hover-title">{title}</div>
        <div className="card-controls">
          <div className="card-controls-left">
            <button className="icon-btn play-icon" onClick={handlePlay}>
              <Play fill="currentColor" size={16} />
            </button>
            <button className="icon-btn">
              <Plus size={16} />
            </button>
          </div>
          <button className="icon-btn">
            <ChevronDown size={16} />
          </button>
        </div>
        
        <div className="card-meta">
          {voteAverage && voteAverage > 0 ? (
            <span className="match-score">{Math.min(99, Math.round(voteAverage * 10))}% {t('content.match')}</span>
          ) : null}
          {remainingTime > 0 && progressPercent > 1 && (
             <span className="remaining-tag">{remainingTime}{t('details.min')}</span>
          )}
          <span className="content-rating">{getRating()}</span>
          <span className="release-year">{year}</span>
        </div>
        
        <div className="card-genres">
          <span>{type === 'movie' ? t('dock.movies') : type === 'anime' ? t('dock.anime') : t('dock.tvShows')}</span>
        </div>
        {overview && <div className="card-overview">{overview}</div>}
      </div>
    </div>
  );
};

export default MovieCard;
