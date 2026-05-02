import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type QuestionTypeValue = "MULTIPLE_CHOICE" | "TRUE_FALSE";

interface UpdateOptionInput {
  optionText: string;
  isCorrect: boolean;
  order?: number;
}

function isQuestionType(value: string): value is QuestionTypeValue {
  return value === "MULTIPLE_CHOICE" || value === "TRUE_FALSE";
}

function normalizeOption(
  option: unknown,
  fallbackOrder: number
): UpdateOptionInput | null {
  if (!option || typeof option !== "object") {
    return null;
  }

  const raw = option as {
    optionText?: unknown;
    isCorrect?: unknown;
    order?: unknown;
  };

  const optionText =
    typeof raw.optionText === "string" ? raw.optionText.trim() : "";

  if (!optionText) {
    return null;
  }

  return {
    optionText,
    isCorrect: Boolean(raw.isCorrect),
    order:
      typeof raw.order === "number" && raw.order > 0
        ? Math.floor(raw.order)
        : fallbackOrder,
  };
}

async function authorizeQuestionOwner(
  courseId: string,
  moduleId: string,
  lessonId: string,
  quizId: string,
  questionId: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await verifyToken(token);

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

  const question = await db.quizQuestion.findFirst({
    where: {
      id: questionId,
      quizId,
      quiz: {
        lessonId,
        lesson: {
          moduleId,
          module: {
            courseId,
          },
        },
      },
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
      quiz: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  course: {
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

  if (!question) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      ),
    };
  }

  if (
    decoded.role === "INSTRUCTOR" &&
    question.quiz.lesson.module.course.instructorId !== decoded.userId
  ) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    question,
  };
}

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, quizId, questionId } = await params;

    const authResult = await authorizeQuestionOwner(
      courseId,
      moduleId,
      lessonId,
      quizId,
      questionId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    return NextResponse.json(authResult.question);
  } catch (error) {
    console.error("[QUIZ_QUESTION_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, quizId, questionId } = await params;

    const authResult = await authorizeQuestionOwner(
      courseId,
      moduleId,
      lessonId,
      quizId,
      questionId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();

    const questionText =
      typeof body.questionText === "string" ? body.questionText.trim() : "";

    const type =
      typeof body.type === "string" ? body.type.trim() : "";

    const order =
      typeof body.order === "number" && body.order > 0
        ? Math.floor(body.order)
        : authResult.question.order;

    const correctTrueFalse =
      typeof body.correctTrueFalse === "boolean"
        ? body.correctTrueFalse
        : null;

    if (!questionText) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    if (!isQuestionType(type)) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      );
    }

    if (type === "TRUE_FALSE") {
      if (correctTrueFalse === null) {
        return NextResponse.json(
          { error: "correctTrueFalse is required for TRUE_FALSE questions" },
          { status: 400 }
        );
      }

      const updated = await db.$transaction(async (tx) => {
        await tx.quizOption.deleteMany({
          where: {
            questionId,
          },
        });

        return tx.quizQuestion.update({
          where: { id: questionId },
          data: {
            questionText,
            type,
            order,
            correctTrueFalse,
          },
          include: {
            options: {
              orderBy: {
                order: "asc",
              },
            },
          },
        });
      });

      return NextResponse.json(updated);
    }

    const rawOptions: unknown[] = Array.isArray(body.options) ? body.options : [];

    const options = rawOptions
      .map((option: unknown, index: number) =>
        normalizeOption(option, index + 1)
      )
      .filter(
        (option: UpdateOptionInput | null): option is UpdateOptionInput =>
          option !== null
      );

    if (options.length < 2) {
      return NextResponse.json(
        { error: "MULTIPLE_CHOICE questions require at least 2 options" },
        { status: 400 }
      );
    }

    const correctCount = options.filter(
      (option: UpdateOptionInput) => option.isCorrect
    ).length;

    if (correctCount !== 1) {
      return NextResponse.json(
        {
          error:
            "MULTIPLE_CHOICE questions must have exactly 1 correct option",
        },
        { status: 400 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      await tx.quizOption.deleteMany({
        where: {
          questionId,
        },
      });

      return tx.quizQuestion.update({
        where: { id: questionId },
        data: {
          questionText,
          type,
          order,
          correctTrueFalse: null,
          options: {
            create: options.map((option: UpdateOptionInput, index: number) => ({
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              order:
                typeof option.order === "number" && option.order > 0
                  ? option.order
                  : index + 1,
            })),
          },
        },
        include: {
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[QUIZ_QUESTION_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
      questionId: string;
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, quizId, questionId } = await params;

    const authResult = await authorizeQuestionOwner(
      courseId,
      moduleId,
      lessonId,
      quizId,
      questionId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    await db.quizQuestion.delete({
      where: {
        id: questionId,
      },
    });

    return NextResponse.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("[QUIZ_QUESTION_DELETE_ERROR]", error);

    const details =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to delete question",
        details,
      },
      { status: 500 }
    );
  }
}