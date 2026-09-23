import axios from 'axios';
import type { TMDBMovie } from '../../types/tmdb';

const anilistAdultCache = new Map<string, boolean | null>();

export async function isAniListSafe(title: string): Promise<boolean | null> {
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
    const response = await axios.post('https://graphql.anilist.co', { query, variables: { search: title } });
    const media = response.data?.data?.Media;
    if (!media) { anilistAdultCache.set(key, null); return null; }
    const hasAdultTag = (media.tags || []).some((t: any) => ['Ecchi', 'Hentai', 'Erotica', 'Pornography'].includes(t.name));
    const safe = !media.isAdult && !hasAdultTag;
    anilistAdultCache.set(key, safe);
    return safe;
  } catch { anilistAdultCache.set(key, null); return null; }
}

export async function filterAnimeWithAniList(items: TMDBMovie[]): Promise<TMDBMovie[]> {
  const CHUNK = 12;
  const safeItems: TMDBMovie[] = [];
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map(async (item) => {
      const verdict = await isAniListSafe(item.title || item.name || (item as any).original_title || (item as any).original_name || '');
      if (verdict === false) return null;
      return item;
    }));
    safeItems.push(...(results.filter(Boolean) as TMDBMovie[]));
  }
  return safeItems;
}

export async function fetchAniListId(title: string): Promise<number | null> {
  try {
    const query = `query ($search: String) { Media (search: $search, type: ANIME) { id } }`;
    const response = await axios.post('https://graphql.anilist.co', { query, variables: { search: title } });
    return response.data.data.Media.id ?? null;
  } catch { return null; }
}
