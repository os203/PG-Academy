import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function clampPercentage(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can save progress" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const lessonId =
      typeof body.lessonId === "string" ? body.lessonId.trim() : "";

    const watchedPercent = clampPercentage(Number(body.watchedPercent ?? 0));

    const lastPositionRaw = Number(body.lastPosition ?? 0);
    const lastPosition =
      Number.isNaN(lastPositionRaw) || lastPositionRaw < 0
        ? 0
        : Math.floor(lastPositionRaw);

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.module.course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Course is not published" },
        { status: 403 }
      );
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        courseId: lesson.module.course.id,
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: currentUser.id,
          lessonId,
        },
      },
      update: {
        watchedPercent,
        lastPosition,
      },
      create: {
        userId: currentUser.id,
        lessonId,
        watchedPercent,
        lastPosition,
      },
    });

    return NextResponse.json({
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    console.error("[STUDENT_PROGRESS_SAVE_ERROR]", error);

    const details =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to save progress",
        details,
      },
      { status: 500 }
    );
  }
}