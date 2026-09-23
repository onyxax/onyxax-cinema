import axios from 'axios';
import type { TMDBMovie, TMDBDetails, TMDBImagesResponse } from '../types/tmdb';
import { tmdb, IMAGE_BASE_URL as _IMAGE_BASE, LOGO_BASE_URL as _LOGO_BASE, THUMBNAIL_BASE_URL as _THUMB_BASE, prefetchImage as _prefetch } from '../lib/tmdb/client';
import { getCached } from '../lib/tmdb/cache';
import { isSafe, EXCLUDE_KEYWORDS } from '../lib/tmdb/safety';
import { filterAnimeWithAniList } from '../lib/tmdb/anilist';

// Re-export for backward compatibility (so `from '../services/tmdb'` still works)
export const IMAGE_BASE_URL = _IMAGE_BASE;
export const LOGO_BASE_URL = _LOGO_BASE;
export const THUMBNAIL_BASE_URL = _THUMB_BASE;
export const prefetchImage = _prefetch;
export { filterAnimeWithAniList };
const cache = new Map<string, any>(); // kept for legacy local lookups if any external code reads it

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  try {
    const { data } = await getCached('/search/multi', {
      params: {
        query,
        include_adult: false,
      },
    });
    return data.results.filter(isSafe);
  } catch (error) {
    console.error('searchMovies error:', error);
    return [];
  }
};

export const fetchTrending = async (type: 'movie' | 'tv' | 'all' = 'all', language?: string): Promise<TMDBMovie[]> => {
  try {
    const { data } = await getCached(`/trending/${type}/week`, language ? { params: { language } } : undefined);
    return data.results.filter(isSafe);
  } catch (error) {
    console.error('fetchTrending error:', error);
    return [];
  }
};

export const fetchTrendingToday = async (type: 'movie' | 'tv' | 'all' = 'all'): Promise<TMDBMovie[]> => {
  try {
    const { data } = await getCached(`/trending/${type}/day`);
    return data.results.filter(isSafe);
  } catch (error) {
    console.error('fetchTrendingToday error:', error);
    return [];
  }
};

export const fetchTopRated = async (type: 'movie' | 'tv' = 'movie'): Promise<TMDBMovie[]> => {
  try {
    const { data } = await getCached(`/${type}/top_rated`);
    return data.results.filter(isSafe);
  } catch (error) {
    console.error('fetchTopRated error:', error);
    return [];
  }
};

export const fetchMovies = async (genre?: number, sort = 'popularity.desc', count = 60): Promise<TMDBMovie[]> => {
  try {
    const pages = Math.ceil(count / 20);
    const requests = Array.from({ length: pages }, (_, i) => 
      getCached('/discover/movie', {
        params: {
          with_genres: genre || undefined,
          sort_by: sort,
          page: i + 1,
          include_adult: false,
          without_keywords: EXCLUDE_KEYWORDS,
        },
      })
    );
    const results = await Promise.all(requests);
    return results.flatMap(r => r.data.results).filter(isSafe).slice(0, count);
  } catch (error) {
    console.error('fetchMovies error:', error);
    return [];
  }
};

export const fetchTVShows = async (genre?: number, sort = 'popularity.desc', count = 60): Promise<TMDBMovie[]> => {
  try {
    const pages = Math.ceil(count / 20);
    const requests = Array.from({ length: pages }, (_, i) => 
      getCached('/discover/tv', {
        params: {
          with_genres: genre || undefined,
          without_genres: '16',
          sort_by: sort,
          page: i + 1,
          include_adult: false,
          without_keywords: EXCLUDE_KEYWORDS,
        },
      })
    );
    const results = await Promise.all(requests);
    return results.flatMap(r => r.data.results).filter(isSafe).slice(0, count);
  } catch (error) {
    console.error('fetchTVShows error:', error);
    return [];
  }
};

export const fetchAnime = async (genre?: number, sort = 'popularity.desc', count = 100): Promise<TMDBMovie[]> => {
  try {
    const pages = Math.ceil(count / 20);
    const genres = genre && genre !== 16 && genre !== 0 ? `16,${genre}` : '16';
    
    const requests = Array.from({ length: pages }, (_, i) => 
      getCached('/discover/tv', {
        params: {
          with_genres: genres,
          with_keywords: '210024|287501',
          sort_by: sort,
          page: i + 1,
          include_adult: false,
          without_keywords: EXCLUDE_KEYWORDS,
        },
      })
    );
    const results = await Promise.all(requests);
    const allResults = results.flatMap(r => r.data.results);
    const filtered = allResults.filter(isSafe).map(m => ({ ...m, media_type: 'anime' as const }));

    // Verify the top displayed titles against AniList's official adult flag
    const toVerify = filtered.slice(0, 40);
    const verified = await filterAnimeWithAniList(toVerify);
    const rest = filtered.slice(40);
    return [...verified, ...rest].slice(0, count);
  } catch (error) {
    console.error('fetchAnime error:', error);
    return [];
  }
};

export const fetchByNetwork = async (networkId: number): Promise<TMDBMovie[]> => {
  try {
    const { data } = await getCached('/discover/tv', {
      params: {
        with_networks: networkId,
        sort_by: 'popularity.desc',
        include_adult: false,
        without_keywords: EXCLUDE_KEYWORDS,
      }
    });
    return data.results.filter(isSafe);
  } catch (error) {
    console.error('fetchByNetwork error:', error);
    return [];
  }
};

export const fetchDetails = async (id: number | string, type: 'movie' | 'tv' | 'anime'): Promise<TMDBDetails | null> => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const { data } = await getCached(`/${tmdbType}/${id}`, {
      params: { append_to_response: 'release_dates,content_ratings,translations' }
    });

    if (!data.overview && data.translations?.translations) {
      const enTranslation = data.translations.translations.find((t: any) => t.iso_639_1 === 'en');
      if (enTranslation?.data?.overview) {
        data.overview = enTranslation.data.overview;
      }
      // Fallback for missing images in localized data
      if (!data.poster_path && enTranslation?.data?.poster_path) {
        data.poster_path = enTranslation.data.poster_path;
      }
      if (!data.backdrop_path && enTranslation?.data?.backdrop_path) {
        data.backdrop_path = enTranslation.data.backdrop_path;
      }
    }

    return data;
  } catch (error) {
    console.error('fetchDetails error:', error);
    return null;
  }
};

export const fetchRecommendations = async (id: number | string, type: 'movie' | 'tv' | 'anime'): Promise<TMDBMovie[]> => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const { data } = await getCached(`/${tmdbType}/${id}/recommendations`);
    return (data.results as TMDBMovie[]).filter(isSafe);
  } catch (error) {
    console.error('fetchRecommendations error:', error);
    return [];
  }
};

export const fetchOverviewInEnglish = async (id: number | string, type: 'movie' | 'tv' | 'anime'): Promise<string> => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const { data } = await tmdb.get(`/${tmdbType}/${id}`, { params: { language: 'en' } });
    return typeof data.overview === 'string' ? data.overview : '';
  } catch (error) {
    console.error('fetchOverviewInEnglish error:', error);
    return '';
  }
};

export const fetchImages = async (id: number | string, type: 'movie' | 'tv' | 'anime'): Promise<TMDBImagesResponse> => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const currentLang = localStorage.getItem('i18nextLng')?.split('-')[0] || 'en';

    // Prioritize current language, then English, then no language (null)
    // This ensures that if localized images don't exist, English ones are fetched
    const imageLangs = currentLang === 'en' ? 'en,null' : `${currentLang},en,null`;
    
    const { data } = await getCached(`/${tmdbType}/${id}/images`, {
      params: { include_image_language: imageLangs }
    });
    return data;
  } catch (error) {
    console.error('fetchImages error:', error);
    return { backdrops: [], posters: [], logos: [] };
  }
};

export const fetchCredits = async (id: number | string, type: 'movie' | 'tv' | 'anime') => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const { data } = await getCached(`/${tmdbType}/${id}/credits`);
    return data;
  } catch (error) {
    console.error('fetchCredits error:', error);
    return { cast: [], crew: [] };
  }
};

export const fetchVideos = async (id: number | string, type: 'movie' | 'tv' | 'anime') => {
  try {
    const tmdbType = type === 'anime' ? 'tv' : type;
    const { data } = await getCached(`/${tmdbType}/${id}/videos`);
    return data.results;
  } catch (error) {
    console.error('fetchVideos error:', error);
    return [];
  }
};

export const fetchEpisodes = async (id: number | string, seasonNumber: number): Promise<any[]> => {
  try {
    const lang = localStorage.getItem('i18nextLng') || 'en';
    const { data: currentData } = await getCached(`/tv/${id}/season/${seasonNumber}`);
    
    // If language is already English, just return
    if (lang.startsWith('en')) {
      return currentData.episodes || [];
    }

    // Otherwise, fetch English version for fallback overviews
    const { data: englishData } = await tmdb.get(`/tv/${id}/season/${seasonNumber}`, {
      params: { language: 'en-US' }
    });

    const episodes = (currentData.episodes || []).map((ep: any, index: number) => {
      const enEp = englishData?.episodes?.[index];
      return {
        ...ep,
        overview: ep.overview || enEp?.overview || 'No description available for this episode.'
      };
    });

    return episodes;
  } catch (error) {
    console.error('fetchEpisodes error:', error);
    return [];
  }
};

export const searchContent = async (query: string): Promise<TMDBMovie[]> => {
  try {
    const lang = localStorage.getItem('i18nextLng') || 'en';
    const { data } = await tmdb.get('/search/multi', {
      params: { query, language: lang, include_adult: false },
    });
    return (data.results as TMDBMovie[]).filter(isSafe);
  } catch (error) {
    console.error('searchContent error:', error);
    return [];
  }
};

export const searchContentPage = async (query: string, page = 1): Promise<{results: TMDBMovie[], total_pages: number, total_results: number}> => {
  try {
    const lang = localStorage.getItem('i18nextLng') || 'en';
    const { data } = await tmdb.get('/search/multi', {
      params: { query, language: lang, include_adult: false, page },
    });
    return { results: data.results.filter(isSafe), total_pages: data.total_pages, total_results: data.total_results };
  } catch (error) {
    console.error('searchContentPage error:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// Page-based fetch functions for infinite scroll
export const fetchMoviesPage = async (genre?: number, sort = 'popularity.desc', page = 1, extraParams: Record<string, any> = {}): Promise<{results: TMDBMovie[], total_pages: number, total_results: number}> => {
  try {
    const { data } = await getCached('/discover/movie', {
      params: {
        with_genres: genre || undefined,
        sort_by: sort,
        page,
        include_adult: false,
        without_keywords: EXCLUDE_KEYWORDS,
        ...extraParams,
      },
    });
    return { results: data.results.filter(isSafe), total_pages: data.total_pages, total_results: data.total_results };
  } catch (error) {
    console.error('fetchMoviesPage error:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchTVShowsPage = async (genre?: number, sort = 'popularity.desc', page = 1, extraParams: Record<string, any> = {}): Promise<{results: TMDBMovie[], total_pages: number, total_results: number}> => {
  try {
    const { data } = await getCached('/discover/tv', {
      params: {
        with_genres: genre || undefined,
        without_genres: '16',
        sort_by: sort,
        page,
        include_adult: false,
        without_keywords: EXCLUDE_KEYWORDS,
        ...extraParams,
      },
    });
    return { results: data.results.filter(isSafe), total_pages: data.total_pages, total_results: data.total_results };
  } catch (error) {
    console.error('fetchTVShowsPage error:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchAnimePage = async (genre?: number, sort = 'popularity.desc', page = 1, extraParams: Record<string, any> = {}): Promise<{results: TMDBMovie[], total_pages: number, total_results: number}> => {
  try {
    const genres = genre && genre !== 16 && genre !== 0 ? `16,${genre}` : '16';
    const { data } = await getCached('/discover/tv', {
      params: {
        with_genres: genres,
        with_keywords: '210024|287501',
        sort_by: sort,
        page,
        include_adult: false,
        without_keywords: EXCLUDE_KEYWORDS,
        ...extraParams,
      },
    });
    const results = data.results.filter(isSafe).map((m: TMDBMovie) => ({ ...m, media_type: 'anime' as const }));
    const verified = await filterAnimeWithAniList(results);
    return { results: verified, total_pages: data.total_pages, total_results: data.total_results };
  } catch (error) {
    console.error('fetchAnimePage error:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchAniListId = async (title: string): Promise<number | null> => {
  const cacheKey = `anilist_${title}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          id
        }
      }
    `;
    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: title }
    });
    const id = response.data.data.Media.id;
    cache.set(cacheKey, id);
    return id;
  } catch (error) {
    console.error('fetchAniListId error:', error);
    return null;
  }
};

export default tmdb;
