import axios from 'axios';

export const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
export const BASE_URL = 'https://api.themoviedb.org/3';

if (!API_KEY) {
  console.error(
    '[Onyxax] VITE_TMDB_API_KEY is missing — copy .env.example to .env and add your TMDB key. The app will show empty lists until this is set.'
  );
}
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
export const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w342';

export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
  timeout: 10000,
});

export const prefetchImage = (url: string) => {
  if (!url) return;
  const img = new Image();
  img.src = url;
};
