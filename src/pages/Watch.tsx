import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Player from '../components/Player';
import Loading from '../components/Loading';
import { fetchDetails } from '../services/tmdb';
import { electronSend, electronOn } from '../lib/electron';
import { getProgressMap, setProgressMap, StorageEvents } from '../lib/storage';
import './Watch.css';

const Watch: React.FC = () => {
  const { type, id, season, episode } = useParams<{ 
    type: 'movie' | 'tv' | 'anime'; 
    id: string; 
    season?: string; 
    episode?: string 
  }>();
  const navigate = useNavigate();
  
   const { isRPCEnabled } = useAuth();
  const [activeSeason, setActiveSeason] = React.useState(season || '1');
  const [activeEpisode, setActiveEpisode] = React.useState(episode || '1');
  const [server, setServer] = React.useState<'cineplay' | 'videasy'>('videasy');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const metadataRef = useRef<any>(null);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Also listen for Electron fullscreen if available
    if (window.electronAPI) {
      window.electronAPI.on('fullscreen-change', (val: boolean) => {
        setIsFullscreen(val);
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const syncedSeason = season || '1';
  const syncedEpisode = episode || '1';
  const [prevSeasonParam, setPrevSeasonParam] = React.useState(syncedSeason);
  const [prevEpisodeParam, setPrevEpisodeParam] = React.useState(syncedEpisode);
  if (prevSeasonParam !== syncedSeason) {
    setPrevSeasonParam(syncedSeason);
    setActiveSeason(syncedSeason);
  }
  if (prevEpisodeParam !== syncedEpisode) {
    setPrevEpisodeParam(syncedEpisode);
    setActiveEpisode(syncedEpisode);
  }


  React.useEffect(() => {
    const handleIframeNav = (_event: any, url: string) => {
      const match = url.match(/\/tv\/[^/]+\/(\d+)\/(\d+)/);
      if (match) {
        setActiveSeason(match[1]);
        setActiveEpisode(match[2]);
      }
    };
    try { electronOn('IFRAME_NAVIGATED', handleIframeNav); } catch { /* ignore */ }
    return () => {
      try {
        const w = window as any;
        const ipc = w.require ? w.require('electron')?.ipcRenderer : null;
        ipc?.removeListener?.('IFRAME_NAVIGATED', handleIframeNav);
      } catch { /* ignore */ }
    };
  }, []);

  const [isPlaying, setIsPlaying] = React.useState(true);
  const [englishTitle, setEnglishTitle] = React.useState('');

  React.useEffect(() => {
    const getDetails = async () => {
      if (!id || !type) return;
      try {
        const details = await fetchDetails(id, type);
        if (!details) return;

        // Fetch English version specifically for RPC
        const tmdbType = type === 'anime' ? 'tv' : type;
        const enRes = await fetch(
          `https://api.themoviedb.org/3/${tmdbType}/${id}?language=en-US&api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const enData = await enRes.json();

        const enTitle = enData.title || enData.name || enData.original_title || enData.original_name;
        const enPoster = enData.poster_path;
        setEnglishTitle(enTitle);

        const meta = {
          id,
          type,
          title: details.title || details.name,
          enTitle,
          enPoster,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
          duration: (details.runtime || details.episode_run_time?.[0] || 60) * 60 || 3600,
        };
        metadataRef.current = meta;

        // Save metadata to localStorage (centralized)
        const existing = getProgressMap();
        const currentWatched = existing[id]?.watched || 0;
        existing[id] = {
          ...meta,
          watched: currentWatched,
          last_updated: existing[id]?.last_updated || Date.now(),
          season: activeSeason,
          episode: activeEpisode,
        };
        setProgressMap(existing);
      } catch (e) {
        console.error('Error fetching details for progress:', e);
      }
    };
    getDetails();
  }, [id, type]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch { return; }
        }
        if (!data || typeof data !== 'object') return;

        // ——— Play/Pause ——— شامل كل التسميات التي يرسلها السيرفرين + حالات bool
        const evt = String(data.event || data.type || data.method || '').toLowerCase();
        const isPauseEvt = evt.includes('pause') || data.paused === true || data.isPlaying === false || data.playing === false;
        const isPlayEvt = evt.includes('play') || evt.includes('playing') || data.paused === false || data.isPlaying === true || data.playing === true;
        const isSeekEvt = evt.includes('seek') || evt.includes('timeupdate') || evt === 'progress';
        if (isPauseEvt) {
          setIsPlaying(false);
          window.dispatchEvent(new Event(StorageEvents.progressChanged));
        } else if (isPlayEvt) {
          setIsPlaying(true);
          window.dispatchEvent(new Event(StorageEvents.progressChanged));
        } else if (isSeekEvt && !isPauseEvt && !isPlayEvt) {
          // seek بدون تغيير play state — نفرض تحديث فوري للـ RPC
          window.dispatchEvent(new Event(StorageEvents.progressChanged));
        }

        // ——— استخراج الوقت باحترافية — يدعم كل الحقول + صيغ "25:59" ———
        const parseSec = (v: any): number | null => {
          if (v === undefined || v === null || v === '') return null;
          if (typeof v === 'number' && !isNaN(v)) return v;
          const s = String(v).trim();
          if (/^\d+:\d+:\d+$/.test(s)) { const p = s.split(':').map(Number); return p[0]*3600 + p[1]*60 + p[2]; }
          if (/^\d+:\d+$/.test(s)) { const p = s.split(':').map(Number); return p[0]*60 + p[1]; }
          const n = Number(s);
          return isNaN(n) ? null : n;
        };
        const rawTime = data.timestamp ?? data.currentTime ?? data.current_time ?? data.time ?? data.seconds ?? data.position ?? data.current_time;
        const rawProgress = data.progress ?? data.percent ?? data.percentage ?? data.played;
        const rawDuration = data.duration ?? data.totalDuration ?? data.total ?? data.maxDuration ?? metadataRef.current?.duration;
        const tSec = parseSec(rawTime);
        const pSec = parseSec(rawProgress);
        const dSec = parseSec(rawDuration);
        const hasTime = tSec !== null;
        const hasProgress = pSec !== null;

        if (hasTime || hasProgress) {
          const progress = getProgressMap();
          const existingItem = progress[id!] || {};
          let dur = dSec ?? Number(existingItem.duration) ?? Number(metadataRef.current?.duration) ?? 3600;
          if (isNaN(dur) || dur <= 0) dur = 3600;
          let watched: number;
          if (hasTime) {
            watched = tSec as number;
            if (watched > dur * 10) watched = watched / 1000;
          } else {
            const pct = pSec as number;
            const pctNorm = pct > 1 ? pct / 100 : pct;
            watched = pctNorm * dur;
          }
          const duration = dur;

          progress[id!] = {
            ...(metadataRef.current || {}),
            ...existingItem,
            watched,
            duration,
            last_updated: Date.now(),
            season: data.season || activeSeason,
            episode: data.episode || activeEpisode
          };

          if (data.season && data.episode && (data.season.toString() !== activeSeason || data.episode.toString() !== activeEpisode)) {
            setActiveSeason(data.season.toString());
            setActiveEpisode(data.episode.toString());
          }

          if (duration && metadataRef.current) {
            metadataRef.current.duration = duration;
          }

          setProgressMap(progress);
        }
      } catch (e) {
        console.error('Error saving progress:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      try { electronSend('CLEAR_RPC'); } catch { /* best-effort */ }
    };
  }, [id, type, activeSeason, activeEpisode]);

  const lastRpcUpdateRef = useRef<number>(0);
  const lastSentPlayerTimeRef = useRef<number>(-1);
  const lastIsPlayingRef = useRef<boolean>(false);
  const hasReceivedDurationRef = useRef<boolean>(false);

  React.useEffect(() => {
    const updateRpc = (force = false) => {
      if (!id || !type || !isRPCEnabled) return;
      
      const details = metadataRef.current;
      if (!details) return;

      const existing = getProgressMap();
      const item = existing[id] || {};
      
      const currentPlayerTime = item.watched || 0;
      const durationSeconds = item.duration || 0;
      const now = Date.now();

      // If we already have some progress or duration, consider it loaded
      if (currentPlayerTime > 0 || durationSeconds > 0) {
        hasReceivedDurationRef.current = true;
      }

      // SMART LOGIC:
      const hasSeeked = Math.abs(currentPlayerTime - lastSentPlayerTimeRef.current) > 2;
      const playStateChanged = isPlaying !== lastIsPlayingRef.current;
      const isPeriodicUpdate = now - lastRpcUpdateRef.current > 15000;

      if (!force && !hasSeeked && !playStateChanged && !isPeriodicUpdate && hasReceivedDurationRef.current) {
        return;
      }

      const title = (englishTitle || details.enTitle || details.title || details.name || '').slice(0, 42);
      const pct = durationSeconds > 0 ? Math.round((currentPlayerTime / durationSeconds) * 100) : 0;
      const remainingSec = Math.max(0, durationSeconds - currentPlayerTime);
      const year = (details.release_date || '').slice(0, 4);
      const rating = details.vote_average ? `${details.vote_average.toFixed(1)}★` : '';

      // Helpers — rich but concise (Discord state limit 128, we keep 32 for small profile)
      const fmtClock = (sec: number): string => {
        const s = Math.max(0, Math.floor(sec));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sc = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
        return `${m}:${String(sc).padStart(2, '0')}`;
      };
      const fmtLeft = (sec: number): string => {
        const s = Math.max(0, Math.floor(sec));
        const h = Math.floor(s / 3600);
        const m = Math.ceil((s % 3600) / 60);
        if (h > 0) return `${h}h ${m}m left`;
        if (m > 0) return `${m}m left`;
        return `${s}s left`;
      };
      const timePair = `${fmtClock(currentPlayerTime)} / ${fmtClock(durationSeconds)}`;

      // State — مليئة بالمعلومات بدون رموز نصية
      let stateText: string;
      if (!hasReceivedDurationRef.current) {
        stateText = 'Loading…';
      } else if (type === 'tv' || type === 'anime') {
        const left = fmtLeft(remainingSec);
        // S01E05 • 42% • 23m left  (الحالة النصية) + الحالة (Playing) تذهب للـ small image
        stateText = `S${String(activeSeason).padStart(2, '0')}E${String(activeEpisode).padStart(2, '0')} • ${pct}% • ${left}`;
      } else {
        const left = fmtLeft(remainingSec);
        stateText = `${pct}% • ${left}`;
      }

      const nowSeconds = now / 1000;
      // احترافي: عند التشغيل نعرض شريط تقدم حقيقي (start + end)، عند الإيقاف نجمّد العداد (بدون end)
      // التقديم لـ 25 دقيقة = start = now - 1500 => العداد يقفز فوراً لـ 25:00 بدل ما يبدأ من 0
      let startTs: number | undefined;
      let endTs: number | undefined;
      if (!hasReceivedDurationRef.current) {
        startTs = undefined;
        endTs = undefined;
      } else if (isPlaying && durationSeconds > 0) {
        startTs = Math.floor(nowSeconds - currentPlayerTime);
        endTs = Math.floor(nowSeconds + remainingSec);
      } else {
        // Paused or no duration — نوقف العداد تماماً (لا نرسل timestamps) والنص يوضح الوقت الثابت
        startTs = undefined;
        endTs = undefined;
      }

      // Professional art — large = poster/backdrop (TMDB external URL), small = شعار التطبيق دائم (onyxaxcinema)
      const smallKey = 'onyxaxcinema';
      const smallText = !hasReceivedDurationRef.current
        ? 'Loading…'
        : isPlaying
          ? `Playing • ${timePair} • ${pct}%`
          : `Paused • ${timePair} • ${pct}%`;

      const largeText = [title, year && year, rating && rating, pct ? `${pct}%` : null].filter(Boolean).join(' • ');

      electronSend('UPDATE_RPC', {
        details: `${type === 'tv' ? 'Watching Series' : type === 'anime' ? 'Watching Anime' : 'Watching Film'}: ${title}`,
        state: stateText.slice(0, 32),
        largeImageKey: details.backdrop_path ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}` : details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'onyxaxcinema',
        largeImageText: largeText.slice(0, 128),
        smallImageKey: smallKey,
        smallImageText: smallText.slice(0, 128),
        startTimestamp: startTs,
        endTimestamp: endTs,
        buttons: [
          { label: 'View on TMDB', url: `https://www.themoviedb.org/${type === 'movie' ? 'movie' : 'tv'}/${id}` },
          { label: 'Download App', url: 'https://github.com/onyxax/onyxax-cinema/releases/latest' },
        ],
      });

      lastRpcUpdateRef.current = now;
      lastSentPlayerTimeRef.current = currentPlayerTime;
      lastIsPlayingRef.current = isPlaying;
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === 'object') {
          const data = event.data;
          if (data.type === 'progress') {
            hasReceivedDurationRef.current = true;
            updateRpc(false);
          }
        }
      } catch {
        /* ignore malformed messages */
      }
    };

    // Initial immediate update to prevent RPC from disappearing
    updateRpc(true);

    const onProgress = () => updateRpc(false);
    window.addEventListener('message', handleMessage);
    window.addEventListener(StorageEvents.progressChanged, onProgress as EventListener);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener(StorageEvents.progressChanged, onProgress as EventListener);
    };
  }, [id, type, activeSeason, activeEpisode, isRPCEnabled, isPlaying, englishTitle]);

  if (!type || !id) {
    return (
      <div className="watch-loading-container">
        <button className="back-btn-fixed" onClick={() => navigate(-1)}>
          <ArrowLeft size={32} />
        </button>
        <Loading />
      </div>
    );
  }

  return (
    <div
      className={`watch-page ${isFullscreen ? 'is-fullscreen' : ''}`}
    >
      <button className="back-btn" onClick={() => navigate(`/details/${type}/${id}`)}>
        <ArrowLeft size={22} />
      </button>
      
      <div className="player-container-fixed">
        <Player 
          type={type} 
          id={id} 
          season={season || '1'} 
          episode={episode || '1'} 
          server={server}
          onServerChange={setServer}
        />
      </div>
    </div>
  );
};



export default Watch;
