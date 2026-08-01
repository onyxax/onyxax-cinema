export interface TMDBBase {
  id: number | string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  poster?: string;
  backdrop_path?: string;
  backdrop?: string;
  type?: 'movie' | 'tv' | 'anime';
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  adult?: boolean;
  overview?: string;
}

export interface TMDBMovie extends TMDBBase {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  media_type?: 'movie' | 'tv' | 'anime';
  genre_ids: number[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  episode_number: number;
  runtime: number;
}

export interface TMDBDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  tagline: string;
  seasons?: TMDBSeason[];
  status?: string;
  budget?: number;
  networks?: { id: number; name: string }[];
  spoken_languages?: { iso_639_1: string; english_name?: string; name?: string }[];
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification?: string }[] }[] };
  content_ratings?: { results: { iso_3166_1: string; rating?: string }[] };
  translations?: {
    translations: {
      iso_639_1?: string;
      iso_3166_1?: string;
      data?: { title?: string; overview?: string; homepage?: string };
    }[];
  };
}

export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  iso_639_1?: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBImagesResponse {
  backdrops: TMDBImage[];
  logos: TMDBImage[];
  posters: TMDBImage[];
}

export interface WatchProgress extends TMDBBase {
  id: string;
  type: 'movie' | 'tv';
  watched: number;
  duration: number;
  last_updated: number;
  season?: string;
  episode?: string;
}
