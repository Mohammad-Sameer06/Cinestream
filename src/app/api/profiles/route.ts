import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Profile } from "@/lib/models";
import { z } from "zod";

const createProfileSchema = z.object({
  name: z.string().min(1).max(20),
  avatarIndex: z.number().int().min(0).max(7),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const profiles = await Profile.find({ userId: session.user.id })
    .sort({ createdAt: 1 })
    .select("_id name avatarIndex userId createdAt");

  return NextResponse.json(
    profiles.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      avatarIndex: p.avatarIndex,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const count = await Profile.countDocuments({ userId: session.user.id });
  if (count >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 profiles allowed" },
      { status: 400 }
    );
  }

  const profile = await Profile.create({
    name: parsed.data.name,
    avatarIndex: parsed.data.avatarIndex,
    userId: session.user.id,
    watchlist: [],
    continueWatching: [],
  });

  return NextResponse.json(
    { id: profile._id.toString(), name: profile.name, avatarIndex: profile.avatarIndex },
    { status: 201 }
  );
}
