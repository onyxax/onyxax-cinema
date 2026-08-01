import React, { useEffect, useRef, useState } from 'react';
import './Player.css';

interface PlayerProps {
  type: 'movie' | 'tv' | 'anime';
  id: string;
  season?: string;
  episode?: string;
  server: 'cineplay' | 'videasy';
  onServerChange: (server: 'cineplay' | 'videasy') => void;
}

// Obfuscated IPC channel name - matches main process
const _r = atob('X19yZXNvbHZlX18=');

// Obfuscated decryption key - same as main process ENCRYPTION_KEY
const _k = (() => {
  const { createHash } = window.require('crypto');
  return createHash('sha256').update(atob('T255eGF4X0NpbmVtYV9TZWN1cmVfS2V5XzIwMjY=')).digest();
})();

// AES-256-CBC decrypt function (mirrors main process decrypt)
function _dec(enc: string): string {
  try {
    const { createDecipheriv } = window.require('crypto');
    const parts = enc.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const ct = Buffer.from(parts.join(':'), 'hex');
    const d = createDecipheriv('aes-256-cbc', _k, iv);
    return d.update(ct, 'hex', 'utf8') + d.final('utf8');
  } catch {
    return '';
  }
}

const Player: React.FC<PlayerProps> = ({ type, id, season, episode, server }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerUrl, setPlayerUrl] = useState<string>('');

  const getInitialProgress = () => {
    const progress = JSON.parse(localStorage.getItem('onyxax_progress') || '{}');
    const item = progress[id];
    return item?.watched ? Math.floor(item.watched) : 0;
  };

  useEffect(() => {
    const buildUrl = async () => {
      try {
        const { ipcRenderer } = window.require('electron');
        // Payload encoded as base64 — no plain URL visible in renderer source
        const payload = btoa(JSON.stringify({ server, type, id, season, episode }));
        const encrypted = await ipcRenderer.invoke(_r, payload);
        if (!encrypted) return;

        const url = _dec(encrypted);
        if (!url) return;

        // For videasy only, append the local progress timestamp
        if (server === 'videasy') {
          const secs = getInitialProgress();
          setPlayerUrl(secs > 5 ? `${url}&progress=${secs}` : url);
        } else {
          setPlayerUrl(url);
        }
      } catch {
        // Silent fail — player stays blank on error
      }
    };

    buildUrl();
  }, [id, type, season, episode, server]);

  if (!playerUrl) return <div className="player-loading">Initializing Player...</div>;

  return (
    <div className="player-wrapper">
      <iframe
        ref={iframeRef}
        src={playerUrl}
        className={`player-iframe ${server === 'cineplay' ? 'cineplay-mode' : ''}`}
        frameBorder="0"
        allowFullScreen
        allow="encrypted-media"
        title="ONYXAX Player"
      ></iframe>
    </div>
  );
};

export default Player;
