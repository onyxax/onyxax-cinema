import { useState, useEffect, useCallback } from 'react';
import { getProgressMap, setProgressMap, StorageEvents } from '../lib/storage';
import type { WatchProgress } from '../types/tmdb';

export function useWatchProgress() {
  const [progressMap, setMap] = useState<Record<string, any>>(() => getProgressMap());

  const refresh = useCallback(() => setMap(getProgressMap()), []);

  useEffect(() => {
    window.addEventListener(StorageEvents.progressChanged, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(StorageEvents.progressChanged, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const list = Object.values(progressMap) as WatchProgress[];
  const sorted = [...list]
    .filter((p: any) => p && (p.title || p.name) && p.poster_path)
    .sort((a: any, b: any) => (b.last_updated || 0) - (a.last_updated || 0));

  const remove = useCallback((id: string | number) => {
    const map = getProgressMap();
    delete map[String(id)];
    setProgressMap(map);
  }, []);

  const update = useCallback((id: string | number, data: Partial<WatchProgress>) => {
    const map = getProgressMap();
    map[String(id)] = { ...(map[String(id)] || {}), ...data, last_updated: Date.now() };
    setProgressMap(map);
  }, []);

  return { progressMap, list: sorted, remove, update, refresh };
}
