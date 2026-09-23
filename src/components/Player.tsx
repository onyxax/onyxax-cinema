import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePlayerUrl } from '../lib/securePlayer';
import { getProgressMap } from '../lib/storage';
import './Player.css';

interface PlayerProps {
  type: 'movie' | 'tv' | 'anime';
  id: string;
  season?: string;
  episode?: string;
  server: 'cineplay' | 'videasy';
  onServerChange: (server: 'cineplay' | 'videasy') => void;
}

const Player: React.FC<PlayerProps> = ({ type, id, season, episode, server }) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerUrl, setPlayerUrl] = useState<string>('');

  const getInitialProgress = () => {
    const progress = getProgressMap();
    const item = progress[id];
    return item?.watched ? Math.floor(item.watched) : 0;
  };

  useEffect(() => {
    let cancelled = false;
    const buildUrl = async () => {
      try {
        const url = await resolvePlayerUrl(server, type, id, season, episode);
        if (cancelled || !url) return;
        if (server === 'videasy') {
          const secs = getInitialProgress();
          setPlayerUrl(secs > 5 ? `${url}&progress=${secs}` : url);
        } else {
          setPlayerUrl(url);
        }
      } catch {
        // keep loading state — will show initializing
      }
    };
    buildUrl();
    return () => { cancelled = true; };
  }, [id, type, season, episode, server]);

  if (!playerUrl) return <div className="player-loading">{t('player.initializing')}</div>;

  return (
    <div className="player-wrapper">
      <iframe
        ref={iframeRef}
        src={playerUrl}
        className={`player-iframe ${server === 'cineplay' ? 'cineplay-mode' : ''}`}
        frameBorder="0"
        allowFullScreen
        allow="encrypted-media"
        title={t('player.initializing')}
      ></iframe>
    </div>
  );
};

export default Player;
