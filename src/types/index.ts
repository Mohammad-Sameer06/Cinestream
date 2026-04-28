export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: TMDBGenre[];
  adult: boolean;
  popularity: number;
  media_type?: string;
  runtime?: number;
  tagline?: string;
  status?: string;
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { name: string }[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: TMDBGenre[];
  adult: boolean;
  popularity: number;
  media_type?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime: number | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: { id: number; name: string; job: string; profile_path: string | null }[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type TMDBMedia = TMDBMovie | TMDBTVShow;
export type MediaType = "movie" | "tv";

export interface TMDBVideoResults {
  results: TMDBVideo[];
}

export type MediaItem = TMDBMedia & {
  media_type: MediaType;
};

export interface WatchlistItem {
  id: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  poster: string | null;
  addedAt: string;
}

export interface ContinueWatchingItem {
  id: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  poster: string | null;
  progress: number;
  duration: number;
  season?: number | null;
  episode?: number | null;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarIndex: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
}
