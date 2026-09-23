import { tmdb } from './client';
import { CACHE_PREFIX, CACHE_TTL_MS } from '../constants';

const memory = new Map<string, any>();

function cacheKey(url: string, params: any): string {
  const keyParams = JSON.stringify(params || {});
  return `${CACHE_PREFIX}${url}_${keyParams}`;
}

export async function getCached(url: string, config?: any) {
  const currentLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('i18nextLng') : null) || 'en';
  const finalConfig = {
    ...config,
    params: {
      ...config?.params,
      language: config?.params?.language ?? currentLang,
      include_adult: false,
    },
  };
  const key = cacheKey(url, finalConfig.params);
  if (memory.has(key)) return { data: memory.get(key) };

  try {
    const persistent = localStorage.getItem(key);
    if (persistent) {
      const { data, timestamp } = JSON.parse(persistent);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        memory.set(key, data);
        return { data };
      }
      localStorage.removeItem(key);
    }
  } catch { /* ignore */ }

  const response = await tmdb.get(url, finalConfig);
  memory.set(key, response.data);
  try {
    localStorage.setItem(key, JSON.stringify({ data: response.data, timestamp: Date.now() }));
  } catch {
    Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
  }
  return response;
}

export function clearTmdbCache() { memory.clear(); }
