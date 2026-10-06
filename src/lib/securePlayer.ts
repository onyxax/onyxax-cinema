// Secure player helpers — mirrors electron/main.ts logic
// In Electron: decrypt the IPC payload. In browser: build URL directly for preview.
// Provider: Vidy (https://vidy.st) — see embed reference:
//   /movie/{tmdbId}
//   /tv/{tmdbId}/{season}/{episode}
//   /anime/{anilistId}/{episode}
//   flags: color (6-digit hex), progress (seconds), autoplay,
//          nextEpisode + episodeSelector + autoplayNextEpisode (TV/anime)

const VIDY_BASE = ['aHR0cHM6Ly92', 'aWR5LnN0'].map(s => atob(s)).join('');
export const VIDY_BASE_URL = 'https://vidy.st';
export const PLAYER_CHANNEL = atob('X19yZXNvbHZlX18='); // __resolve__
const RAW_KEY_B64 = 'T255eGF4X0NpbmVtYV9TZWN1cmVfS2V5XzIwMjY=';

export type PlayerServer = 'vidy';
// Legacy providers (cineplay/videasy) now resolve to Vidy — kept for backward compat.
export type LegacyPlayerServer = 'cineplay' | 'videasy';
type AnyServer = PlayerServer | LegacyPlayerServer;

export const PLAYER_ACCENT = 'D97757';
export const VIDY_TRUSTED_ORIGINS = ['https://vidy.st', 'https://www.vidy.st'];

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

export interface VidyUrlOptions {
  /** Resume position in seconds — appended as ?progress= */
  progress?: number;
  /** Off by default. Only set when the embed page already had a user gesture. */
  autoplay?: boolean;
  /** 6-digit hex without '#'. Defaults to app accent. */
  color?: string;
  /** TV/anime extras — default true per reference worked examples. */
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  autoplayNextEpisode?: boolean;
  /** For anime: resolved AniList id. Falls back to `id` when missing. */
  anilistId?: string | number | null;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === false) continue;
    usp.set(k, String(v));
  }
  const q = usp.toString();
  return q ? `?${q}` : '';
}

export function buildPlayerUrlDirect(
  _server: AnyServer,
  type: 'movie' | 'tv' | 'anime',
  id: string,
  season?: string,
  episode?: string,
  opts: VidyUrlOptions = {}
): string {
  const base = VIDY_BASE;
  const color = (opts.color || PLAYER_ACCENT).replace('#', '');
  const progress = opts.progress && opts.progress > 5 ? Math.floor(opts.progress) : undefined;
  const autoplay = opts.autoplay ? 'true' : undefined;

  if (type === 'movie') {
    return `${base}/movie/${id}${buildQuery({ color, progress, autoplay })}`;
  }
  if (type === 'anime') {
    const anilistId = opts.anilistId ?? id;
    const ep = episode || season || '1';
    return `${base}/anime/${anilistId}/${ep}${buildQuery({
      color,
      progress,
      autoplay,
      episodeSelector: opts.episodeSelector ?? true,
      nextEpisode: opts.nextEpisode ?? true,
      autoplayNextEpisode: opts.autoplayNextEpisode ?? true,
    })}`;
  }
  const s = season || '1';
  const e = episode || '1';
  return `${base}/tv/${id}/${s}/${e}${buildQuery({
    color,
    progress,
    autoplay,
    nextEpisode: opts.nextEpisode ?? true,
    episodeSelector: opts.episodeSelector ?? true,
    autoplayNextEpisode: opts.autoplayNextEpisode ?? true,
  })}`;
}

export async function resolvePlayerUrl(
  server: AnyServer,
  type: 'movie' | 'tv' | 'anime',
  id: string,
  season?: string,
  episode?: string,
  opts: VidyUrlOptions = {}
): Promise<string | null> {
  // Try Electron IPC first
  try {
    const { isElectron } = await import('./electron');
    if (isElectron()) {
      const { electronInvoke } = await import('./electron');
      const payload = btoa(JSON.stringify({ server, type, id, season, episode, ...opts }));
      const encrypted = await electronInvoke(PLAYER_CHANNEL, payload);
      if (encrypted) {
        const url = decryptPlayerUrl(encrypted);
        if (url) return url;
      }
    }
  } catch { /* fallback to direct */ }
  // Browser preview fallback (or IPC failed)
  return buildPlayerUrlDirect(server, type, id, season, episode, opts);
}
