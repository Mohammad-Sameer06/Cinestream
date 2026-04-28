"use client";

import { TMDBMovie, TMDBTVShow } from "@/types";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/movies/HeroBanner";
import MovieRow from "@/components/movies/MovieRow";

interface RowData {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[];
  mediaType: "movie" | "tv" | "mixed";
}

interface TVClientProps {
  heroItems: ((TMDBMovie | TMDBTVShow) & { media_type: "movie" | "tv" })[];
  rows: RowData[];
}

export default function TVClient({ heroItems, rows }: TVClientProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--cs-dark)] pb-24">
      <Navbar />
      <HeroBanner
        items={heroItems}
        onMoreInfo={(item, mediaType) => router.push(`/title/${mediaType}/${item.id}`)}
      />
      <div className="relative z-10 -mt-14 space-y-1">
        {rows.map((row) => (
          <MovieRow
            key={row.title}
            title={row.title}
            items={row.items}
            mediaType={row.mediaType}
            hoverDirection="up"
          />
        ))}
      </div>
    </main>
  );
}
