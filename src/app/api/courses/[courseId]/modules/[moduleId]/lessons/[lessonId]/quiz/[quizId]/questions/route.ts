import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type QuestionTypeValue = "MULTIPLE_CHOICE" | "TRUE_FALSE";

interface CreateOptionInput {
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
): CreateOptionInput | null {
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

async function authorizeQuizOwner(
  courseId: string,
  moduleId: string,
  lessonId: string,
  quizId: string
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

  const quiz = await db.quiz.findFirst({
    where: {
      id: quizId,
      lessonId,
      lesson: {
        moduleId,
        module: {
          courseId,
        },
      },
    },
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
  });

  if (!quiz) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Quiz not found" }, { status: 404 }),
    };
  }

  if (
    decoded.role === "INSTRUCTOR" &&
    quiz.lesson.module.course.instructorId !== decoded.userId
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
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, quizId } = await params;

    const authResult = await authorizeQuizOwner(
      courseId,
      moduleId,
      lessonId,
      quizId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    const questions = await db.quizQuestion.findMany({
      where: {
        quizId,
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[QUIZ_QUESTIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      moduleId: string;
      lessonId: string;
      quizId: string;
    }>;
  }
) {
  try {
    const { courseId, moduleId, lessonId, quizId } = await params;

    const authResult = await authorizeQuizOwner(
      courseId,
      moduleId,
      lessonId,
      quizId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();

    const questionText =
      typeof body.questionText === "string" ? body.questionText.trim() : "";

    const type =
      typeof body.type === "string" ? body.type.trim() : "";

    const providedOrder =
      typeof body.order === "number" && body.order > 0
        ? Math.floor(body.order)
        : null;

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

    const lastQuestion = await db.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = providedOrder ?? ((lastQuestion?.order ?? 0) + 1);

    if (type === "TRUE_FALSE") {
      if (correctTrueFalse === null) {
        return NextResponse.json(
          { error: "correctTrueFalse is required for TRUE_FALSE questions" },
          { status: 400 }
        );
      }

      const question = await db.quizQuestion.create({
        data: {
          quizId,
          questionText,
          type,
          order: nextOrder,
          correctTrueFalse,
        },
        include: {
          options: true,
        },
      });

      return NextResponse.json(question, { status: 201 });
    }

    const rawOptions: unknown[] = Array.isArray(body.options) ? body.options : [];

    const options = rawOptions
      .map((option: unknown, index: number) =>
        normalizeOption(option, index + 1)
      )
      .filter(
        (option: CreateOptionInput | null): option is CreateOptionInput =>
          option !== null
      );

    if (options.length < 2) {
      return NextResponse.json(
        { error: "MULTIPLE_CHOICE questions require at least 2 options" },
        { status: 400 }
      );
    }

    const correctCount = options.filter(
      (option: CreateOptionInput) => option.isCorrect
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

    const question = await db.quizQuestion.create({
      data: {
        quizId,
        questionText,
        type,
        order: nextOrder,
        correctTrueFalse: null,
        options: {
          create: options.map((option: CreateOptionInput, index: number) => ({
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("[QUIZ_QUESTION_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}