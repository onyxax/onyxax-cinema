/**
 * @deprecated — replaced by `src/components/media/QuickPreview.tsx`
 * Kept for backward compatibility only. New code should use QuickPreview (portal + trailer + unified actions).
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchDetails, IMAGE_BASE_URL } from '../services/tmdb';
import type { TMDBMovie, TMDBDetails } from '../types/tmdb';
import './QuickViewModal.css';

function getMyListStatus(id: string | number): boolean {
  try {
    const myList = JSON.parse(localStorage.getItem('onyxax_mylist') || '[]');
    return myList.some((m: Record<string, unknown>) => String(m.id) === String(id));
  } catch {
    return false;
  }
}

interface QuickViewModalProps {
  item: TMDBMovie;
  type: 'movie' | 'tv' | 'anime';
  rect: DOMRect;
  onClose: () => void;
  externalClosing?: boolean;
  onCancelClose?: () => void;
  onStartClose?: () => void;
}

const DOCK_WIDTH = 260;

const QuickViewModal: React.FC<QuickViewModalProps> = ({ item, type, rect, onClose, externalClosing, onCancelClose, onStartClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [details, setDetails] = useState<TMDBDetails | null>(null);
  const [isInMyList, setIsInMyList] = useState(() => getMyListStatus(item.id));
  const [isClosing, setIsClosing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasClosedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDetails(item.id, type).then(setDetails);
  }, [item.id, type]);

  useEffect(() => {
    if (externalClosing && !hasClosedRef.current) {
      hasClosedRef.current = true;
      setIsClosing(true);
      const t = setTimeout(() => onClose(), 200);
      return () => clearTimeout(t);
    }
  }, [externalClosing, onClose]);

  const startClose = () => {
    if (closeTimerRef.current || hasClosedRef.current) return;
    closeTimerRef.current = setTimeout(() => {
      if (hasClosedRef.current) return;
      hasClosedRef.current = true;
      setIsClosing(true);
      setTimeout(() => onClose(), 200);
    }, 300);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const toggleMyList = () => {
    const myList = JSON.parse(localStorage.getItem('onyxax_mylist') || '[]');
    if (isInMyList) {
      const newList = myList.filter((m: Record<string, unknown>) => String(m.id) !== String(item.id));
      localStorage.setItem('onyxax_mylist', JSON.stringify(newList));
    } else {
      const newList = [...myList, {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        type,
        vote_average: item.vote_average,
      }];
      localStorage.setItem('onyxax_mylist', JSON.stringify(newList));
    }
    setIsInMyList(!isInMyList);
    window.dispatchEvent(new Event('mylist_changed'));
  };

  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const genres = details?.genres?.slice(0, 3).map(g => g.name) || [];
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : '';

  const modalWidth = 420;
  const modalHeight = 380;
  const padding = 16;

  let left = rect.left + rect.width / 2 - modalWidth / 2;
  let top = rect.top - modalHeight - padding;

  if (top < 10) {
    top = rect.bottom + padding;
  }
  if (left < DOCK_WIDTH + 10) {
    left = DOCK_WIDTH + 10;
  }
  if (left + modalWidth > window.innerWidth - 10) {
    left = window.innerWidth - modalWidth - 10;
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${type}/${item.id}`);
    onClose();
  };

  const handleBackdrop = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  return (
    <>
      <div className={`quick-view-backdrop ${isClosing ? 'fade-out' : ''}`} onClick={handleBackdrop} />
      <div
        className={`quick-view-modal ${isClosing || externalClosing ? 'closing' : ''}`}
        style={{ left, top, width: modalWidth }}
        onMouseEnter={() => { cancelClose(); onCancelClose?.(); }}
        onMouseLeave={() => { startClose(); onStartClose?.(); }}
      >
        <button className="quick-view-close" onClick={handleBackdrop}>
          <X size={16} />
        </button>

        <div className="quick-view-backdrop-img">
          {item.backdrop_path ? (
            <>
              {!imgLoaded && <div className="quick-view-img-skeleton skeleton" />}
              <img
                src={`${IMAGE_BASE_URL}${item.backdrop_path}`}
                alt=""
                className={`quick-view-backdrop-img-el ${imgLoaded ? 'loaded' : ''}`}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div className="quick-view-no-img" />
          )}
          <div className="quick-view-gradient" />
        </div>

        <div className="quick-view-body">
          <h3 className="quick-view-title">{item.title || item.name}</h3>

          <div className="quick-view-meta">
            {item.vote_average > 0 && (
              <span className="quick-view-match">
                <Star size={12} fill="currentColor" /> {Math.min(99, Math.round(item.vote_average * 10))}% {t('content.match')}
              </span>
            )}
            {year && <span className="quick-view-year">{year}</span>}
            {runtime && <span className="quick-view-runtime">{runtime}</span>}
            {item.vote_average > 0 && (
              <span className="quick-view-rating">{item.vote_average.toFixed(1)}</span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="quick-view-genres">
              {genres.map(g => <span key={g} className="quick-view-genre-tag">{g}</span>)}
            </div>
          )}

          <p className="quick-view-overview">
            {item.overview?.slice(0, 120)}
            {(item.overview?.length || 0) > 120 ? '...' : ''}
          </p>

          <div className="quick-view-actions">
            <button className="quick-view-play-btn" onClick={handlePlay}>
              <Play size={18} fill="currentColor" />
              <span>{t('hero.play')}</span>
            </button>
            <button
              className={`quick-view-list-btn ${isInMyList ? 'in-list' : ''}`}
              onClick={toggleMyList}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
