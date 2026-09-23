// App-wide constants — single source for storage limits, cache, etc.

export const APP_VERSION = '1.2.9';
export const CACHE_PREFIX = 'onyxax_cache_';
export const CACHE_TTL_MS = 1000 * 60 * 60; // 1h
export const PIN_LIMIT = 15;
export const PROGRESS_MAX_ITEMS = 15;
export const PAGE_MAX = 100;

export const IMAGE_BASE = 'https://image.tmdb.org/t/p/w1280';
export const LOGO_BASE = 'https://image.tmdb.org/t/p/w500';
export const THUMB_BASE = 'https://image.tmdb.org/t/p/w342';

export const PLATFORMS = [
  { name: 'Netflix', color: '#E50914', id: 213 },
  { name: 'Prime Video', color: '#00A8E1', id: 1024 },
  { name: 'Max', color: '#0047FF', id: 49 },
  { name: 'Disney+', color: '#113CCF', id: 2739 },
  { name: 'Apple TV+', color: '#999999', id: 2552 },
  { name: 'Paramount+', color: '#0064FF', id: 4330 },
  { name: 'Hulu', color: '#1CE783', id: 453 },
] as const;

// Layout — single source for Dock + grid calculations (must match Dock.css)
export const DOCK_WIDTH = 240;
export const DOCK_WIDTH_COLLAPSED = 48;
export const DOCK_MARGIN = 10;
