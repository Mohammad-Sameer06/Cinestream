"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film, Tv2, Grid3X3, Loader2, Play, Info } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { TMDBMovie, TMDBTVShow } from "@/types";
import { getPosterUrl, getYear } from "@/lib/tmdb";

type FilterType = "all" | "movie" | "tv";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const base = "https://api.tmdb.org/3";
        const key = "8018a9ce6515f465f35d15c917317e92";

        let endpoint = `${base}/search/multi?api_key=${key}&query=${encodeURIComponent(debouncedQuery)}&include_adult=false`;
        if (filter === "movie") {
          endpoint = `${base}/search/movie?api_key=${key}&query=${encodeURIComponent(debouncedQuery)}&include_adult=false`;
        } else if (filter === "tv") {
          endpoint = `${base}/search/tv?api_key=${key}&query=${encodeURIComponent(debouncedQuery)}&include_adult=false`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();
        let items = data.results || [];

        if (filter === "all") {
          items = items.filter((i: { media_type?: string }) => i.media_type === "movie" || i.media_type === "tv");
        }

        setResults(items);
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, filter]);

  const getTitle = (item: TMDBMovie | TMDBTVShow) => ("title" in item ? item.title : item.name);

  const getMediaType = (item: TMDBMovie | TMDBTVShow): "movie" | "tv" => {
    if ("media_type" in item && item.media_type) {
      return item.media_type as "movie" | "tv";
    }
    return "title" in item ? "movie" : "tv";
  };

  const handleDetails = (item: TMDBMovie | TMDBTVShow) => {
    const type = getMediaType(item);
    router.push(`/title/${type}/${item.id}`);
  };

  const handlePlay = (item: TMDBMovie | TMDBTVShow) => {
    const type = getMediaType(item);
    if (type === "movie") {
      router.push(`/watch/${item.id}?type=movie`);
    } else {
      router.push(`/watch/${item.id}?type=tv&season=1&episode=1`);
    }
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: "var(--cs-dark)" }}>
      <Navbar />

      <section className="px-[5%] pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/10 p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(53, 200, 255, 0.08), rgba(14, 21, 30, 0.85) 42%, rgba(9, 14, 22, 0.94))",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4">Discover</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6" style={{ fontFamily: "var(--cs-display-font)" }}>
            Search
          </h1>

          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies and TV shows"
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-12 pr-12 py-3.5 text-base text-white placeholder-gray-500 outline-none focus:border-[var(--cs-red)] transition-all"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {([
              { value: "all", icon: Grid3X3, label: "All" },
              { value: "movie", icon: Film, label: "Movies" },
              { value: "tv", icon: Tv2, label: "TV" },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold transition-colors ${
                  filter === value
                    ? "bg-[var(--cs-red)] border-[var(--cs-red)] text-white"
                    : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-[5%] pb-24">
        {debouncedQuery && !loading && (
          <p className="text-sm text-gray-400 mb-6">
            Found <span className="text-white font-semibold">{results.length}</span> results for
            <span className="text-[var(--cs-red)]"> &quot;{debouncedQuery}&quot;</span>
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-300">
            <Loader2 size={20} className="animate-spin" />
            Searching titles...
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && results.length > 0 ? (
            <motion.div
              key={`${debouncedQuery}-${filter}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
            >
              {results.map((item, i) => {
                const type = getMediaType(item);
                const title = getTitle(item);
                const year = "release_date" in item ? getYear(item.release_date) : getYear(item.first_air_date);

                return (
                  <motion.article
                    key={`${item.id}-${type}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="group"
                  >
                    <div
                      className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-white/5"
                      onClick={() => handleDetails(item)}
                    >
                      <Image
                        src={getPosterUrl(item.poster_path, "w500")}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b0f] via-[#090b0f]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
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
                            handleDetails(item);
                          }}
                          className="w-9 h-9 rounded-md border border-white/20 bg-black/45 text-white flex items-center justify-center"
                          aria-label="View details"
                        >
                          <Info size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 px-0.5">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{title}</h3>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                        <span>{year}</span>
                        <span className="text-green-400 font-semibold">{Math.round(item.vote_average * 10)}% match</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!loading && debouncedQuery && results.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/[0.03]">
            <Search size={44} className="text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400">Try another keyword or switch filters.</p>
          </div>
        )}

        {!debouncedQuery && !loading && (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/15 bg-white/[0.02]">
            <Search size={40} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white">Start searching</h2>
            <p className="text-gray-400 mt-2">Find movies and shows by title, actor, or keyword.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" style={{ background: "var(--cs-dark)" }} />}>
      <SearchPageContent />
    </Suspense>
  );
}
