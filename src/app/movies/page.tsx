import { Metadata } from "next";

import {
  getMoviesByGenre,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
} from "@/lib/tmdb";
import { MediaItem, TMDBMovie, TMDBResponse } from "@/types";
import MoviesClient from "./MoviesClient";

export const metadata: Metadata = {
  title: "Movies - CineStream",
  description: "Watch the latest movies in HD on CineStream.",
};

export const dynamic = "force-dynamic";

const EMPTY_RESULTS: TMDBResponse<TMDBMovie> = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

export default async function MoviesPage() {
  const [
    popular,
    topRated,
    nowPlaying,
    upcoming,
    action,
    comedy,
    horror,
    scifi,
    thriller,
    romance,
  ] = await Promise.all([
    getPopularMovies().catch(() => EMPTY_RESULTS),
    getTopRatedMovies().catch(() => EMPTY_RESULTS),
    getNowPlayingMovies().catch(() => EMPTY_RESULTS),
    getUpcomingMovies().catch(() => EMPTY_RESULTS),
    getMoviesByGenre(28).catch(() => EMPTY_RESULTS),
    getMoviesByGenre(35).catch(() => EMPTY_RESULTS),
    getMoviesByGenre(27).catch(() => EMPTY_RESULTS),
    getMoviesByGenre(878).catch(() => EMPTY_RESULTS),
    getMoviesByGenre(53).catch(() => EMPTY_RESULTS),
    getMoviesByGenre(10749).catch(() => EMPTY_RESULTS),
  ]);

  const rows = [
    { title: "Popular Movies", items: popular.results, mediaType: "movie" as const },
    { title: "Top Rated", items: topRated.results, mediaType: "movie" as const },
    { title: "Now Playing", items: nowPlaying.results, mediaType: "movie" as const },
    { title: "Coming Soon", items: upcoming.results, mediaType: "movie" as const },
    { title: "Action", items: action.results, mediaType: "movie" as const },
    { title: "Comedy", items: comedy.results, mediaType: "movie" as const },
    { title: "Horror", items: horror.results, mediaType: "movie" as const },
    { title: "Sci-Fi", items: scifi.results, mediaType: "movie" as const },
    { title: "Thriller", items: thriller.results, mediaType: "movie" as const },
    { title: "Romance", items: romance.results, mediaType: "movie" as const },
  ];

  const heroItems: MediaItem[] = popular.results.slice(0, 8).map((item) => ({
    ...item,
    media_type: "movie",
  }));

  return <MoviesClient heroItems={heroItems} rows={rows} />;
}
