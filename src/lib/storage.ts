// Centralized localStorage access + typed keys + event bus
// Eliminates scattered JSON.parse(localStorage.getItem(...)) across 8+ files

export const StorageKeys = {
  progress: 'onyxax_progress',
  myList: 'onyxax_mylist',
  likes: 'onyxax_likes',
  pinned: 'onyxax_pinned',
  rpcEnabled: 'onyxax_rpc_enabled',
  dismissedBetas: 'onyxax_dismissed_betas',
  featuredWithLogos: 'onyxax_featured_with_logos',
  sidebarCollapsed: 'onyxax_sidebar_collapsed',
  cachePrefix: 'onyxax_cache_',
} as const;

// Legacy typo — keep for migration from older builds
export const SIDEBAR_COLLAPSED_LEGACY = 'onyax_sidebar_collapsed';

export function getSidebarCollapsed(): boolean {
  try {
    const v = localStorage.getItem(StorageKeys.sidebarCollapsed);
    if (v !== null) return v === 'true';
    const legacy = localStorage.getItem(SIDEBAR_COLLAPSED_LEGACY);
    if (legacy !== null) {
      localStorage.setItem(StorageKeys.sidebarCollapsed, legacy);
      return legacy === 'true';
    }
    return false;
  } catch { return false; }
}

export function setSidebarCollapsed(v: boolean): void {
  try { localStorage.setItem(StorageKeys.sidebarCollapsed, String(v)); } catch { /* ignore */ }
}

export const StorageEvents = {
  pinnedChanged: 'pinned_changed',
  progressChanged: 'progress_changed',
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

export function getJSON<T>(key: string, fallback: T): T {
  try { return safeParse(localStorage.getItem(key), fallback); } catch { return fallback; }
}

export function setJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export function removeKeysByPrefix(prefix: string): void {
  try {
    Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

// Typed helpers
export type ProgressMap = Record<string, any>;
export function getProgressMap(): ProgressMap { return getJSON<ProgressMap>(StorageKeys.progress, {}); }
export function setProgressMap(map: ProgressMap): void { setJSON(StorageKeys.progress, map); window.dispatchEvent(new Event(StorageEvents.progressChanged)); }

export function getPinned(): any[] { return getJSON<any[]>(StorageKeys.pinned, []); }
export function setPinned(list: any[]): void { setJSON(StorageKeys.pinned, list); window.dispatchEvent(new Event(StorageEvents.pinnedChanged)); }

export function getMyList(): any[] { return getJSON<any[]>(StorageKeys.myList, []); }
export function setMyList(list: any[]): void { setJSON(StorageKeys.myList, list); }

export function getLikes(): any[] { return getJSON<any[]>(StorageKeys.likes, []); }
export function setLikes(list: any[]): void { setJSON(StorageKeys.likes, list); }
