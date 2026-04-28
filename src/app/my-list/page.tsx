"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bookmark, Play, Trash2, Search, Plus, Clapperboard } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { useProfileStore } from "@/store/profileStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { WatchlistItem } from "@/types";
import { getPosterUrl } from "@/lib/tmdb";
import { toast } from "sonner";
import axios from "axios";

export default function MyListPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { items, setItems, removeItem } = useWatchlistStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProfile) return;

    const fetchList = async () => {
      try {
        const { data } = await axios.get(
          `/api/watchlist?profileId=${activeProfile.id}`
        );
        setItems(data);
      } catch {
        toast.error("Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [activeProfile, setItems]);

  const handleRemove = async (item: WatchlistItem) => {
    if (!activeProfile) return;
    try {
      await axios.delete(
        `/api/watchlist?profileId=${activeProfile.id}&tmdbId=${item.tmdbId}&mediaType=${item.mediaType}`
      );
      removeItem(item.tmdbId, item.mediaType);
      toast.success("Removed from My List");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handlePlay = (item: WatchlistItem) => {
    if (item.mediaType === "movie") {
      router.push(`/watch/${item.tmdbId}?type=movie`);
    } else {
      router.push(`/watch/${item.tmdbId}?type=tv&season=1&episode=1`);
    }
  };

  const handleDetails = (item: WatchlistItem) => {
    router.push(`/title/${item.mediaType}/${item.tmdbId}`);
  };

  return (
    <main className="min-h-screen text-white" style={{ background: "var(--cs-dark)" }}>
      <Navbar />

      <section className="px-[5%] pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/10 p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 61, 46, 0.1), rgba(14, 21, 30, 0.85) 45%, rgba(10, 15, 23, 0.92))",
          }}
        >
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-gray-400 mb-5">
            <Clapperboard size={16} className="text-[var(--cs-red)]" />
            Personal Collection
          </div>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight"
            style={{ fontFamily: "var(--cs-display-font)" }}
          >
            My List
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/15 bg-white/5">
              <Bookmark size={14} className="text-[var(--cs-red)]" />
              {items.length} saved titles
            </span>
            {activeProfile && <span>Profile: {activeProfile.name}</span>}
          </div>
        </motion.div>
      </section>

      <div className="px-[5%] pb-24">
        {!activeProfile ? (
          <div className="text-center py-24 rounded-2xl border border-white/10 bg-white/[0.03]">
            <h2 className="text-2xl font-bold text-white mb-3">Select a profile first</h2>
            <p className="text-gray-400 mb-8">Choose a profile to load your watchlist.</p>
            <button onClick={() => router.push("/profiles")} className="btn-red w-auto px-8">
              Go to Profiles
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24 text-gray-300">Loading your list...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-white/10 bg-white/[0.03]">
            <Plus size={48} className="text-gray-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Your list is empty</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Add movies and shows from Browse to keep them here for quick access.
            </p>
            <button onClick={() => router.push("/browse")} className="btn-red w-auto px-8">
              Browse Titles
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
          >
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                className="group"
              >
                <div
                  className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-white/5"
                  onClick={() => handleDetails(item)}
                >
                  <Image
                    src={item.poster ? getPosterUrl(item.poster, "w500") : "/placeholder-poster.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b0f] via-[#090b0f]/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(item);
                      }}
                      className="flex-1 h-9 rounded-md bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5"
                    >
                      <Play size={14} fill="currentColor" />
                      Play
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                      className="w-9 h-9 rounded-md border border-white/20 bg-black/40 text-white flex items-center justify-center"
                      aria-label="Remove from list"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetails(item);
                      }}
                      className="w-9 h-9 rounded-md border border-white/20 bg-black/40 text-white flex items-center justify-center"
                      aria-label="View details"
                    >
                      <Search size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 px-0.5">
                  <h3 className="text-sm font-semibold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                    {item.mediaType === "movie" ? "Movie" : "TV Series"}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
