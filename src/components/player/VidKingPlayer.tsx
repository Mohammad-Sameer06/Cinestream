"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { getPosterUrl } from "@/lib/tmdb";
import { useProfileStore } from "@/store/profileStore";

interface VidKingPlayerProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title: string;
  poster?: string | null;
}

interface PlayerFrameProps {
  src: string;
  title: string;
  posterUrl: string;
  onRetry: () => void;
}

function PlayerFrame({ src, title, posterUrl, onRetry }: PlayerFrameProps) {
  const [playerStatus, setPlayerStatus] = useState<"loading" | "slow" | "ready">(
    "loading"
  );
  const [showCover, setShowCover] = useState(true);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setShowCover(false);
      setPlayerStatus((current) => (current === "ready" ? current : "slow"));
    }, 4200);

    return () => window.clearTimeout(revealTimer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-black">
      <div className="absolute inset-0">
        <iframe
          src={src}
          width="100%"
          height="100%"
          title={title}
          loading="eager"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write"
          className="player-iframe absolute inset-0 h-full w-full"
          onLoad={() => {
            setPlayerStatus("ready");
            setShowCover(false);
          }}
        />
      </div>

      {showCover && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,rgba(5,8,12,0.55),rgba(3,4,8,0.88))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.7] backdrop-blur-md">
              <Sparkles size={12} className="text-[var(--cs-red)]" />
              Theater Source
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/[0.6] backdrop-blur-md">
              <LoaderCircle size={14} className="animate-spin" />
              Preparing playback
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-36 w-24 overflow-hidden rounded-lg border border-white/10 shadow-2xl">
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-white/[0.68]">
              Loading the video source and warming up the player.
            </p>
            <div className="progress-bar-track">
              <div className="progress-bar-fill w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {playerStatus === "slow" && !showCover && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10">
          <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/12 bg-[rgba(6,8,12,0.82)] px-4 py-3 shadow-2xl backdrop-blur-xl">
            <div className="flex min-w-0 items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  The stream is taking longer than usual
                </p>
                <p className="text-xs text-white/[0.55]">
                  Retry the embed or open it in a separate tab if playback feels stalled.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
              >
                <RefreshCw size={14} />
                Retry
              </button>
              <button
                type="button"
                onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
              >
                <ExternalLink size={14} />
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoPlayerFrame = memo(PlayerFrame);

function VidKingPlayer({
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  poster,
}: VidKingPlayerProps) {
  const { activeProfile } = useProfileStore();
  const [reloadToken, setReloadToken] = useState(0);

  const src = useMemo(() => {
    const base = "https://www.vidking.net";
    const embedPath =
      mediaType === "movie"
        ? `/embed/movie/${tmdbId}`
        : `/embed/tv/${tmdbId}/${season}/${episode}`;
    const separator = embedPath.includes("?") ? "&" : "?";

    return `${base}${embedPath}${separator}autoplay=1&theme=dark&color=ff4d36&reload=${reloadToken}`;
  }, [episode, mediaType, reloadToken, season, tmdbId]);

  useEffect(() => {
    if (!activeProfile) return;

    const timer = window.setTimeout(async () => {
      try {
        await fetch("/api/continue-watching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: activeProfile.id,
            tmdbId,
            mediaType,
            title,
            poster: poster || null,
            progress: 30,
            duration: 7200,
            season: mediaType === "tv" ? season : null,
            episode: mediaType === "tv" ? episode : null,
          }),
        });
      } catch (error) {
        console.error("Failed to save continue watching:", error);
      }
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [activeProfile, episode, mediaType, poster, season, title, tmdbId, src]);

  const posterUrl = poster ? getPosterUrl(poster, "w500") : "/placeholder-poster.svg";

  return (
    <MemoPlayerFrame
      key={src}
      src={src}
      title={title}
      posterUrl={posterUrl}
      onRetry={() => setReloadToken((value) => value + 1)}
    />
  );
}

export default memo(VidKingPlayer);
