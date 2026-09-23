// Secure player helpers — mirrors electron/main.ts logic
// In Electron: decrypt the IPC payload. In browser: build URL directly for preview.

const CINEPLAY_BASE = ['aHR0cHM6Ly9j','aW5lcGxheS51','cC5yYWlsd2F5','LmFwcA=='].map(s => atob(s)).join('');
const VIDEASY_BASE  = ['aHR0cHM6Ly9w','bGF5ZXIudmlk','ZWFzeS5uZXQ='].map(s => atob(s)).join('');
export const PLAYER_CHANNEL = atob('X19yZXNvbHZlX18='); // __resolve__
const RAW_KEY_B64 = 'T255eGF4X0NpbmVtYV9TZWN1cmVfS2V5XzIwMjY=';

let _key: Buffer | null = null;
function getKey(): Buffer | null {
  try {
    const w = window as any;
    if (typeof w.require !== 'function') return null;
    const { createHash } = w.require('crypto');
    if (_key) return _key;
    _key = createHash('sha256').update(atob(RAW_KEY_B64)).digest();
    return _key;
  } catch { return null; }
}

export function decryptPlayerUrl(enc: string): string {
  try {
    const w = window as any;
    if (typeof w.require !== 'function') return '';
    const { createDecipheriv } = w.require('crypto');
    const key = getKey();
    if (!key) return '';
    const parts = enc.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const ct = Buffer.from(parts.join(':'), 'hex');
    const d = createDecipheriv('aes-256-cbc', key, iv);
    return d.update(ct, 'hex', 'utf8') + d.final('utf8');
  } catch { return ''; }
}

export function buildPlayerUrlDirect(
  server: 'cineplay' | 'videasy',
  type: 'movie' | 'tv' | 'anime',
  id: string,
  season?: string,
  episode?: string
): string {
  const base = server === 'cineplay' ? CINEPLAY_BASE : VIDEASY_BASE;
  if (server === 'cineplay') {
    return type === 'movie' ? `${base}/movie/${id}` : `${base}/tv/${id}/${season || '1'}/${episode || '1'}`;
  }
  const accent = 'd97757';
  const params = `nextEpisode=true&autoplayNextEpisode=true&overlay=true&color=${accent}`;
  return type === 'movie'
    ? `${base}/movie/${id}?${params}`
    : `${base}/tv/${id}/${season || '1'}/${episode || '1'}?${params}`;
}

export async function resolvePlayerUrl(
  server: 'cineplay' | 'videasy',
  type: 'movie' | 'tv' | 'anime',
  id: string,
  season?: string,
  episode?: string
): Promise<string | null> {
  // Try Electron IPC first
  try {
    const { isElectron } = await import('./electron');
    if (isElectron()) {
      const { electronInvoke } = await import('./electron');
      const payload = btoa(JSON.stringify({ server, type, id, season, episode }));
      const encrypted = await electronInvoke(PLAYER_CHANNEL, payload);
      if (encrypted) {
        const url = decryptPlayerUrl(encrypted);
        if (url) return url;
      }
    }
  } catch { /* fallback to direct */ }
  // Browser preview fallback (or IPC failed)
  return buildPlayerUrlDirect(server, type, id, season, episode);
}
