import { Metadata } from "next";
import {
  getTrendingAll,
  getTrendingTV,
  getTopRatedMovies,
  getPopularTV,
  getNowPlayingMovies,
  getAiringTodayTV,
  getMoviesByGenre,
  getTVShowsByGenre,
} from "@/lib/tmdb";
import BrowseClient from "./BrowseClient";

export const metadata: Metadata = {
  title: "Browse — CineStream",
  description: "Discover trending movies and TV shows on CineStream.",
};

export const dynamic = "force-dynamic";

const EMPTY_RESULTS = { results: [] };

export default async function BrowsePage() {
  const [
    trendingAll,
    trendingTV,
    topRatedMovies,
    popularTV,
    nowPlaying,
    airingToday,
    actionMovies,
    comedyMovies,
    horrorMovies,
    dramaTV,
    scifiMovies,
  ] = await Promise.all([
    getTrendingAll("week").catch(() => EMPTY_RESULTS),
    getTrendingTV("week").catch(() => EMPTY_RESULTS),
    getTopRatedMovies().catch(() => EMPTY_RESULTS),
    getPopularTV().catch(() => EMPTY_RESULTS),
    getNowPlayingMovies().catch(() => EMPTY_RESULTS),
    getAiringTodayTV().catch(() => EMPTY_RESULTS),
    getMoviesByGenre(28).catch(() => EMPTY_RESULTS), // Action
    getMoviesByGenre(35).catch(() => EMPTY_RESULTS), // Comedy
    getMoviesByGenre(27).catch(() => EMPTY_RESULTS), // Horror
    getTVShowsByGenre(18).catch(() => EMPTY_RESULTS), // Drama TV
    getMoviesByGenre(878).catch(() => EMPTY_RESULTS), // Sci-Fi
  ]);

  const rows = [
    { title: "Trending Now", items: trendingAll.results.slice(0, 18), mediaType: "mixed" as const },
    { title: "Now Playing in Cinemas", items: nowPlaying.results.slice(0, 18), mediaType: "movie" as const },
    { title: "Top Rated Movies", items: topRatedMovies.results.slice(0, 18), mediaType: "movie" as const },
    { title: "Trending TV Shows", items: trendingTV.results.slice(0, 18), mediaType: "tv" as const },
    { title: "Popular TV Shows", items: popularTV.results.slice(0, 18), mediaType: "tv" as const },
    { title: "Airing Today", items: airingToday.results.slice(0, 18), mediaType: "tv" as const },
    { title: "Action & Adventure", items: actionMovies.results.slice(0, 18), mediaType: "movie" as const },
    { title: "Comedies", items: comedyMovies.results.slice(0, 18), mediaType: "movie" as const },
    { title: "Horror Movies", items: horrorMovies.results.slice(0, 18), mediaType: "movie" as const },
    { title: "Drama Series", items: dramaTV.results.slice(0, 18), mediaType: "tv" as const },
    { title: "Sci-Fi & Fantasy", items: scifiMovies.results.slice(0, 18), mediaType: "movie" as const },
  ];

  const heroItems = trendingAll.results.slice(0, 8).map((item) => ({
    ...item,
    media_type: ("media_type" in item ? item.media_type : "title" in item ? "movie" : "tv") as "movie" | "tv",
  }));

  return <BrowseClient heroItems={heroItems} rows={rows} />;
}
