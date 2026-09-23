import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Pin, PinOff, Star, Clock, Film, Tv, Sparkles, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TMDBMovie } from '../../types/tmdb';
import { usePreviewData, LOGO_BASE_URL } from '../../hooks/usePreviewData';
import { IMAGE_BASE_URL } from '../../lib/tmdb/client';
import { getMyList, setMyList, getLikes, setLikes, getPinned, setPinned, getProgressMap, getSidebarCollapsed } from '../../lib/storage';
import { DOCK_WIDTH, DOCK_WIDTH_COLLAPSED, DOCK_MARGIN } from '../../lib/constants';
import './QuickPreview.css';

interface QuickPreviewProps {
  item: TMDBMovie;
  type: 'movie' | 'tv' | 'anime';
  anchorRect: DOMRect;
  onClose: () => void;
  onKeepAlive?: () => void;
}

const PREVIEW_W = 360;
const PREVIEW_H = 430;

export const QuickPreview: React.FC<QuickPreviewProps> = ({ item, type, anchorRect, onClose, onKeepAlive }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { details, logoPath } = usePreviewData(item.id, type, true);
  const [isClosing, setIsClosing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClosed = useRef(false);

  // derived
  const title = item.title || item.name || '';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const match = item.vote_average ? Math.min(99, Math.round(item.vote_average * 10)) : 0;
  const progressMap = useMemo(() => getProgressMap(), []);
  const progress = progressMap[String(item.id)];
  const progressPct = progress ? Math.min(100, (progress.watched / (progress.duration || 3600)) * 100) : 0;
  const hasProgress = progressPct > 2;

  const isInMyList = useMemo(() => getMyList().some((m: any) => String(m.id) === String(item.id)), [item.id]);
  const isLiked = useMemo(() => getLikes().some((m: any) => String(m.id) === String(item.id)), [item.id]);
  const isPinned = useMemo(() => getPinned().some((p: any) => String(p.id) === String(item.id)), [item.id]);

  const [localInList, setLocalInList] = useState(isInMyList);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localPinned, setLocalPinned] = useState(isPinned);

  // positioning — overlap card by 28px to create seamless hover bridge (no gap flicker)
  const { style, pos } = useMemo(() => {
    let left = anchorRect.left + anchorRect.width / 2 - PREVIEW_W / 2;
    let top = anchorRect.top - PREVIEW_H + 28;
    let p: 'above' | 'below' = 'above';
    if (top < 44) {
      top = anchorRect.bottom - 28;
      p = 'below';
    }
    const isCollapsed = getSidebarCollapsed();
    const dockW = isCollapsed ? DOCK_WIDTH_COLLAPSED : DOCK_WIDTH;
    const minLeft = dockW + DOCK_MARGIN + 12;
    const maxLeft = window.innerWidth - PREVIEW_W - 12;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    if (top + PREVIEW_H > window.innerHeight - 12) {
      top = Math.max(44, window.innerHeight - PREVIEW_H - 12);
      p = top < anchorRect.top ? 'above' : 'below';
    }
    return { style: { left, top, width: PREVIEW_W } as const, pos: p };
  }, [anchorRect]);

  // outside click to close (replaces backdrop)
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // if click is inside the preview, ignore
      if (target.closest('.quick-preview')) return;
      // if click is on the anchor card, ignore (card handles its own)
      if (anchorRect) {
        const { left, top, right, bottom } = anchorRect;
        if (e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom) return;
      }
      triggerClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [anchorRect]);

  const triggerClose = () => {
    if (hasClosed.current) return;
    hasClosed.current = true;
    setIsClosing(true);
    setTimeout(() => onClose(), 170);
  };

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    onKeepAlive?.();
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => triggerClose(), 280);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${type}/${item.id}`);
    triggerClose();
  };
  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/details/${type}/${item.id}`);
    triggerClose();
  };
  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    const list = getMyList();
    const exists = list.some((m: any) => String(m.id) === String(item.id));
    const next = exists ? list.filter((m: any) => String(m.id) !== String(item.id)) : [...list, { id: item.id, title, poster_path: item.poster_path, backdrop_path: item.backdrop_path, vote_average: item.vote_average, release_date: item.release_date || item.first_air_date, type }];
    setMyList(next);
    setLocalInList(!exists);
  };
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cur = getLikes();
    const exists = cur.some((m: any) => String(m.id) === String(item.id));
    const next = exists ? cur.filter((m: any) => String(m.id) !== String(item.id)) : [...cur, { id: item.id, title, poster_path: item.poster_path, type }];
    setLikes(next);
    setLocalLiked(!exists);
  };
  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cur = getPinned();
    const exists = cur.some((p: any) => String(p.id) === String(item.id));
    if (!exists && cur.length >= 15) return; // silent limit — Details will show toast
    const next = exists ? cur.filter((p: any) => String(p.id) !== String(item.id)) : [...cur, { id: item.id, title, poster_path: item.poster_path, backdrop_path: item.backdrop_path, vote_average: item.vote_average, release_date: item.release_date || item.first_air_date, type, logo_path: logoPath }];
    setPinned(next);
    setLocalPinned(!exists);
  };

  const genres = details?.genres?.slice(0, 3) || [];
  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : (details?.number_of_seasons ? `${details.number_of_seasons} ${t('details.seasons')}` : '');
  const seasonsLabel = details?.number_of_seasons ? `${details.number_of_seasons} ${details.number_of_seasons === 1 ? t('details.season') : t('details.seasons')}` : '';

  const backdrop = item.backdrop_path || item.poster_path;
  const contentRating = type === 'movie'
    ? details?.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification
    : details?.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating;

  return createPortal(
    <div
      className={`quick-preview ${isClosing ? 'closing' : ''}`}
      style={style}
      data-pos={pos}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      role="dialog"
      aria-label={title}
    >
        {/* Media — صورة الخلفية فقط (بدون فيديو لتخفيف الحمل) */}
        <div className="qp-media">
          {backdrop ? (
            <>
              {!imgLoaded && <div className="qp-skeleton skeleton" />}
              <img
                src={`${IMAGE_BASE_URL}${backdrop}`}
                alt=""
                className={`qp-img ${imgLoaded ? 'loaded' : ''}`}
                onLoad={() => setImgLoaded(true)}
                loading="eager"
              />
            </>
          ) : (
            <div className="qp-noimg" />
          )}
          <div className="qp-gradient" />
          <div className="qp-top-fade" />

          {/* Progress if continue watching */}
          {hasProgress && (
            <div className="qp-progress-track">
              <div className="qp-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          )}

          {/* Play overlay hint */}
          <button className="qp-play-fab" onClick={handlePlay} aria-label={t('details.play')}>
            <Play size={18} fill="currentColor" />
          </button>
        </div>

        {/* Body */}
        <div className="qp-body">
          {/* Title / Logo */}
          {logoPath ? (
            <img src={`${LOGO_BASE_URL}${logoPath}`} alt={title} className="qp-logo" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          ) : (
            <h3 className="qp-title">{title}</h3>
          )}

          {/* Actions */}
          <div className="qp-actions">
            <button className="qp-btn primary" onClick={handlePlay} title={t('details.play')}>
              <Play size={16} fill="currentColor" /> <span>{t('hero.play')}</span>
            </button>
            <button className={`qp-btn icon ${localInList ? 'active' : ''}`} onClick={handleToggleList} title={localInList ? t('details.removeFromMyList') : t('details.addToMyList')}>
              {localInList ? <Check size={16} /> : <Plus size={16} />}
            </button>
            <button className={`qp-btn icon ${localLiked ? 'active like' : ''}`} onClick={handleToggleLike} title={localLiked ? t('details.unlike') : t('details.like')}>
              <ThumbsUp size={16} fill={localLiked ? 'currentColor' : 'none'} />
            </button>
            <button className={`qp-btn icon ${localPinned ? 'active' : ''}`} onClick={handleTogglePin} title={localPinned ? t('details.unpinFromDock') : t('details.pinToDock')}>
              {localPinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
            <button className="qp-btn icon" onClick={handleDetails} title={t('details.moreInfo')}>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Meta */}
          <div className="qp-meta">
            {match > 0 && <span className="qp-match"><Star size={11} fill="currentColor" /> {match}% {t('content.match')}</span>}
            {contentRating && <span className="qp-rating">{contentRating}</span>}
            {year && <span className="qp-year">{year}</span>}
            {runtime && <span className="qp-runtime">{runtime}</span>}
            {seasonsLabel && !runtime && <span className="qp-runtime">{seasonsLabel}</span>}
            <span className="qp-hd">HD</span>
            {hasProgress && <span className="qp-remaining"><Clock size={10} /> {Math.ceil(((progress?.duration || 3600) - (progress?.watched || 0)) / 60)} {t('details.min')}</span>}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="qp-genres">
              {genres.map((g, i) => (
                <React.Fragment key={g.id}>
                  <span className="qp-genre">{g.name}</span>
                  {i < genres.length - 1 && <span className="qp-dot">•</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="qp-overview">
            {(details?.tagline ? `${details.tagline} — ` : '') + (item.overview || details?.overview || '').slice(0, 150)}
            {(item.overview?.length || 0) > 150 ? '…' : ''}
            {!item.overview && !details?.overview && !details?.tagline && <span className="qp-overview-empty">{t('details.noDescription')}</span>}
          </p>

          {/* Footer hint */}
          <div className="qp-footer">
            <span className="qp-type-badge">
              {type === 'movie' ? <Film size={11} /> : type === 'anime' ? <Sparkles size={11} /> : <Tv size={11} />}
              {type === 'movie' ? t('dock.movies') : type === 'anime' ? t('dock.anime') : t('dock.tvShows')}
            </span>
            <button className="qp-info-link" onClick={handleDetails}>
              <Info size={12} /> {t('details.moreInfo')}
            </button>
          </div>
        </div>
      </div>
    ,
    document.body
  );
};

export default QuickPreview;
