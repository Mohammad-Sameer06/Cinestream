import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTVSeasonDetails } from "@/lib/tmdb";

const querySchema = z.object({
  showId: z.coerce.number().int().positive(),
  season: z.coerce.number().int().positive(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    showId: searchParams.get("showId"),
    season: searchParams.get("season"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const data = await getTVSeasonDetails(parsed.data.showId, parsed.data.season);

    return NextResponse.json({
      seasonNumber: data.season_number,
      name: data.name,
      episodes: data.episodes.map((episode) => ({
        id: episode.id,
        episodeNumber: episode.episode_number,
        name: episode.name,
        overview: episode.overview,
        runtime: episode.runtime,
        airDate: episode.air_date,
        stillPath: episode.still_path,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load season details" },
      { status: 500 }
    );
  }
}
