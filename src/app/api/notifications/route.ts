import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const decoded = await verifyToken();

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const notifications = await db.notification.findMany({
      where: {
        userId: decoded.userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Format timestamps for the frontend
    const formattedNotifications = notifications.map((n: { id: string, message: string, type: string, isRead: boolean, createdAt: Date }) => {
      const diffMs = Date.now() - new Date(n.createdAt).getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMins / 60);
      const diffDays = Math.round(diffHours / 24);

      let timeAgo = "just now";
      if (diffMins > 0 && diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours >= 1 && diffHours < 24) timeAgo = `${diffHours}h ago`;
      else if (diffDays >= 1) timeAgo = `${diffDays}d ago`;

      return {
        id: n.id,
        title: getTitleForType(n.type),
        subtitle: n.message,
        time: timeAgo,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

function getTitleForType(type: string): string {
  switch (type) {
    case "welcome": return "Welcome";
    case "course_update": return "Track Update";
    case "enrollment": return "Enrollment Successful";
    case "alert": return "System Alert";
    default: return "Notification";
  }
}
