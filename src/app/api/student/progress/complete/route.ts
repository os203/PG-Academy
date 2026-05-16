import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can complete lessons" },
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

    const lesson = await db.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        quizzes: {
          include: {
            attempts: {
              where: {
                userId: currentUser.id,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        module: {
          include: {
            phase: {
              include: {
                track: {
                  include: {
                    enrollments: {
                      where: {
                        userId: currentUser.id,
                        status: "APPROVED",
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const track = lesson.module.phase.track;

    if (!track.enrollments.length) {
      return NextResponse.json(
        { error: "Track not found or enrollment not approved" },
        { status: 403 }
      );
    }

    const hasQuiz = lesson.quizzes.length > 0;

    if (hasQuiz) {
      const allQuizzesPassed = lesson.quizzes.every((quiz) =>
        quiz.attempts.some((attempt) => attempt.passed)
      );

      if (!allQuizzesPassed) {
        return NextResponse.json(
          { error: "You must pass the lesson quiz before completing this lesson" },
          { status: 400 }
        );
      }
    }

    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: currentUser.id,
          lessonId,
        },
      },
      create: {
        userId: currentUser.id,
        lessonId,
        watchedPercent: 100,
        lastPosition: 0,
        isCompleted: true,
      },
      update: {
        watchedPercent: 100,
        isCompleted: true,
      },
    });

    return NextResponse.json(
      {
        message: "Lesson marked as complete",
        progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MARK_LESSON_COMPLETE_ERROR]", error);

    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}