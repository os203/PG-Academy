import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/wishlist — get current user's wishlisted track IDs
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ids: [] });
    }

    const wishlisted = await db.wishlist.findMany({
      where: { userId },
      select: { trackId: true },
    });

    return NextResponse.json({ ids: wishlisted.map((w) => w.trackId) });
  } catch (error) {
    console.error("[WISHLIST_GET_ERROR]", error);
    return NextResponse.json({ ids: [] });
  }
}

// POST /api/wishlist — toggle a track in the wishlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";

    if (!trackId) {
      return NextResponse.json({ error: "trackId is required" }, { status: 400 });
    }

    // Check if already wishlisted
    const existing = await db.wishlist.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });

    if (existing) {
      // Remove from wishlist
      await db.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ wishlisted: false });
    } else {
      // Add to wishlist
      await db.wishlist.create({
        data: { userId, trackId },
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error("[WISHLIST_TOGGLE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
