"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Share2,
  Sparkles,
  Star,
  Tv2,
} from "lucide-react";
import { toast } from "sonner";

import VidKingPlayer from "@/components/player/VidKingPlayer";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb";

interface SeasonOption {
  seasonNumber: number;
  name: string;
  episodeCount: number;
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

interface WatchPageClientProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  backdropPath: string | null;
  overview: string;
  releaseLabel: string;
  rating: number;
  genres: string[];
  runtimeLabel: string | null;
  season?: number;
  episode?: number;
  seasons?: number;
  seasonOptions?: SeasonOption[];
  currentSeasonName?: string;
  initialEpisodes?: EpisodeSummary[];
}

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function WatchPageClient({
  tmdbId,
  mediaType,
  title,
  poster,
  backdropPath,
  overview,
  releaseLabel,
  rating,
  genres,
  runtimeLabel,
  season: initialSeason = 1,
  episode: initialEpisode = 1,
  seasons = 1,
  seasonOptions = [],
  currentSeasonName: initialSeasonName,
  initialEpisodes = [],
}: WatchPageClientProps) {
  const router = useRouter();
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [copying, setCopying] = useState(false);
  const [loadedSeason, setLoadedSeason] = useState(initialSeason);
  const [seasonName, setSeasonName] = useState(
    initialSeasonName ?? `Season ${initialSeason}`
  );
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>(initialEpisodes);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState("");

  const isTV = mediaType === "tv";

  const episodeCap = useMemo(() => {
    if (episodes.length > 0) return episodes.length;
    return (
      seasonOptions.find((option) => option.seasonNumber === currentSeason)
        ?.episodeCount ?? 1
    );
  }, [currentSeason, episodes.length, seasonOptions]);

  const activeEpisode = useMemo(
    () => episodes.find((episode) => episode.episodeNumber === currentEpisode) ?? null,
    [currentEpisode, episodes]
  );

  useEffect(() => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("type", mediaType);

    if (isTV) {
      nextUrl.searchParams.set("season", String(currentSeason));
      nextUrl.searchParams.set("episode", String(currentEpisode));
    } else {
      nextUrl.searchParams.delete("season");
      nextUrl.searchParams.delete("episode");
    }

    window.history.replaceState({}, "", nextUrl.toString());
  }, [currentEpisode, currentSeason, isTV, mediaType]);

  useEffect(() => {
    if (!isTV || currentSeason === loadedSeason) return;

    const controller = new AbortController();

    const loadEpisodes = async () => {
      setEpisodesLoading(true);
      setEpisodesError("");

      try {
        const response = await fetch(
          `/api/player/season?showId=${tmdbId}&season=${currentSeason}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Could not load season episodes");
        }

        const data = (await response.json()) as {
          seasonNumber: number;
          name: string;
          episodes: EpisodeSummary[];
        };

        setEpisodes(data.episodes);
        setSeasonName(data.name || `Season ${currentSeason}`);
        setLoadedSeason(data.seasonNumber);
        setCurrentEpisode((value) =>
          clamp(value, 1, Math.max(data.episodes.length, 1))
        );
      } catch {
        if (controller.signal.aborted) return;
        setEpisodes([]);
        setEpisodesError("Could not load the season guide.");
        setLoadedSeason(currentSeason);
      } finally {
        if (!controller.signal.aborted) {
          setEpisodesLoading(false);
        }
      }
    };

    void loadEpisodes();

    return () => controller.abort();
  }, [currentSeason, isTV, loadedSeason, tmdbId]);

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Watch link copied");
    } catch {
      toast.error("Could not copy the watch link");
    } finally {
      setCopying(false);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((value) => value - 1);
      return;
    }

    if (currentSeason > 1) {
      const nextSeason = currentSeason - 1;
      setCurrentSeason(nextSeason);
      setCurrentEpisode(1);
      setLoadedSeason(0);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisode >= episodeCap) return;
    setCurrentEpisode((value) => value + 1);
  };

  const posterUrl = poster ? getPosterUrl(poster, "w500") : "/placeholder-poster.svg";
  const backdropUrl = backdropPath
    ? getBackdropUrl(backdropPath, "original")
    : "/placeholder-backdrop.svg";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080d] text-white">
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover object-center opacity-[0.26]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(4,6,10,0.76),rgba(5,8,13,0.96))]" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="fixed inset-x-0 top-0 z-[100] border-b border-white/[0.06] bg-[rgba(4,6,10,0.72)] backdrop-blur-xl"
      >
        <div className="content-wrap flex h-[4.5rem] items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative hidden h-14 w-10 overflow-hidden rounded-xl border border-white/10 sm:block">
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/[0.38]">
                Theater Mode
              </p>
              <h1 className="truncate text-base font-semibold text-white sm:text-lg">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              aria-label="Share this watch link"
            >
              {copying ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/title/${mediaType}/${tmdbId}`)}
              className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
              aria-label="View title details"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="content-wrap relative z-10 pb-12 pt-24">

        <div className={`grid gap-6 ${isTV ? "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
          <div className="flex flex-col gap-6 min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.04 }}
            className="page-panel overflow-hidden p-3 md:p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-end gap-3 px-2">
              {isTV && (
                <div className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/[0.66]">
                  {seasonName} - Episode {currentEpisode}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
              <div className="aspect-video w-full">
                <VidKingPlayer
                  tmdbId={tmdbId}
                  mediaType={mediaType}
                  season={currentSeason}
                  episode={currentEpisode}
                  title={title}
                  poster={poster}
                />
              </div>
            </div>
          </motion.section>

            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.12 }}
              className="page-panel p-5 md:p-6"
            >
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              
              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-white/[0.72]">
                <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5">
                  {isTV ? <Tv2 size={14} /> : <Clapperboard size={14} />}
                  {isTV ? "Series" : "Movie"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5">
                  <Star size={14} className="fill-current text-amber-300" />
                  {rating ? rating.toFixed(1) : "N/A"}
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5">
                  {releaseLabel}
                </span>
                {runtimeLabel && (
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5">
                    {runtimeLabel}
                  </span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span key={genre} className="genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {activeEpisode ? (
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/[0.4]">
                    Current Episode
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Episode {activeEpisode.episodeNumber}: {activeEpisode.name}
                  </p>
                  {activeEpisode.overview && (
                    <p className="mt-2 text-sm leading-6 text-white/[0.56]">
                      {activeEpisode.overview}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-6 text-sm leading-relaxed text-white/[0.65]">
                  {overview || "No description available."}
                </p>
              )}
            </motion.aside>
          </div>

          {isTV && (
            <div className="space-y-6">
              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.08 }}
                className="page-panel p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Episode Guide</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      {seasonName}
                    </h2>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/[0.6]">
                    {episodeCap} episodes
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-white/[0.4]">
                    Season
                    <select
                      value={currentSeason}
                      onChange={(event) => {
                        const nextSeason = Number(event.target.value);
                        setCurrentSeason(nextSeason);
                        setCurrentEpisode(1);
                        setLoadedSeason(0);
                      }}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3 text-sm text-white outline-none"
                    >
                      {Array.from({ length: seasons }, (_, index) => index + 1).map((seasonNumber) => {
                        const seasonLabel =
                          seasonOptions.find((option) => option.seasonNumber === seasonNumber)
                            ?.name ?? `Season ${seasonNumber}`;
                        return (
                          <option
                            key={seasonNumber}
                            value={seasonNumber}
                            className="bg-[#070b12] text-white"
                          >
                            {seasonLabel}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handlePrevEpisode}
                    disabled={currentSeason === 1 && currentEpisode === 1}
                    className="inline-flex h-[50px] w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1] disabled:opacity-25"
                    aria-label="Previous episode"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextEpisode}
                    disabled={currentEpisode >= episodeCap}
                    className="inline-flex h-[50px] w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1] disabled:opacity-25"
                    aria-label="Next episode"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-5">
                  {episodesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton h-[4.5rem] rounded-lg" />
                      ))}
                    </div>
                  ) : episodesError ? (
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/[0.58]">
                      {episodesError}
                    </div>
                  ) : episodes.length > 0 ? (
                    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                      {episodes.map((episodeItem) => {
                        const isActive = episodeItem.episodeNumber === currentEpisode;
                        return (
                          <button
                            key={episodeItem.id}
                            type="button"
                            onClick={() => setCurrentEpisode(episodeItem.episodeNumber)}
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              isActive
                                ? "border-[var(--cs-red)] bg-[rgba(255,77,54,0.12)]"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative hidden h-14 w-24 overflow-hidden rounded-lg border border-white/10 sm:block">
                                <Image
                                  src={
                                    episodeItem.stillPath
                                      ? getBackdropUrl(episodeItem.stillPath, "w780")
                                      : backdropUrl
                                  }
                                  alt={episodeItem.name}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="line-clamp-1 text-sm font-semibold text-white">
                                    Episode {episodeItem.episodeNumber}
                                  </p>
                                  {episodeItem.runtime && (
                                    <span className="text-xs text-white/[0.44]">
                                      {formatRuntime(episodeItem.runtime)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-1 text-sm text-white/[0.72]">
                                  {episodeItem.name}
                                </p>
                                {episodeItem.overview && (
                                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/[0.46]">
                                    {episodeItem.overview}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/[0.58]">
                      Episode details are not available for this season yet.
                    </div>
                  )}
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
