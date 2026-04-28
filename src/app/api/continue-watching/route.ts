import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Profile } from "@/lib/models";
import { z } from "zod";

const upsertSchema = z.object({
  profileId: z.string(),
  tmdbId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string(),
  poster: z.string().nullable().optional(),
  progress: z.number().int().min(0),
  duration: z.number().int().min(0),
  season: z.number().int().min(1).optional().nullable(),
  episode: z.number().int().min(1).optional().nullable(),
});

async function verifyProfileOwnership(profileId: string, userId: string) {
  await connectDB();
  return await Profile.findOne({ _id: profileId, userId });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId required" }, { status: 400 });
  }

  const profile = await verifyProfileOwnership(profileId, session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const items = (profile.continueWatching ?? [])
    .filter((w) => w.progress > 30)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20)
    .map((item) => ({
      id: item._id?.toString() ?? `${item.tmdbId}-${item.mediaType}`,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      poster: item.poster,
      progress: item.progress,
      duration: item.duration,
      season: item.season,
      episode: item.episode,
      updatedAt: item.updatedAt,
    }));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { profileId, tmdbId, mediaType, title, poster, progress, duration, season, episode } =
    parsed.data;

  const profile = await verifyProfileOwnership(profileId, session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Find existing entry
  const existingIdx = profile.continueWatching.findIndex(
    (w) => w.tmdbId === tmdbId && w.mediaType === mediaType
  );

  if (existingIdx >= 0) {
    profile.continueWatching[existingIdx].progress = progress;
    profile.continueWatching[existingIdx].duration = duration;
    profile.continueWatching[existingIdx].title = title;
    profile.continueWatching[existingIdx].poster = poster ?? null;
    profile.continueWatching[existingIdx].season = season ?? null;
    profile.continueWatching[existingIdx].episode = episode ?? null;
    profile.continueWatching[existingIdx].updatedAt = new Date();
  } else {
    profile.continueWatching.push({
      tmdbId,
      mediaType,
      title,
      poster: poster ?? null,
      progress,
      duration,
      season: season ?? null,
      episode: episode ?? null,
      updatedAt: new Date(),
    });
  }

  await profile.save();
  return NextResponse.json({ message: "Progress saved" });
}

const deleteSchema = z.object({
  profileId: z.string(),
  tmdbId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
});

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { profileId, tmdbId, mediaType } = parsed.data;

  const profile = await verifyProfileOwnership(profileId, session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const initialLength = profile.continueWatching.length;
  profile.continueWatching = profile.continueWatching.filter(
    (w) => !(w.tmdbId === tmdbId && w.mediaType === mediaType)
  );

  if (profile.continueWatching.length !== initialLength) {
    await profile.save();
  }

  return NextResponse.json({ message: "Progress removed" });
}
