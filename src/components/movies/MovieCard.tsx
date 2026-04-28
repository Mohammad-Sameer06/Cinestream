"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Play,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { getBackdropUrl, getPosterUrl, getYear } from "@/lib/tmdb";
import { MediaType } from "@/types";
import { useProfileStore } from "@/store/profileStore";
import { useWatchlistStore } from "@/store/watchlistStore";

interface MovieCardItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface MovieCardProps {
  item: MovieCardItem;
  mediaType: MediaType;
  cardWidth?: number;
  hoverDirection?: "up" | "down";
}

export default function MovieCard({
  item,
  mediaType,
  cardWidth = 220,
  hoverDirection = "down",
}: MovieCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { activeProfile } = useProfileStore();
  const { addItem, removeItem, isInList } = useWatchlistStore();

  const [hovered, setHovered] = useState(false);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const title = mediaType === "movie" ? item.title ?? item.name : item.name ?? item.title;
  const year = mediaType === "movie"
    ? getYear(item.release_date)
    : getYear(item.first_air_date);
  const poster = getPosterUrl(item.poster_path, "w500");
  const backdrop = getBackdropUrl(item.backdrop_path || item.poster_path, "w780");
  const inList = isInList(item.id, mediaType);
  const score = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const match = Math.round((item.vote_average || 0) * 10);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const openHoverCard = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);

    openTimeoutRef.current = setTimeout(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHoverRect(rect);
      setHovered(true);
    }, 320);
  }, []);

  const closeHoverCard = useCallback(() => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 90);
  }, []);

  const handlePlay = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();

      if (mediaType === "movie") {
        router.push(`/watch/${item.id}?type=movie`);
        return;
      }

      router.push(`/watch/${item.id}?type=tv&season=1&episode=1`);
    },
    [item.id, mediaType, router]
  );

  const handleDetails = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      router.push(`/title/${mediaType}/${item.id}`);
    },
    [item.id, mediaType, router]
  );

  const handleWatchlist = useCallback(async () => {
    if (!activeProfile) {
      toast.error("Select a profile first");
      return;
    }

    setWatchlistLoading(true);

    try {
      if (inList) {
        await axios.delete(
          `/api/watchlist?profileId=${activeProfile.id}&tmdbId=${item.id}&mediaType=${mediaType}`
        );
        removeItem(item.id, mediaType);
        toast.success("Removed from My List");
      } else {
        const response = await axios.post("/api/watchlist", {
          profileId: activeProfile.id,
          tmdbId: item.id,
          mediaType,
          title,
          poster: item.poster_path,
        });

        addItem({
          id: response.data.id,
          tmdbId: item.id,
          mediaType,
          title,
          poster: item.poster_path,
          addedAt: new Date().toISOString(),
        });
        toast.success("Added to My List");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setWatchlistLoading(false);
    }
  }, [
    activeProfile,
    addItem,
    inList,
    item.id,
    item.poster_path,
    mediaType,
    removeItem,
    title,
  ]);

  let hoverLeft = 0;
  let hoverTop = 0;
  let transformOrigin = "center center";

  if (hoverRect && typeof window !== "undefined") {
    const width = Math.min(360, Math.max(312, hoverRect.width * 1.62));
    hoverLeft = hoverRect.left - (width - hoverRect.width) / 2;
    hoverTop =
      hoverDirection === "up"
        ? hoverRect.top - hoverRect.height * 0.7
        : hoverRect.top - hoverRect.height * 0.05;

    if (hoverRect.left < 40) {
      hoverLeft = hoverRect.left;
      transformOrigin = "left center";
    }

    if (window.innerWidth - hoverRect.right < 40) {
      hoverLeft = hoverRect.right - width;
      transformOrigin = "right center";
    }

    hoverTop = Math.max(12, Math.min(hoverTop, window.innerHeight - 420));
  }

  return (
    <>
      <div
        ref={cardRef}
        className="movie-card"
        style={{ width: cardWidth, height: cardWidth * 1.5 }}
        onMouseEnter={openHoverCard}
        onMouseLeave={closeHoverCard}
      >
        <div className="movie-card-poster h-full w-full" onClick={() => handleDetails()}>
          <Image
            src={poster}
            alt={title}
            fill
            sizes={`${cardWidth}px`}
            className="movie-card-img transition duration-500 hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090b10] via-[#090b10]/42 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3">
            <span className="line-clamp-1 text-sm font-semibold text-white">
              {title}
            </span>
            <span className="rounded-md bg-black/45 px-2 py-1 text-[11px] font-semibold text-white/[0.72]">
              {year}
            </span>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {hovered && hoverRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={openHoverCard}
                onMouseLeave={closeHoverCard}
                className="fixed z-[9999] overflow-hidden rounded-lg border border-white/12 bg-[rgba(10,14,20,0.98)] shadow-[0_32px_80px_rgba(0,0,0,0.48)]"
                style={{
                  left: hoverLeft,
                  top: hoverTop,
                  width: Math.min(360, Math.max(312, (hoverRect?.width ?? 220) * 1.62)),
                  transformOrigin,
                }}
              >
                <div className="relative aspect-video cursor-pointer overflow-hidden" onClick={handlePlay}>
                  <Image
                    src={backdrop}
                    alt={title}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/34 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/[0.8] backdrop-blur-md">
                    <Sparkles size={12} className="text-[var(--cs-red)]" />
                    {mediaType === "movie" ? "Movie Night" : "Binge Pick"}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-semibold text-white">
                        {title}
                      </h3>
                      <button
                        type="button"
                        onClick={handleDetails}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.1]"
                        aria-label="View title details"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-medium text-emerald-300">
                        <Star size={13} className="fill-current" />
                        {match}% Match
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 text-white/70">
                        {year}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 text-white/70">
                        IMDb {score}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                      <Play size={15} fill="currentColor" />
                      Play
                    </button>
                    <button
                      type="button"
                      onClick={handleWatchlist}
                      disabled={watchlistLoading}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] text-white transition hover:bg-white/[0.1] disabled:opacity-50"
                      aria-label={inList ? "Remove from My List" : "Add to My List"}
                    >
                      {inList ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>

                  {item.overview && (
                    <p className="line-clamp-3 text-sm leading-6 text-white/[0.62]">
                      {item.overview}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
