import { Metadata } from "next";

import {
  getAiringTodayTV,
  getPopularTV,
  getTopRatedTV,
  getTVShowsByGenre,
} from "@/lib/tmdb";
import { MediaItem, TMDBResponse, TMDBTVShow } from "@/types";
import TVClient from "./TVClient";

export const metadata: Metadata = {
  title: "TV Shows - CineStream",
  description: "Stream the best TV shows on CineStream.",
};

export const dynamic = "force-dynamic";

const EMPTY_RESULTS: TMDBResponse<TMDBTVShow> = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

export default async function TVPage() {
  const [
    popular,
    topRated,
    airingToday,
    drama,
    comedy,
    action,
    scifi,
    crime,
    reality,
    animation,
  ] = await Promise.all([
    getPopularTV().catch(() => EMPTY_RESULTS),
    getTopRatedTV().catch(() => EMPTY_RESULTS),
    getAiringTodayTV().catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(18).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(35).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(10759).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(10765).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(80).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(10764).catch(() => EMPTY_RESULTS),
    getTVShowsByGenre(16).catch(() => EMPTY_RESULTS),
  ]);

  const rows = [
    { title: "Popular TV Shows", items: popular.results, mediaType: "tv" as const },
    { title: "Top Rated", items: topRated.results, mediaType: "tv" as const },
    { title: "Airing Today", items: airingToday.results, mediaType: "tv" as const },
    { title: "Drama", items: drama.results, mediaType: "tv" as const },
    { title: "Comedy", items: comedy.results, mediaType: "tv" as const },
    { title: "Action and Adventure", items: action.results, mediaType: "tv" as const },
    { title: "Sci-Fi and Fantasy", items: scifi.results, mediaType: "tv" as const },
    { title: "Crime", items: crime.results, mediaType: "tv" as const },
    { title: "Reality", items: reality.results, mediaType: "tv" as const },
    { title: "Animation", items: animation.results, mediaType: "tv" as const },
  ];

  const heroItems: MediaItem[] = popular.results.slice(0, 8).map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return <TVClient heroItems={heroItems} rows={rows} />;
}
