import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function normalizePassingScore(value: unknown): number {
  const num = Number(value);
  if (Number.isNaN(num)) return 50;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.floor(num);
}

function normalizeMaxAttempts(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);

  if (Number.isNaN(num) || num <= 0) {
    return null;
  }

  return Math.floor(num);
}

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId } = await params;

    const decoded = await verifyToken();

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // فقط Admin أو Instructor
    if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          phaseId,
          phase: {
            trackId,
          },
        },
      },
      include: {
        module: {
          include: {
            phase: {
              include: {
                track: {
                  select: {
                    instructorId: true,
                  },
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

    // Instructor لازم يكون صاحب الكورس
    if (
      decoded.role === "INSTRUCTOR" &&
      lesson.module.phase.track.instructorId !== decoded.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quiz = await db.quiz.findFirst({
      where: {
        lessonId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!quiz) {
      return NextResponse.json({ quiz: null });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("[QUIZ_GET_BY_LESSON_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId } = await params;

    const decoded = await verifyToken();

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          phaseId,
          phase: {
            trackId,
          },
        },
      },
      include: {
        module: {
          include: {
            phase: {
              include: {
                track: {
                  select: {
                    instructorId: true,
                  },
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

    if (
      decoded.role === "INSTRUCTOR" &&
      lesson.module.phase.track.instructorId !== decoded.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingQuiz = await db.quiz.findFirst({
      where: {
        lessonId,
      },
      select: {
        id: true,
      },
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: "A quiz already exists for this lesson" },
        { status: 409 }
      );
    }

    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const passingScore = normalizePassingScore(body.passingScore);
    const maxAttempts = normalizeMaxAttempts(body.maxAttempts);

    if (!title) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 }
      );
    }

    const quiz = await db.quiz.create({
      data: {
        title,
        lessonId,
        passingScore,
        maxAttempts,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("[QUIZ_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
