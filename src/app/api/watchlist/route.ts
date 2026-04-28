import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Profile } from "@/lib/models";
import { z } from "zod";

const addSchema = z.object({
  profileId: z.string(),
  tmdbId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string(),
  poster: z.string().nullable().optional(),
});

async function verifyProfileOwnership(profileId: string, userId: string) {
  await connectDB();
  const profile = await Profile.findOne({ _id: profileId, userId });
  return profile;
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

  const items = (profile.watchlist ?? []).map((item) => ({
    id: item._id?.toString() ?? `${item.tmdbId}-${item.mediaType}`,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    poster: item.poster,
    addedAt: item.addedAt,
  }));

  return NextResponse.json(items.reverse()); // newest first
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { profileId, tmdbId, mediaType, title, poster } = parsed.data;

  const profile = await verifyProfileOwnership(profileId, session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check if already in watchlist
  const existing = profile.watchlist.find(
    (w) => w.tmdbId === tmdbId && w.mediaType === mediaType
  );

  if (existing) {
    return NextResponse.json(
      {
        id: existing._id?.toString() ?? `${tmdbId}-${mediaType}`,
        tmdbId,
        mediaType,
        title,
        poster: poster ?? null,
        addedAt: existing.addedAt,
      },
      { status: 200 }
    );
  }

  profile.watchlist.push({
    tmdbId,
    mediaType,
    title,
    poster: poster ?? null,
    addedAt: new Date(),
  });
  await profile.save();

  const newItem = profile.watchlist[profile.watchlist.length - 1];
  return NextResponse.json(
    {
      id: newItem._id?.toString() ?? `${tmdbId}-${mediaType}`,
      tmdbId,
      mediaType,
      title,
      poster: poster ?? null,
      addedAt: newItem.addedAt,
    },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const tmdbId = searchParams.get("tmdbId");
  const mediaType = searchParams.get("mediaType");

  if (!profileId || !tmdbId || !mediaType) {
    return NextResponse.json(
      { error: "profileId, tmdbId, and mediaType are required" },
      { status: 400 }
    );
  }

  const profile = await verifyProfileOwnership(profileId, session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  profile.watchlist = profile.watchlist.filter(
    (w) => !(w.tmdbId === parseInt(tmdbId, 10) && w.mediaType === mediaType)
  );

  await profile.save();
  return NextResponse.json({ message: "Removed from watchlist" });
}
