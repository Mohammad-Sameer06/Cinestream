import {
  TMDBMovie,
  TMDBTVShow,
  TMDBResponse,
  TMDBGenre,
  TMDBVideo,
  TMDBCredits,
  TMDBSeason,
  TMDBEpisode,
} from "@/types";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = process.env.TMDB_BASE_URL || "https://api.tmdb.org/3";
export const IMAGE_BASE_URL =
  process.env.TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
  revalidate: number = 3600
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value)
  );

  // Reduce maxAttempts to 1 to avoid massive console spam when connection is blocked (e.g. timeout)
  const maxAttempts = 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isClient = typeof window !== "undefined";
      const fetchOptions = isClient ? {} : { next: { revalidate } };
      const res = await fetch(url.toString(), fetchOptions);

      if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
      }

      return res.json() as Promise<T>;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const waitMs = attempt * 250;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw new Error("TMDB fetch failed unexpectedly");
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week"
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/trending/movie/${timeWindow}`);
}

export async function getTrendingAll(
  timeWindow: "day" | "week" = "week"
): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return tmdbFetch(`/trending/all/${timeWindow}`);
}

export async function getTopRatedMovies(): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/movie/top_rated");
}

export async function getPopularMovies(): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/movie/popular");
}

export async function getNowPlayingMovies(): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/movie/now_playing");
}

export async function getUpcomingMovies(): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/movie/upcoming");
}

export async function getMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getMovieDetails(id: number): Promise<TMDBMovie> {
  return tmdbFetch(`/movie/${id}`, {}, 3600 * 6);
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/movie/${id}/credits`, {}, 3600 * 24);
}

export async function getMovieVideos(
  id: number
): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch(`/movie/${id}/videos`, {}, 3600 * 6);
}

export async function getSimilarMovies(
  id: number
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch(`/movie/${id}/similar`);
}

// ─── TV Shows ─────────────────────────────────────────────────────────────────

export async function getTrendingTV(
  timeWindow: "day" | "week" = "week"
): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch(`/trending/tv/${timeWindow}`);
}

export async function getTopRatedTV(): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch("/tv/top_rated");
}

export async function getPopularTV(): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch("/tv/popular");
}

export async function getAiringTodayTV(): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch("/tv/airing_today");
}

export async function getTVShowsByGenre(
  genreId: number,
  page: number = 1
): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch("/discover/tv", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getTVShowDetails(id: number): Promise<TMDBTVShow> {
  return tmdbFetch(`/tv/${id}`, {}, 3600 * 6);
}

export async function getTVShowCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch(`/tv/${id}/credits`, {}, 3600 * 24);
}

export async function getTVShowVideos(
  id: number
): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch(`/tv/${id}/videos`, {}, 3600 * 6);
}

export async function getTVSeasonDetails(
  showId: number,
  seasonNumber: number
): Promise<{ episodes: TMDBEpisode[] } & TMDBSeason> {
  return tmdbFetch(`/tv/${showId}/season/${seasonNumber}`, {}, 3600 * 2);
}

export async function getSimilarTV(
  id: number
): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch(`/tv/${id}/similar`);
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbFetch("/genre/movie/list", {}, 3600 * 24);
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbFetch("/genre/tv/list", {}, 3600 * 24);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchMulti(
  query: string,
  page: number = 1
): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return tmdbFetch("/search/multi", {
    query,
    include_adult: "false",
    page: String(page),
  });
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch("/search/movie", {
    query,
    include_adult: "false",
    page: String(page),
  });
}

export async function searchTV(
  query: string,
  page: number = 1
): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbFetch("/search/tv", {
    query,
    include_adult: "false",
    page: String(page),
  });
}

// ─── Image Helpers ────────────────────────────────────────────────────────────

export function getPosterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
): string {
  if (!path) return "/placeholder-backdrop.svg";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getVidKingMovieUrl(tmdbId: number): string {
  return `${process.env.VIDKING_BASE_URL || "https://www.vidking.net"}/embed/movie/${tmdbId}`;
}

export function getVidKingTVUrl(
  tmdbId: number,
  season: number = 1,
  episode: number = 1
): string {
  return `${process.env.VIDKING_BASE_URL || "https://www.vidking.net"}/embed/tv/${tmdbId}/${season}/${episode}`;
}

export function getMatchPercentage(voteAverage: number): number {
  return Math.round(voteAverage * 10);
}

export function getYear(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear().toString();
}
