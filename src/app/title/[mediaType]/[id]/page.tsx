import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getSimilarMovies,
  getSimilarTV,
  getTVShowCredits,
  getTVShowDetails,
  getTVShowVideos,
} from "@/lib/tmdb";
import {
  MediaType,
  TMDBCredits,
  TMDBMedia,
  TMDBResponse,
  TMDBVideoResults,
} from "@/types";
import TitleClient from "./TitleClient";

type TitlePageParams = Promise<{ mediaType: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: TitlePageParams;
}): Promise<Metadata> {
  const { mediaType } = await params;

  return {
    title: mediaType === "movie" ? "Movie Details - CineStream" : "TV Details - CineStream",
  };
}

export default async function TitlePage({
  params,
}: {
  params: TitlePageParams;
}) {
  const { mediaType, id } = await params;
  const numId = Number.parseInt(id, 10);

  if (
    !mediaType ||
    !id ||
    Number.isNaN(numId) ||
    (mediaType !== "movie" && mediaType !== "tv")
  ) {
    notFound();
  }

  const resolvedType = mediaType as MediaType;

  let details: TMDBMedia;
  let videos: TMDBVideoResults;
  let credits: TMDBCredits;
  let similar: TMDBResponse<TMDBMedia>;

  try {
    [details, videos, credits, similar] = await Promise.all([
      resolvedType === "movie" ? getMovieDetails(numId) : getTVShowDetails(numId),
      resolvedType === "movie" ? getMovieVideos(numId) : getTVShowVideos(numId),
      resolvedType === "movie" ? getMovieCredits(numId) : getTVShowCredits(numId),
      resolvedType === "movie" ? getSimilarMovies(numId) : getSimilarTV(numId),
    ]);
  } catch {
    return (
      <main className="min-h-screen bg-[var(--cs-dark)] text-white">
        <div className="content-wrap flex min-h-screen items-center justify-center py-16">
          <div className="page-panel max-w-xl px-8 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              Playback Catalog
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              We could not load this title
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/[0.62]">
              The details service is unavailable right now. Please try again in a
              moment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <TitleClient
      details={details}
      videos={videos}
      credits={credits}
      similar={similar}
      mediaType={resolvedType}
    />
  );
}
