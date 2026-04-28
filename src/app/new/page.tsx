import { Metadata } from "next";

import { getTopRatedMovies, getTopRatedTV, getTrendingAll } from "@/lib/tmdb";
import { MediaItem, TMDBMedia, TMDBResponse } from "@/types";
import NewPopularClient from "./NewPopularClient";

export const metadata: Metadata = {
  title: "New and Popular - CineStream",
  description: "Discover what's trending and top rated on CineStream.",
};

export const dynamic = "force-dynamic";

const EMPTY_RESULTS: TMDBResponse<TMDBMedia> = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

export default async function NewPopularPage() {
  const [trendingDay, topMovies, topTV] = await Promise.all([
    getTrendingAll("day").catch(() => EMPTY_RESULTS),
    getTopRatedMovies().catch(() => EMPTY_RESULTS),
    getTopRatedTV().catch(() => EMPTY_RESULTS),
  ]);

  const rows = [
    { title: "Trending Today", items: trendingDay.results, mediaType: "mixed" as const },
    { title: "Top Rated Movies", items: topMovies.results, mediaType: "movie" as const },
    { title: "Top Rated TV Shows", items: topTV.results, mediaType: "tv" as const },
  ];

  const heroItems: MediaItem[] = trendingDay.results.slice(0, 8).map((item) => ({
    ...item,
    media_type:
      "media_type" in item && item.media_type
        ? (item.media_type as MediaItem["media_type"])
        : "title" in item
          ? "movie"
          : "tv",
  }));

  return <NewPopularClient heroItems={heroItems} rows={rows} />;
}
