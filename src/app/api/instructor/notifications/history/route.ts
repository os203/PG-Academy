import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Instructor access required" }, { status: 403 });
    }

    const sentHistory = await db.sentNotification.findMany({
      where: { senderId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        track: { select: { title: true } }
      }
    });

    return NextResponse.json({ history: sentHistory });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return NextResponse.json({ error: "Failed to fetch notification history" }, { status: 500 });
  }
}
