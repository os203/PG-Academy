import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/admin/wishlist-analytics — wishlist insights for admin
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Total wishlist entries
    const totalWishlists = await db.wishlist.count();

    // Unique users who wishlisted anything
    const uniqueWishlisters = await db.wishlist.groupBy({
      by: ["userId"],
    });

    // Top wishlisted tracks (with track details)
    const trackWishlistCounts = await db.wishlist.groupBy({
      by: ["trackId"],
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 10,
    });

    const trackIds = trackWishlistCounts.map((t) => t.trackId);
    const tracks = await db.track.findMany({
      where: { id: { in: trackIds } },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        status: true,
        instructor: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const trackMap = new Map(tracks.map((t) => [t.id, t]));

    const topWishlistedTracks = trackWishlistCounts.map((item) => {
      const track = trackMap.get(item.trackId);
      return {
        trackId: item.trackId,
        wishlistCount: item._count.trackId,
        title: track?.title || "Unknown Track",
        thumbnail: track?.thumbnail || null,
        price: track?.price || 0,
        status: track?.status || "UNKNOWN",
        instructor: track?.instructor?.name || "Unknown",
        enrollments: track?._count?.enrollments || 0,
      };
    });

    // Wishlist trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWishlists = await db.wishlist.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const wishlistTrend: Record<string, number> = {};
    for (const w of recentWishlists) {
      const day = w.createdAt.toISOString().split("T")[0];
      wishlistTrend[day] = (wishlistTrend[day] || 0) + 1;
    }

    // Conversion rate: wishlisted tracks that led to enrollments
    const wishlistedTrackIds = trackWishlistCounts.map((t) => t.trackId);
    const conversions = await db.enrollment.count({
      where: {
        trackId: { in: wishlistedTrackIds },
      },
    });

    // Avg wishlists per user
    const avgWishlistsPerUser =
      uniqueWishlisters.length > 0
        ? Math.round((totalWishlists / uniqueWishlisters.length) * 10) / 10
        : 0;

    // Most active wishlisters
    const topWishlisters = await db.wishlist.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    });

    const wishlisterUserIds = topWishlisters.map((w) => w.userId);
    const wishlisterUsers = await db.user.findMany({
      where: { id: { in: wishlisterUserIds } },
      select: { id: true, name: true, email: true },
    });
    const wishlisterMap = new Map(wishlisterUsers.map((u) => [u.id, u]));

    const topWishlistUsers = topWishlisters.map((w) => {
      const u = wishlisterMap.get(w.userId);
      return {
        userId: w.userId,
        name: u?.name || "Unknown",
        email: u?.email || "",
        wishlistCount: w._count.userId,
      };
    });

    return NextResponse.json({
      totalWishlists,
      uniqueWishlisters: uniqueWishlisters.length,
      avgWishlistsPerUser,
      conversions,
      conversionRate:
        totalWishlists > 0
          ? Math.round((conversions / totalWishlists) * 100)
          : 0,
      topWishlistedTracks,
      wishlistTrend,
      topWishlistUsers,
    });
  } catch (error) {
    console.error("[ADMIN_WISHLIST_ANALYTICS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
