"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MediaType, TMDBMedia } from "@/types";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  items: TMDBMedia[];
  mediaType: MediaType | "mixed";
  hoverDirection?: "up" | "down";
}

function resolveMediaType(
  item: TMDBMedia,
  defaultType: MediaType | "mixed"
): MediaType {
  if (defaultType !== "mixed") return defaultType;
  if ("media_type" in item && item.media_type) {
    return item.media_type as MediaType;
  }
  return "title" in item ? "movie" : "tv";
}

export default function MovieRow({
  title,
  items,
  mediaType,
  hoverDirection = "down",
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const CARD_WIDTH = 186;
  const GAP = 18;

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;

    const updateControls = () => {
      const { scrollLeft, scrollWidth, clientWidth } = node;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    updateControls();
    node.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      node.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [items.length]);

  if (!items.length) return null;

  const scroll = (direction: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: direction === "left" ? -(CARD_WIDTH + GAP) * 4 : (CARD_WIDTH + GAP) * 4,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative mb-14 group/row">
      <div className="content-wrap mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-white/[0.42]">
            Handpicked titles in the CineStream catalog
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-20 bg-gradient-to-r from-[#090b10] to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-20 bg-gradient-to-l from-[#090b10] to-transparent md:block" />

      {showLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-[max(1vw,10px)] top-[58%] z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-black/45 text-white opacity-0 shadow-lg backdrop-blur-md transition group-hover/row:opacity-100 md:inline-flex"
          aria-label="Scroll row left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {showRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-[max(1vw,10px)] top-[58%] z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-black/45 text-white opacity-0 shadow-lg backdrop-blur-md transition group-hover/row:opacity-100 md:inline-flex"
          aria-label="Scroll row right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div
        ref={rowRef}
        className="hide-scrollbar flex gap-[18px] overflow-x-auto overflow-y-visible px-[max(4vw,18px)] py-3 scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => {
          const type = resolveMediaType(item, mediaType);

          return (
            <div
              key={`${item.id}-${type}`}
              className="shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <MovieCard
                item={item}
                mediaType={type}
                cardWidth={CARD_WIDTH}
                hoverDirection={hoverDirection}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
