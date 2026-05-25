import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken();

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can mark lessons complete" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const lessonId =
      typeof body.lessonId === "string" ? body.lessonId.trim() : "";

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // ---------- Fetch the lesson + its full track hierarchy ----------
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quizzes: {
          include: {
            attempts: {
              where: { userId: currentUser.id },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        module: {
          include: {
            phase: {
              include: {
                track: {
                  select: { id: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.module.phase.track.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Track is not published" },
        { status: 403 }
      );
    }

    const trackId = lesson.module.phase.track.id;

    // ---------- Enrollment check ----------
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId,
        status: "APPROVED",
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this track" },
        { status: 403 }
      );
    }

    // ---------- Already completed? ----------
    const existingProgress = await db.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: currentUser.id,
          lessonId,
        },
      },
    });

    if (existingProgress?.isCompleted) {
      return NextResponse.json({
        message: "Lesson is already completed",
        progress: existingProgress,
      });
    }

    // ---------- P0 #2: Quiz prerequisite check ----------
    // If this lesson has quizzes, at least one must be passed
    if (lesson.quizzes.length > 0) {
      const hasPassedQuiz = lesson.quizzes.some(
        (quiz) => quiz.attempts.length > 0 && quiz.attempts[0].passed
      );

      if (!hasPassedQuiz) {
        return NextResponse.json(
          {
            error:
              "You must pass the quiz before marking this lesson as complete.",
          },
          { status: 400 }
        );
      }
    }

    // ---------- P0 #1: Sequential learning enforcement ----------
    // Fetch ALL phases → modules → lessons for this track, ordered correctly
    const trackData = await db.track.findUnique({
      where: { id: trackId },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!trackData) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Build a flat ordered list of lesson IDs
    const orderedLessonIds: string[] = [];
    for (const phase of trackData.phases) {
      for (const mod of phase.modules) {
        for (const les of mod.lessons) {
          orderedLessonIds.push(les.id);
        }
      }
    }

    const currentIndex = orderedLessonIds.indexOf(lessonId);

    if (currentIndex < 0) {
      return NextResponse.json(
        { error: "Lesson not found in this track's curriculum" },
        { status: 400 }
      );
    }

    // Check that ALL previous lessons are completed
    if (currentIndex > 0) {
      const previousLessonIds = orderedLessonIds.slice(0, currentIndex);

      const completedCount = await db.progress.count({
        where: {
          userId: currentUser.id,
          lessonId: { in: previousLessonIds },
          isCompleted: true,
        },
      });

      if (completedCount < previousLessonIds.length) {
        return NextResponse.json(
          {
            error:
              "Complete all previous lessons before marking this one as complete.",
          },
          { status: 400 }
        );
      }
    }

    // ---------- Mark complete ----------
    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: currentUser.id,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        watchedPercent: 100,
      },
      create: {
        userId: currentUser.id,
        lessonId,
        isCompleted: true,
        watchedPercent: 100,
      },
    });

    return NextResponse.json({
      message: "Lesson marked as complete!",
      progress,
    });
  } catch (error) {
    console.error("[STUDENT_PROGRESS_COMPLETE_ERROR]", error);

    const details =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { error: "Failed to mark lesson complete", details },
      { status: 500 }
    );
  }
}
