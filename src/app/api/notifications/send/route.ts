import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
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

    // Verify user is an admin or instructor
    const sender = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!sender || (sender.role !== "ADMIN" && sender.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { message, type, targetRole, trackId } = body;

    if (!message || !type || !targetRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security check for Instructors
    if (sender.role === "INSTRUCTOR") {
      if (targetRole !== "ENROLLED_STUDENTS") {
        return NextResponse.json({ error: "Forbidden: Instructors can only message enrolled students" }, { status: 403 });
      }

      if (trackId) {
        const track = await db.track.findUnique({
          where: { id: trackId },
          select: { instructorId: true }
        });
        if (!track || track.instructorId !== decoded.userId) {
          return NextResponse.json({ error: "Forbidden: You do not teach this track" }, { status: 403 });
        }
      }
    }

    // Determine target users
    let targetUsers: { id: string }[] = [];

    if (targetRole === "ENROLLED_STUDENTS") {
      const enrollments = await db.enrollment.findMany({
        where: {
          track: {
            instructorId: decoded.userId,
            ...(trackId ? { id: trackId } : {})
          }
        },
        select: { userId: true },
        distinct: ['userId']
      });
      targetUsers = enrollments.map((e) => ({ id: e.userId }));
    } else {
      let usersQuery = {};
      if (targetRole !== "ALL") {
        usersQuery = { role: targetRole };
      }

      targetUsers = await db.user.findMany({
        where: usersQuery,
        select: { id: true },
      });
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No users found for the selected audience" }, { status: 404 });
    }

    // Create notifications in bulk
    const notificationsToCreate = targetUsers.map((user) => ({
      userId: user.id,
      message,
      type,
      isRead: false,
    }));

    const result = await db.notification.createMany({
      data: notificationsToCreate,
    });

    // Create history record for the sender
    await db.sentNotification.create({
      data: {
        senderId: decoded.userId,
        message,
        type,
        targetRole,
        trackId: trackId || null,
        audienceSize: targetUsers.length,
      }
    });

    // Create audit log for Admin (if sender is admin)
    if (sender.role === "ADMIN") {
      await db.auditLog.create({
        data: {
          adminId: decoded.userId,
          action: `Sent broadcast notification to ${targetRole} (${targetUsers.length} users)`,
          category: "USER_MGMT",
          severity: "info",
          ip: request.headers.get("x-forwarded-for") || "unknown",
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully sent ${result.count} notifications.` 
    });

  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
