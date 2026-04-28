import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getMovieDetails,
  getTVSeasonDetails,
  getTVShowDetails,
} from "@/lib/tmdb";
import { MediaType, TMDBEpisode, TMDBSeason } from "@/types";
import WatchPageClient from "./WatchPageClient";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ movieId: string }>;
  searchParams: Promise<{
    type?: string;
    season?: string;
    episode?: string;
  }>;
}

interface EpisodeSummary {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
  airDate: string;
  stillPath: string | null;
}

interface SeasonOption {
  seasonNumber: number;
  name: string;
  episodeCount: number;
}

type WatchClientData =
  | {
      tmdbId: number;
      mediaType: "movie";
      title: string;
      poster: string | null;
      backdropPath: string | null;
      overview: string;
      releaseLabel: string;
      rating: number;
      genres: string[];
      runtimeLabel: string | null;
    }
  | {
      tmdbId: number;
      mediaType: "tv";
      title: string;
      poster: string | null;
      backdropPath: string | null;
      overview: string;
      releaseLabel: string;
      rating: number;
      genres: string[];
      runtimeLabel: string | null;
      season: number;
      episode: number;
      seasons: number;
      seasonOptions: SeasonOption[];
      currentSeasonName: string;
      initialEpisodes: EpisodeSummary[];
    };

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSeasonOptions(seasons?: TMDBSeason[]): SeasonOption[] {
  return (
    seasons
      ?.filter((season) => season.season_number > 0)
      .map((season) => ({
        seasonNumber: season.season_number,
        name: season.name,
        episodeCount: season.episode_count,
      })) ?? []
  );
}

function buildEpisodes(episodes?: TMDBEpisode[]): EpisodeSummary[] {
  return (
    episodes?.map((episode) => ({
      id: episode.id,
      episodeNumber: episode.episode_number,
      name: episode.name,
      overview: episode.overview,
      runtime: episode.runtime,
      airDate: episode.air_date,
      stillPath: episode.still_path,
    })) ?? []
  );
}

async function getMovieWatchData(id: number): Promise<WatchClientData> {
  const movie = await getMovieDetails(id);

  return {
    tmdbId: id,
    mediaType: "movie",
    title: movie.title,
    poster: movie.poster_path,
    backdropPath: movie.backdrop_path,
    overview: movie.overview,
    releaseLabel: movie.release_date?.slice(0, 4) || "N/A",
    rating: movie.vote_average,
    genres: (movie.genres ?? []).map((genre) => genre.name),
    runtimeLabel: movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : null,
  };
}

async function getTVWatchData(
  id: number,
  seasonParam: string | undefined,
  episodeParam: string | undefined
): Promise<WatchClientData> {
  const show = await getTVShowDetails(id);
  const seasonOptions = buildSeasonOptions(show.seasons);
  const requestedSeason = clamp(
    parsePositiveInt(seasonParam, 1),
    1,
    Math.max(show.number_of_seasons ?? 1, 1)
  );

  const seasonDetails = await getTVSeasonDetails(id, requestedSeason).catch(
    () => null
  );

  const fallbackEpisodeCount =
    seasonOptions.find((item) => item.seasonNumber === requestedSeason)
      ?.episodeCount ?? 1;
  const episodeCount = Math.max(
    seasonDetails?.episodes.length ?? fallbackEpisodeCount,
    1
  );
  const requestedEpisode = clamp(
    parsePositiveInt(episodeParam, 1),
    1,
    episodeCount
  );

  return {
    tmdbId: id,
    mediaType: "tv",
    title: show.name,
    poster: show.poster_path,
    backdropPath: show.backdrop_path,
    overview: show.overview,
    releaseLabel: show.first_air_date?.slice(0, 4) || "N/A",
    rating: show.vote_average,
    genres: (show.genres ?? []).map((genre) => genre.name),
    runtimeLabel: show.number_of_seasons
      ? `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? "s" : ""}`
      : null,
    season: requestedSeason,
    episode: requestedEpisode,
    seasons: Math.max(show.number_of_seasons ?? 1, 1),
    seasonOptions,
    currentSeasonName: seasonDetails?.name ?? `Season ${requestedSeason}`,
    initialEpisodes: buildEpisodes(seasonDetails?.episodes),
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const { movieId } = await params;
  const { type = "movie" } = await searchParams;
  const id = Number.parseInt(movieId, 10);

  try {
    if (type === "movie") {
      const movie = await getMovieDetails(id);
      return {
        title: `Watch ${movie.title}`,
        description: movie.overview,
      };
    }

    const show = await getTVShowDetails(id);
    return {
      title: `Watch ${show.name}`,
      description: show.overview,
    };
  } catch {
    return { title: "Watch CineStream" };
  }
}

export default async function WatchPage({
  params,
  searchParams,
}: WatchPageProps) {
  const { movieId } = await params;
  const { type = "movie", season = "1", episode = "1" } = await searchParams;
  const id = Number.parseInt(movieId, 10);

  if (Number.isNaN(id) || (type !== "movie" && type !== "tv")) {
    notFound();
  }

  const mediaType = type as MediaType;

  let data: WatchClientData;

  try {
    data =
      mediaType === "movie"
        ? await getMovieWatchData(id)
        : await getTVWatchData(id, season, episode);
  } catch {
    notFound();
  }

  return <WatchPageClient {...data} />;
}
