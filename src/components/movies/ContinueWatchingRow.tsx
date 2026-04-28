"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { useProfileStore } from "@/store/profileStore";
import { TMDBMedia } from "@/types";
import MovieCard from "./MovieCard";

interface ContinueWatchingItem {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  progress: number;
  duration: number;
  season?: number;
  episode?: number;
}

export default function ContinueWatchingRow() {
  const { activeProfile } = useProfileStore();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  
  const CARD_WIDTH = 186;
  const GAP = 18;

  useEffect(() => {
    if (!activeProfile) return;

    const fetchItems = async () => {
      try {
        const { data } = await axios.get(`/api/continue-watching?profileId=${activeProfile.id}`);
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch continue watching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeProfile]);

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

  const handleRemove = async (e: React.MouseEvent, item: ContinueWatchingItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!activeProfile) return;
    
    try {
      await axios.delete("/api/continue-watching", {
        data: {
          profileId: activeProfile.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType
        }
      });
      setItems(prev => prev.filter(i => !(i.tmdbId === item.tmdbId && i.mediaType === item.mediaType)));
      toast.success("Removed from Continue Watching");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const scroll = (direction: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: direction === "left" ? -(CARD_WIDTH + GAP) * 4 : (CARD_WIDTH + GAP) * 4,
      behavior: "smooth",
    });
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="relative mb-14 group/row">
      <div className="content-wrap mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Continue Watching</h2>
          <p className="mt-1 text-sm text-white/[0.42]">
            Jump back into what you started
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
          const mappedMedia: TMDBMedia = {
            id: item.tmdbId,
            title: item.mediaType === "movie" ? item.title : undefined,
            name: item.mediaType === "tv" ? item.title : undefined,
            poster_path: item.poster,
            backdrop_path: item.poster,
            overview: item.mediaType === "tv" ? `Season ${item.season} Episode ${item.episode}` : "",
            media_type: item.mediaType,
          };

          return (
            <div
              key={item.id}
              className="group/card relative shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <MovieCard
                item={mappedMedia}
                mediaType={item.mediaType}
                cardWidth={CARD_WIDTH}
              />
              <button
                type="button"
                onClick={(e) => handleRemove(e, item)}
                className="absolute -right-2 -top-2 z-50 hidden size-7 items-center justify-center rounded-md border border-white/20 bg-[var(--cs-red)] text-white shadow-lg transition hover:scale-110 group-hover/card:flex"
                aria-label="Remove from Continue Watching"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
