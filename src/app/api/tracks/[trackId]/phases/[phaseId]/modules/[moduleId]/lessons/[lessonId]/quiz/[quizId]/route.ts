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

async function authorizeQuizOwner(
  token: string | undefined,
  trackId: string,
  phaseId: string,
  moduleId: string,
  lessonId: string,
  quizId: string
) {
  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await verifyToken();

  if (!decoded?.userId || !decoded?.role) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const quiz = await db.quiz.findFirst({
    where: {
      id: quizId,
      lessonId,
      lesson: {
        moduleId,
        module: {
          phaseId,
          phase: {
            trackId,
          },
        },
      },
    },
    include: {
      lesson: {
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
      },
    },
  });

  if (!quiz) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Quiz not found" }, { status: 404 }),
    };
  }

  if (
    decoded.role === "INSTRUCTOR" &&
    quiz.lesson.module.phase.track.instructorId !== decoded.userId
  ) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    quiz,
  };
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId, quizId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const authResult = await authorizeQuizOwner(
      token,
      trackId,
      phaseId,
      moduleId,
      lessonId,
      quizId
    );

    if (!authResult.ok) {
      return authResult.response;
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

    const updatedQuiz = await db.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        title,
        passingScore,
        maxAttempts,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("[QUIZ_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId, quizId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const authResult = await authorizeQuizOwner(
      token,
      trackId,
      phaseId,
      moduleId,
      lessonId,
      quizId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    await db.$transaction(async (tx) => {
      await tx.quizAttempt.deleteMany({
        where: {
          quizId,
        },
      });

      await tx.quiz.delete({
        where: {
          id: quizId,
        },
      });
    });

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("[QUIZ_DELETE_ERROR]", error);

    const details =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to delete quiz",
        details,
      },
      { status: 500 }
    );
  }
}