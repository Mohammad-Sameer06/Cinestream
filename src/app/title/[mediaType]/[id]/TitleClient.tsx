"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock3,
  Play,
  Plus,
  Sparkles,
  Star,
  Tv2,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb";
import { MediaType, TMDBCredits, TMDBMedia, TMDBMovie, TMDBResponse, TMDBVideoResults } from "@/types";
import { useProfileStore } from "@/store/profileStore";
import { useWatchlistStore } from "@/store/watchlistStore";

interface TitleClientProps {
  details: TMDBMedia;
  videos: TMDBVideoResults;
  credits: TMDBCredits;
  similar: TMDBResponse<TMDBMedia>;
  mediaType: MediaType;
}

function isMovie(details: TMDBMedia): details is TMDBMovie {
  return "title" in details;
}

function formatRuntime(minutes?: number): string {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}

export default function TitleClient({
  details,
  videos,
  credits,
  similar,
  mediaType,
}: TitleClientProps) {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { addItem, removeItem, isInList } = useWatchlistStore();
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const meta = useMemo(() => {
    const title = isMovie(details) ? details.title : details.name;
    const year = isMovie(details)
      ? details.release_date?.slice(0, 4)
      : details.first_air_date?.slice(0, 4);
    const runtime = isMovie(details)
      ? formatRuntime(details.runtime)
      : `${details.number_of_seasons ?? 1} Season${details.number_of_seasons === 1 ? "" : "s"}`;

    return {
      title,
      year,
      runtime,
      backdrop: getBackdropUrl(details.backdrop_path || details.poster_path, "original"),
      poster: getPosterUrl(details.poster_path, "w500"),
      genres: details.genres ?? [],
      score: details.vote_average ? details.vote_average.toFixed(1) : "N/A",
    };
  }, [details]);

  const trailer = videos.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );
  const cast = credits.cast.slice(0, 8);
  const similarTitles = similar.results.slice(0, 12);
  const inList = isInList(details.id, mediaType);

  const handlePlay = () => {
    if (mediaType === "movie") {
      router.push(`/watch/${details.id}?type=movie`);
      return;
    }

    router.push(`/watch/${details.id}?type=tv&season=1&episode=1`);
  };

  const handleWatchlist = async () => {
    if (!activeProfile) {
      toast.error("Select a profile first");
      return;
    }

    setWatchlistLoading(true);

    try {
      if (inList) {
        await axios.delete(
          `/api/watchlist?profileId=${activeProfile.id}&tmdbId=${details.id}&mediaType=${mediaType}`
        );
        removeItem(details.id, mediaType);
        toast.success("Removed from My List");
      } else {
        const response = await axios.post("/api/watchlist", {
          profileId: activeProfile.id,
          tmdbId: details.id,
          mediaType,
          title: meta.title,
          poster: details.poster_path,
        });

        addItem({
          id: response.data.id,
          tmdbId: details.id,
          mediaType,
          title: meta.title,
          poster: details.poster_path,
          addedAt: new Date().toISOString(),
        });
        toast.success("Added to My List");
      }
    } catch {
      toast.error("Could not update your list");
    } finally {
      setWatchlistLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cs-dark)] text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={meta.backdrop}
            alt={meta.title}
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/84 to-[#090b10]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/20 to-[#090b10]/50" />
        </div>

        <div className="content-wrap relative z-10 grid min-h-[88vh] items-end gap-10 pb-12 pt-28 lg:grid-cols-[320px_minmax(0,1fr)] lg:pb-18">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="page-panel hidden overflow-hidden p-3 lg:block"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-[18px] border border-white/10">
              <Image
                src={meta.poster}
                alt={meta.title}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="max-w-4xl"
          >
            <div className="section-eyebrow">
              <Sparkles size={14} className="text-[var(--cs-red)]" />
              {mediaType === "movie" ? "Featured Film" : "Featured Series"}
            </div>

            <h1
              className="mt-5 text-4xl font-black leading-none text-white sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "var(--cs-display-font)" }}
            >
              {meta.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm text-white/[0.75]">
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <Calendar size={14} />
                {meta.year || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <Clock3 size={14} />
                {meta.runtime}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-amber-300">
                <Star size={14} className="fill-current" />
                {meta.score}
              </span>
              <Badge
                variant="outline"
                className="border-white/14 bg-white/[0.06] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-white"
              >
                {mediaType === "movie" ? "Movie" : "Series"}
              </Badge>
            </div>

            {meta.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {meta.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/[0.72] sm:text-base">
              {details.overview || "No overview is available for this title yet."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={handlePlay} className="btn-primary">
                <Play size={18} fill="currentColor" />
                Play
              </button>
              <button
                type="button"
                onClick={handleWatchlist}
                disabled={watchlistLoading}
                className="btn-secondary"
              >
                {inList ? <Check size={18} /> : <Plus size={18} />}
                {inList ? "In My List" : "Add to My List"}
              </button>
              {trailer && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank", "noopener,noreferrer")
                  }
                  className="btn-secondary"
                >
                  <Tv2 size={18} />
                  Watch Trailer
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="content-wrap space-y-14 pb-24">
        {cast.length > 0 && (
          <section className="space-y-5">
            <div>
              <p className="section-eyebrow">Cast</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Starring</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cast.map((person) => (
                <article
                  key={person.id}
                  className="page-panel flex items-center gap-4 p-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
                    {person.profile_path ? (
                      <Image
                        src={getPosterUrl(person.profile_path, "w185")}
                        alt={person.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl font-semibold text-white/70">
                        {person.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{person.name}</p>
                    <p className="mt-1 truncate text-sm text-white/[0.48]">{person.character}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {similarTitles.length > 0 && (
          <section className="space-y-5">
            <div>
              <p className="section-eyebrow">Discover More</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                More like this
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {similarTitles.map((titleItem) => {
                const similarType: MediaType =
                  "media_type" in titleItem && titleItem.media_type
                    ? (titleItem.media_type as MediaType)
                    : "title" in titleItem
                      ? "movie"
                      : "tv";
                const similarTitle =
                  "title" in titleItem ? titleItem.title : titleItem.name;

                return (
                  <button
                    key={`${similarTitle}-${titleItem.id}`}
                    type="button"
                    onClick={() => router.push(`/title/${similarType}/${titleItem.id}`)}
                    className="group text-left"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                      <Image
                        src={getPosterUrl(titleItem.poster_path, "w500")}
                        alt={similarTitle}
                        fill
                        sizes="240px"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/24 to-transparent" />
                    </div>
                    <div className="mt-3">
                      <p className="line-clamp-1 text-sm font-semibold text-white">
                        {similarTitle}
                      </p>
                      <p className="mt-1 text-xs text-white/[0.48]">
                        {Math.round((titleItem.vote_average || 0) * 10)}% Match
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
