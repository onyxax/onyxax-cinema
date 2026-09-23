import { useEffect, useState } from 'react';
import type { TMDBDetails } from '../types/tmdb';
import { fetchDetails, fetchVideos, fetchImages, LOGO_BASE_URL } from '../services/tmdb';

interface PreviewData {
  details: TMDBDetails | null;
  logoPath: string | null;
  trailerKey: string | null;
  isLoading: boolean;
}

export function usePreviewData(id: string | number | undefined, type: 'movie'|'tv'|'anime' | undefined, enabled: boolean): PreviewData {
  const [details, setDetails] = useState<TMDBDetails | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !id || !type) return;
    let cancelled = false;
    setIsLoading(true);

    const load = async () => {
      try {
        const [det, vids, imgs] = await Promise.all([
          fetchDetails(id, type),
          fetchVideos(id, type),
          fetchImages(id, type),
        ]);
        if (cancelled) return;
        setDetails(det);
        const logo = imgs.logos?.find(l => l.iso_639_1 === 'en') || imgs.logos?.[0];
        setLogoPath(logo?.file_path || null);
        const trailer = (vids as any[])?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || (vids as any[])?.[0];
        setTrailerKey(trailer?.key || null);
      } catch {
        if (!cancelled) {
          setDetails(null);
          setLogoPath(null);
          setTrailerKey(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, type, enabled]);

  return { details, logoPath, trailerKey, isLoading };
}

export { LOGO_BASE_URL };
