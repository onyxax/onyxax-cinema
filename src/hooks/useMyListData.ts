import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDetails } from '../services/tmdb';
import type { WatchProgress, TMDBMovie } from '../types/tmdb';
import { getProgressMap, getMyList, getLikes } from '../lib/storage';

export type MyListTab = 'all' | 'continue' | 'movie' | 'tv' | 'anime' | 'likes';
export type SortBy = 'recent' | 'rating' | 'title' | 'year';

export interface MyListData {
  continueWatching: WatchProgress[];
  movies: TMDBMovie[];
  tvShows: TMDBMovie[];
  anime: TMDBMovie[];
  likes: TMDBMovie[];
}

export function useMyListData() {
  const { i18n } = useTranslation();
  const [data, setData] = useState<MyListData>({
    continueWatching: [],
    movies: [],
    tvShows: [],
    anime: [],
    likes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MyListTab>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  // Localize titles via TMDB — future: add caching layer here
  const localizeItems = useCallback(async (items: any[]): Promise<any[]> => {
    if (!items.length) return items;
    // Batch with concurrency limit to avoid rate-limiting
    const BATCH = 6;
    const result: any[] = [];
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      const localized = await Promise.all(
        batch.map(async (item) => {
          try {
            const details = await fetchDetails(String(item.id), item.type || 'movie');
            const title = details?.title || details?.name || item.title || item.name;
            return { ...item, title: title || item.title, name: title || item.name };
          } catch {
            return item;
          }
        })
      );
      result.push(...localized);
    }
    return result;
  }, [i18n.language]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const progress = getProgressMap();
      const rawProgress = (Object.values(progress) as WatchProgress[])
        .filter((it: any) => it && (it.title || it.name) && it.poster_path)
        .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
        .slice(0, 15);

      const savedItems = getMyList();
      const rawMovies = savedItems.filter((m: any) => m.type === 'movie' || !m.type);
      const rawTv = savedItems.filter((m: any) => m.type === 'tv');
      const rawAnime = savedItems.filter((m: any) => m.type === 'anime');
      const likedItems = getLikes();

      const [cw, mov, tv, an, lk] = await Promise.all([
        localizeItems(rawProgress),
        localizeItems(rawMovies),
        localizeItems(rawTv),
        localizeItems(rawAnime),
        localizeItems(likedItems),
      ]);

      setData({
        continueWatching: cw as WatchProgress[],
        movies: mov as TMDBMovie[],
        tvShows: tv as TMDBMovie[],
        anime: an as TMDBMovie[],
        likes: lk as TMDBMovie[],
      });
    } catch (e) {
      console.error('[MyList] load failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [localizeItems]);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener('progress_changed', onChange as EventListener);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('progress_changed', onChange as EventListener);
      window.removeEventListener('storage', onChange);
    };
  }, [load]);

  // Derived: filtered & sorted per active tab
  const filtered = useMemo(() => {
    let items: (TMDBMovie | WatchProgress)[] = [];
    if (activeTab === 'all') {
      items = [...data.continueWatching, ...data.movies, ...data.tvShows, ...data.anime, ...data.likes];
      // dedupe by id for 'all' to avoid duplicates if same id in multiple lists
      const seen = new Set<string>();
      items = items.filter((it: any) => {
        const key = String(it.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else if (activeTab === 'continue') items = data.continueWatching;
    else if (activeTab === 'movie') items = data.movies;
    else if (activeTab === 'tv') items = data.tvShows;
    else if (activeTab === 'anime') items = data.anime;
    else if (activeTab === 'likes') items = data.likes;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((it: any) => (it.title || it.name || '').toLowerCase().includes(q));
    }

    // Sorting — prepared for future: rating/title/year need real data, for now 'recent' is default
    if (sortBy === 'title') {
      items = [...items].sort((a: any, b: any) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    } else if (sortBy === 'rating') {
      items = [...items].sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'year') {
      items = [...items].sort((a: any, b: any) => {
        const ay = (a.release_date || a.first_air_date || '').slice(0, 4);
        const by = (b.release_date || b.first_air_date || '').slice(0, 4);
        return Number(by) - Number(ay);
      });
    } // 'recent' keeps insertion order (already sorted by last_updated for progress)

    return items;
  }, [data, activeTab, search, sortBy]);

  const counts = useMemo(() => ({
    all: new Set([...data.movies, ...data.tvShows, ...data.anime, ...data.likes, ...data.continueWatching].map((x: any) => String(x.id))).size,
    continue: data.continueWatching.length,
    movie: data.movies.length,
    tv: data.tvShows.length,
    anime: data.anime.length,
    likes: data.likes.length,
  }), [data]);

  const hasAny = counts.all > 0 || counts.continue > 0;

  return {
    data,
    filtered,
    counts,
    hasAny,
    isLoading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    sortBy,
    setSortBy,
    refresh: load,
  };
}
