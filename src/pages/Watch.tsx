import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Player from '../components/Player';
import Loading from '../components/Loading';
import { fetchDetails } from '../services/tmdb';
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
    try {
      const { ipcRenderer } = window.require('electron');
      const handleIframeNav = (_event: any, url: string) => {
        const match = url.match(/\/tv\/[^/]+\/(\d+)\/(\d+)/);
        if (match) {
          setActiveSeason(match[1]);
          setActiveEpisode(match[2]);
        }
      };
      ipcRenderer.on('IFRAME_NAVIGATED', handleIframeNav);
      return () => {
        ipcRenderer.removeListener('IFRAME_NAVIGATED', handleIframeNav);
      };
    } catch {
      /* ipcRenderer is unavailable outside Electron */
    }
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

        // Save metadata to localStorage
        const existing = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
        const currentWatched = existing[id]?.watched || 0;
        existing[id] = {
          ...meta,
          watched: currentWatched,
          last_updated: existing[id]?.last_updated || Date.now(),
          season: activeSeason,
          episode: activeEpisode,
        };
        localStorage.setItem('onyxax_progress', JSON.stringify(existing));
        window.dispatchEvent(new Event('progress_changed'));
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
        
        // Handle Play/Pause/TimeUpdate from various player events
        if (data.event === 'onPause' || data.event === 'pause' || data.method === 'pause') {
          setIsPlaying(false);
          window.dispatchEvent(new Event('progress_changed'));
        } else if (data.event === 'onPlay' || data.event === 'play' || data.method === 'play') {
          setIsPlaying(true);
          window.dispatchEvent(new Event('progress_changed'));
        }

        if (data && (data.timestamp !== undefined || data.progress !== undefined)) {
          const progress = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
          const existingItem = progress[id!] || {};
          
          const watched = data.timestamp !== undefined ? data.timestamp : (data.progress * (data.duration || metadataRef.current?.duration || 3600) / 100);
          const duration = data.duration || metadataRef.current?.duration || 3600;

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
          
          if (data.duration && metadataRef.current) {
            metadataRef.current.duration = data.duration;
          }
          
          localStorage.setItem('onyxax_progress', JSON.stringify(progress));
          window.dispatchEvent(new Event('progress_changed'));
        }
      } catch (e) {
        console.error('Error saving progress:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('CLEAR_RPC');
      } catch {
        /* best-effort RPC cleanup */
      }
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

      const existing = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
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

      const title = englishTitle || details.enTitle || details.title || details.name;
      let stateText: string | undefined;
      
      if (hasReceivedDurationRef.current) {
        if (type === 'tv' || type === 'anime') {
          stateText = `Season ${activeSeason} Ep ${activeEpisode}`;
        } else {
          stateText = 'Watching Movie';
        }
      } else {
        stateText = 'Loading media...';
      }

      const nowSeconds = now / 1000;
      const startTs = Math.floor(nowSeconds - currentPlayerTime);
      const endTs = (isPlaying && hasReceivedDurationRef.current && durationSeconds > 0) 
        ? Math.floor(nowSeconds + (durationSeconds - currentPlayerTime)) 
        : undefined;

      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('UPDATE_RPC', {
        details: title,
        state: stateText,
        largeImageKey: details.backdrop_path ? `https://image.tmdb.org/t/p/w500${details.backdrop_path}` : 'onyxaxcinema',
        largeImageText: title,
        startTimestamp: startTs,
        endTimestamp: endTs,
        buttons: [
          { label: 'Download The App', url: 'https://github.com/onyxax/onyxax-cinema/releases/latest' },
          { label: 'View on TMDB', url: `https://www.themoviedb.org/${type === 'movie' ? 'movie' : 'tv'}/${id}` }
        ]
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

    window.addEventListener('message', handleMessage);
    window.addEventListener('progress_changed', () => updateRpc(false));
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('progress_changed', () => updateRpc(false));
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
