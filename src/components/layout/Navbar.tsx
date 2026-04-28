"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  ChevronDown,
  Clapperboard,
  Compass,
  LogOut,
  Menu,
  Search,
  Tv2,
  User,
  X,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { TMDBMovie, TMDBTVShow } from "@/types";
import { getPosterUrl, getYear } from "@/lib/tmdb";

const AVATAR_COLORS = [
  "from-red-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-fuchsia-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-violet-500",
];

const MOBILE_LINK_ICONS = {
  "/browse": Compass,
  "/movies": Clapperboard,
  "/tv": Tv2,
  "/new": Bell,
  "/my-list": Bookmark,
} as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeProfile, clearProfile } = useProfileStore();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const navLinks = useMemo(
    () => [
      { href: "/browse", label: "Home" },
      { href: "/movies", label: "Movies" },
      { href: "/tv", label: "TV Shows" },
      { href: "/new", label: "New and Popular" },
      { href: "/my-list", label: "My List" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target)) {
        setProfileDropdown(false);
      }
      if (!searchContainerRef.current?.contains(target)) {
        setSearchOpen(false);
      }
      if (!notificationsRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const base = "https://api.tmdb.org/3";
        const key = "8018a9ce6515f465f35d15c917317e92";
        const endpoint = `${base}/search/multi?api_key=${key}&query=${encodeURIComponent(debouncedQuery)}&include_adult=false`;
        const res = await fetch(endpoint);
        const data = await res.json();
        
        const items = (data.results || []).filter(
          (i: { media_type?: string }) => i.media_type === "movie" || i.media_type === "tv"
        );
        setSearchResults(items.slice(0, 5));
      } catch (error) {
        console.error("Live search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!notificationsOpen || notifications.length > 0) return;

    const fetchNotifications = async () => {
      setIsNotificationsLoading(true);
      try {
        const base = "https://api.tmdb.org/3";
        const key = "8018a9ce6515f465f35d15c917317e92";
        const endpoint = `${base}/trending/all/day?api_key=${key}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        
        const items = (data.results || []).filter(
          (i: { media_type?: string }) => i.media_type === "movie" || i.media_type === "tv"
        );
        setNotifications(items.slice(0, 5));
      } catch (error) {
        console.error("Notifications fetch failed:", error);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [notificationsOpen, notifications.length]);

  const avatarColor =
    AVATAR_COLORS[(activeProfile?.avatarIndex ?? 0) % AVATAR_COLORS.length];
  const profileInitial =
    activeProfile?.name?.trim().charAt(0).toUpperCase() ?? "C";

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchQuery.trim();

    if (!nextQuery) {
      setSearchOpen(false);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    setSearchQuery("");
  };

  const handleSignOut = async () => {
    clearProfile();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <nav
        className={cn(
          "navbar",
          scrolled ? "navbar-solid" : "navbar-transparent"
        )}
      >
        <div className="content-wrap flex h-20 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => setMobileMenu((current) => !current)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href="/browse" className="shrink-0">
              <span
                className="text-2xl font-black tracking-[0.08em] text-[var(--cs-red)]"
                style={{ fontFamily: "var(--cs-display-font)" }}
              >
                CINESTREAM
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/browse"
                    ? pathname === "/browse"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setMobileMenu(false);
                      setProfileDropdown(false);
                    }}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={searchContainerRef}>
              <motion.form
                layout
                onSubmit={handleSearchSubmit}
                className={cn(
                  "flex items-center overflow-hidden rounded-xl border transition",
                  searchOpen
                    ? "border-white/12 bg-[rgba(11,16,24,0.96)] px-2"
                    : "border-transparent bg-transparent"
                )}
              >
                <button
                  type="button"
                  onClick={() => setSearchOpen((current) => !current)}
                  className="inline-flex size-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label={searchOpen ? "Close search" : "Open search"}
                >
                  <Search size={18} />
                </button>

                <AnimatePresence initial={false}>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search titles"
                        className="w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 outline-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>

              <AnimatePresence>
                {searchOpen && debouncedQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-14 w-[300px] overflow-hidden rounded-lg border border-white/10 bg-[rgba(11,16,24,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6 text-white/50">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col py-2">
                        {searchResults.map((item) => {
                          const isMovie = "title" in item;
                          const title = isMovie ? item.title : item.name;
                          const year = isMovie ? getYear(item.release_date) : getYear(item.first_air_date);
                          const type = isMovie ? "movie" : "tv";
                          
                          return (
                            <Link
                              key={item.id}
                              href={`/title/${type}/${item.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-white/[0.06]"
                            >
                              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-sm bg-white/10">
                                <img
                                  src={getPosterUrl(item.poster_path, "w185")}
                                  alt={title || "Poster"}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{title}</p>
                                <p className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
                                  <span>{year}</span>
                                  <span className="h-1 w-1 rounded-full bg-white/30" />
                                  <span>{isMovie ? "Movie" : "Series"}</span>
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
                            setSearchOpen(false);
                          }}
                          className="mt-2 border-t border-white/10 px-4 py-3 text-center text-xs font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
                        >
                          See all results for &quot;{debouncedQuery}&quot;
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-white/50">
                        No results found for &quot;{debouncedQuery}&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((current) => !current)}
                  className="hidden size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-14 w-[340px] overflow-hidden rounded-lg border border-white/10 bg-[rgba(11,16,24,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    <div className="border-b border-white/[0.08] px-4 py-4">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                    </div>

                    <div className="flex max-h-[400px] flex-col overflow-y-auto py-2">
                      {isNotificationsLoading ? (
                        <div className="flex items-center justify-center py-8 text-white/50">
                          <Loader2 size={18} className="animate-spin" />
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((item) => {
                          const isMovie = "title" in item;
                          const title = isMovie ? item.title : item.name;
                          const type = isMovie ? "movie" : "tv";
                          
                          return (
                            <Link
                              key={item.id}
                              href={`/title/${type}/${item.id}`}
                              onClick={() => setNotificationsOpen(false)}
                              className="flex items-start gap-4 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/[0.06]"
                            >
                              <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-white/10">
                                <img
                                  src={getPosterUrl(item.backdrop_path || item.poster_path, "w300")}
                                  alt={title || "Backdrop"}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--cs-red)]">
                                  New Arrival
                                </p>
                                <p className="line-clamp-2 text-sm font-medium text-white/90">
                                  {title}
                                </p>
                                <p className="mt-1 text-xs text-white/40">Watch now</p>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-white/50">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdown((current) => !current)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2 text-white transition hover:bg-white/10"
                aria-label="Open profile menu"
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                    avatarColor
                  )}
                >
                  {profileInitial}
                </div>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                  {activeProfile?.name ?? "Profile"}
                </span>
                <ChevronDown
                  size={15}
                  className={cn(
                    "text-white/80 transition-transform",
                    profileDropdown && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-14 w-64 overflow-hidden rounded-lg border border-white/10 bg-[rgba(11,16,24,0.96)] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                  >
                    <div className="border-b border-white/[0.08] px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                        Active Profile
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {activeProfile?.name ?? "Select a profile"}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                      href="/profiles"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <User size={16} />
                        Switch Profile
                      </Link>
                      <Link
                      href="/my-list"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <Bookmark size={16} />
                        My List
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileMenu(false)}
              className="fixed inset-0 z-[105] bg-black/55 backdrop-blur-sm lg:hidden"
              aria-label="Close mobile navigation"
            />
            <motion.aside
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.2 }}
              className="fixed left-4 top-24 z-[110] w-[min(320px,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-[rgba(8,12,18,0.96)] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.44)] backdrop-blur-xl lg:hidden"
            >
              <p className="px-2 pb-3 text-xs uppercase tracking-[0.18em] text-white/40">
                Browse
              </p>
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/browse"
                      ? pathname === "/browse"
                      : pathname.startsWith(link.href);
                  const Icon = MOBILE_LINK_ICONS[link.href as keyof typeof MOBILE_LINK_ICONS];

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/72 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <Icon size={17} />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
