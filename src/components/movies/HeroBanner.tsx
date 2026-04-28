"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Info,
  Play,
  Sparkles,
  Star,
  Tv2,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getBackdropUrl, getMatchPercentage, getPosterUrl, getYear } from "@/lib/tmdb";
import { MediaType, TMDBMedia, TMDBMovie } from "@/types";

interface HeroBannerProps {
  items: TMDBMedia[];
  onMoreInfo?: (item: TMDBMedia, mediaType: MediaType) => void;
}

function isMovie(item: TMDBMedia): item is TMDBMovie {
  return "title" in item;
}

export default function HeroBanner({ items, onMoreInfo }: HeroBannerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featured = items[current];

  const slideMeta = useMemo(() => {
    if (!featured) return null;

    const mediaType: MediaType = isMovie(featured) ? "movie" : "tv";
    const title = isMovie(featured) ? featured.title : featured.name;
    const year = isMovie(featured)
      ? getYear(featured.release_date)
      : getYear(featured.first_air_date);
    const match = getMatchPercentage(featured.vote_average);

    return {
      mediaType,
      title,
      year,
      match,
      backdrop: getBackdropUrl(featured.backdrop_path, "original"),
      poster: getPosterUrl(featured.poster_path, "w500"),
    };
  }, [featured]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrent((index + items.length) % items.length);
    },
    [items.length]
  );

  const goNext = useCallback(() => {
    goToSlide(current + 1);
  }, [current, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(current - 1);
  }, [current, goToSlide]);

  useEffect(() => {
    if (isPaused || items.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % items.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [isPaused, items.length]);

  if (!featured || !slideMeta) return null;

  const handlePlay = () => {
    if (slideMeta.mediaType === "movie") {
      router.push(`/watch/${featured.id}?type=movie`);
      return;
    }

    router.push(`/watch/${featured.id}?type=tv&season=1&episode=1`);
  };

  return (
    <section
      className="hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0.3, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hero-bg"
          style={{ backgroundImage: `url(${slideMeta.backdrop})` }}
        />
      </AnimatePresence>

      <div className="hero-gradient" />
      <div className="hero-gradient-bottom" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.14),transparent_26%)]" />

      <div className="hero-content">
        <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <motion.div
            key={`copy-${featured.id}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="hero-copy"
          >
            <div className="section-eyebrow">
              <Sparkles size={14} className="text-[var(--cs-red)]" />
              Featured Tonight
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Badge
                variant="outline"
                className="border-white/[0.16] bg-white/[0.06] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white"
              >
                {slideMeta.mediaType === "movie" ? (
                  <>
                    <Clapperboard size={12} />
                    Movie
                  </>
                ) : (
                  <>
                    <Tv2 size={12} />
                    Series
                  </>
                )}
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                <Star size={14} className="fill-current" />
                {slideMeta.match}% Match
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/70">
                <Calendar size={14} />
                {slideMeta.year}
              </span>
            </div>

            <h1
              className="mt-5 max-w-[11ch] text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "var(--cs-display-font)" }}
            >
              {slideMeta.title}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/[0.78] sm:text-base">
              {featured.overview || "A standout title from this week's biggest releases."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={handlePlay}>
                <Play size={18} fill="currentColor" />
                Play Now
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onMoreInfo?.(featured, slideMeta.mediaType)}
              >
                <Info size={18} />
                More Info
              </button>
            </div>
          </motion.div>

          <motion.div
            key={`poster-${featured.id}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="hidden lg:block"
          >
            <div className="page-panel ml-auto w-full max-w-[260px] p-3">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={slideMeta.poster}
                  alt={slideMeta.title}
                  fill
                  priority
                  sizes="260px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b10]/80 via-transparent to-transparent" />
              </div>
              <div className="px-1 pb-1 pt-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Curated Pick
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-white">
                  {slideMeta.title}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/12 bg-black/28 text-white/90 backdrop-blur-md transition hover:bg-black/48 md:inline-flex"
            aria-label="Previous title"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/12 bg-black/28 text-white/90 backdrop-blur-md transition hover:bg-black/48 md:inline-flex"
            aria-label="Next title"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-8 right-[max(4vw,18px)] z-10 flex items-center gap-2 sm:bottom-10">
            {items.slice(0, 8).map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === current ? "w-8 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
