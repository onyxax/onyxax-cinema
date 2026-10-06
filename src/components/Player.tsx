import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePlayerUrl, type PlayerServer, type VidyUrlOptions } from '../lib/securePlayer';
import { getProgressMap } from '../lib/storage';
import { fetchDetails } from '../services/tmdb';
import { fetchAniListId } from '../lib/tmdb/anilist';
import './Player.css';

interface PlayerProps {
  type: 'movie' | 'tv' | 'anime';
  id: string;
  season?: string;
  episode?: string;
  /** Single provider now. Kept optional for backward compat. */
  server?: PlayerServer | 'cineplay' | 'videasy';
  /** No-op now (single provider). Kept optional so old callers compile. */
  onServerChange?: (server: PlayerServer) => void;
  /** Resolved AniList id for anime (preferred). Resolved internally when missing. */
  anilistId?: string | number | null;
}

const Player: React.FC<PlayerProps> = ({ type, id, season, episode, anilistId: anilistIdProp }) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerUrl, setPlayerUrl] = useState<string>('');
  const [resolvedAnilistId, setResolvedAnilistId] = useState<string | null>(
    anilistIdProp != null ? String(anilistIdProp) : null
  );

  // Resolve AniList id for anime: /anime/{anilistId}/{episode} needs it.
  useEffect(() => {
    let cancelled = false;
    if (type !== 'anime') return;
    if (anilistIdProp != null) {
      setResolvedAnilistId(String(anilistIdProp));
      return;
    }
    // Numeric TMDB ids can't be used directly — look up via title.
    if (/^\d+$/.test(id)) {
      fetchDetails(id, 'anime')
        .then((details) => {
          if (cancelled || !details) return null;
          const title =
            (details as any)?.title ||
            (details as any)?.name ||
            (details as any)?.original_title ||
            (details as any)?.original_name ||
            '';
          if (!title) return null;
          return fetchAniListId(title);
        })
        .then((aid) => {
          if (!cancelled && aid) setResolvedAnilistId(String(aid));
        })
        .catch(() => {});
    } else {
      // id already looks like an AniList id / slug — use as-is.
      setResolvedAnilistId(id);
    }
    return () => { cancelled = true; };
  }, [type, id, anilistIdProp]);

  useEffect(() => {
    let cancelled = false;
    const buildUrl = async () => {
      try {
        // Wait for AniList resolution so we don't flash a wrong /anime/{tmdbId} URL.
        if (type === 'anime' && !resolvedAnilistId && /^\d+$/.test(id) && !anilistIdProp) {
          // Give the lookup above a chance; fall through after a short wait
          // rather than blocking forever when AniList is unreachable.
          await new Promise((r) => setTimeout(r, 1500));
          if (cancelled) return;
        }
        const progress = getProgressMap();
        const saved = progress[id];
        const secs = saved?.watched ? Math.floor(saved.watched) : 0;
        const opts: VidyUrlOptions = {
          progress: secs > 5 ? secs : undefined,
          // autoplay stays off by default per Vidy reference:
          // playback with sound needs a prior user gesture + allow="autoplay *".
        };
        if (type === 'anime') {
          opts.anilistId = resolvedAnilistId ?? (anilistIdProp != null ? String(anilistIdProp) : null) ?? undefined;
        }
        const url = await resolvePlayerUrl('vidy', type, id, season, episode, opts);
        if (cancelled || !url) return;
        setPlayerUrl(url);
      } catch {
        // keep loading state — will show initializing
      }
    };
    buildUrl();
    return () => { cancelled = true; };
  }, [id, type, season, episode, resolvedAnilistId, anilistIdProp]);

  if (!playerUrl) return <div className="player-loading">{t('player.initializing')}</div>;

  return (
    <div className="player-wrapper">
      <iframe
        ref={iframeRef}
        src={playerUrl}
        className="player-iframe"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="encrypted-media; autoplay *; fullscreen *"
        title={t('player.initializing')}
      ></iframe>
    </div>
  );
};

export default Player;
