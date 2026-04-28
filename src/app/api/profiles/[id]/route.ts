import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Profile } from "@/lib/models";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const profile = await Profile.findOne({ _id: id, userId: session.user.id });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const count = await Profile.countDocuments({ userId: session.user.id });
  if (count <= 1) {
    return NextResponse.json(
      { error: "Cannot delete your only profile" },
      { status: 400 }
    );
  }

  await Profile.deleteOne({ _id: id });
  return NextResponse.json({ message: "Profile deleted" });
}
