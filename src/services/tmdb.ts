import axios from 'axios';
import type { TMDBMovie, TMDBDetails, TMDBImagesResponse } from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
export const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w342';

// Complete list of explicit TMDB keyword IDs (hentai, ecchi, sex, nudity, erotic, porn, incest, softcore, etc.)
const EXCLUDE_KEYWORDS = '1228|158718|10244|190370|193026|155477|6111|10014|9799|10013|193855|158546|11158|11159|238541|193025|198385|283145|281298|199214|289295|195669|285672|267122|357518|155301|155535|2943|256466|155691|302868|298666|352503|281741|360081|359980|367629|359981|33841|11792|350503|350708|350360|356759|155139|7344|15197|187522|10053|335048|179178|306202|355344|10178|3182|267340|338679|9194|238374|223035|445|199758|238355|158713|2699|333088|230905|33876|320653|463|244648|350714|161373|162628|163171|162504|158714|156186|340117|341284';

const isSafe = (item: TMDBMovie) => {
  const badWords = [
    'sex', 'sexual', 'naked', 'nudity', 'erotic', 'porn', 'masturbation', 'stripper', 'prostitute', 
    'orgy', 'kama sutra', 'إباحي', 'جنس', 'عاري', 'شذوذ', 'دعارة', 'عاهرة', 'hentai', 'ecchi', 'yaoi', 'yuri', 'eroge',
    'boobs', 'tits', 'nympho', 'softcore', 'hardcore', 'orgasm', 'penis', 'vagina', 'pussy',
    'erotica', 'steamy', 'escort', 'brothel', 'hooker', 'kink', 'bdsm', 'foursome', 'threesome', 'swinger',
    'swingers', 'cuckold', 'voyeur', 'exhibitionist', 'incest', 'incestuous', 'shota', 'loli', 'tentacle', 'ahegao',
    'doujinshi', 'succubus', 'futanari', 'eroge', 'smut', 'nude', 'tayuan', 'vivamax',
    'milf', 'gilf', 'stepmom', 'stepson', 'stepdaughter', 'stepsister', 'stepbrother',
    'seduction', 'seduce', 'wife-swap', 'wifeswap', 'wife swap', 'gangbang', 'blowjob', 'cumshot',
    'dominatrix', 'sexploitation', 'pornstar', 'camgirl', 'porno', 'adult movie', 'adult film',
    'busty', 'seductive', 'horny', 'sexploitation', 'fetish', 'bondage', 'voyeurism'
  ];
  
  const title = (item.title || item.name || '').toLowerCase();
  const overview = (item.overview || '').toLowerCase();
  const originalTitle = (item.original_title || item.original_name || '').toLowerCase();
  
  const text = `${title} ${overview} ${originalTitle}`;
  
  // Use regex with word boundaries to avoid matching "grape" with "rape" or "illustration" with "lust"
  const regex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'i');
  
  return !regex.test(text) && !item.adult;
};

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
  timeout: 10000,
});

// Persistent cache in localStorage for "Instant" feel
const cache = new Map<string, any>();
const CACHE_KEY_PREFIX = 'onyxax_cache_';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCached = async (url: string, config?: any) => {
  // Use clean language code (e.g., 'ar' instead of 'ar-SA')
  const currentLang = localStorage.getItem('i18nextLng') || 'en';
  
  const finalConfig = {
    ...config,
    params: {
      ...config?.params,
      language: config?.params?.language ?? currentLang,
      include_adult: false,
    }
  };

  // Use a safe key string (avoid btoa which fails on non-latin characters)
  const keyParams = JSON.stringify(finalConfig.params);
  const cacheKey = `${CACHE_KEY_PREFIX}${url}_${keyParams}`;
  
  // Try memory cache first
  if (cache.has(cacheKey)) return { data: cache.get(cacheKey) };

  // Try localStorage cache
  try {
    const persistent = localStorage.getItem(cacheKey);
    if (persistent) {
      const { data, timestamp } = JSON.parse(persistent);
      if (Date.now() - timestamp < CACHE_DURATION) {
        cache.set(cacheKey, data);
        return { data };
      }
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  
  const response = await tmdb.get(url, finalConfig);
  
  // Save to both caches
  cache.set(cacheKey, response.data);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: response.data,
      timestamp: Date.now()
    }));
  } catch {
    // If localStorage is full, clear old cache items
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_KEY_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
  
  return response;
};

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

export const prefetchImage = (url: string) => {
  if (!url) return;
  const img = new Image();
  img.src = url;
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

const anilistAdultCache = new Map<string, boolean | null>();

// Real API-level filter using AniList's official `isAdult` flag and tag taxonomy.
// Returns:
//   true  -> AniList confirms the title is safe (isAdult=false, no adult tags)
//   false -> AniList's flag says adult / has Ecchi-Hentai tags
//   null  -> AniList couldn't find the title (undecided, keep item)
const isAniListSafe = async (title: string): Promise<boolean | null> => {
  const key = title.toLowerCase().trim();
  if (!key) return null;
  if (anilistAdultCache.has(key)) return anilistAdultCache.get(key)!;

  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME, isAdult: false) {
          id
          isAdult
          tags { name }
        }
      }
    `;
    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: title }
    });
    const media = response.data?.data?.Media;
    if (!media) {
      anilistAdultCache.set(key, null);
      return null;
    }
    const hasAdultTag = (media.tags || []).some((t: any) =>
      ['Ecchi', 'Hentai', 'Erotica', 'Pornography'].includes(t.name)
    );
    const safe = !media.isAdult && !hasAdultTag;
    anilistAdultCache.set(key, safe);
    return safe;
  } catch {
    anilistAdultCache.set(key, null);
    return null;
  }
};

const filterAnimeWithAniList = async (items: TMDBMovie[]): Promise<TMDBMovie[]> => {
  const CHUNK = 12;
  const safeItems: TMDBMovie[] = [];
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map(async (item) => {
      const verdict = await isAniListSafe(
        item.title || item.name || item.original_title || item.original_name || ''
      );
      // AniList's real flag is authoritative: adult -> exclude. Undecided -> keep.
      if (verdict === false) return null;
      return item;
    }));
    safeItems.push(...results.filter(Boolean) as TMDBMovie[]);
  }
  return safeItems;
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
    return data.results;
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
    return data.results;
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
