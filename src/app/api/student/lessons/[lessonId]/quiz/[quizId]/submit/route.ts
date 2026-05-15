import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface SubmittedAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerBoolean?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                phase: {
                  include: {
                    track: {
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: true,
          },
        },
        attempts: {
          where: { userId: currentUser.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.lesson.module.phase.track.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Track not available" }, { status: 403 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId: quiz.lesson.module.phase.track.id,
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this track" },
        { status: 403 }
      );
    }

    const attemptCount = quiz.attempts.length;

    if (quiz.maxAttempts !== null && attemptCount >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: "Maximum attempts reached" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const submittedAnswers: SubmittedAnswer[] = Array.isArray(body.answers)
      ? body.answers
      : [];

    const answerMap = new Map<string, SubmittedAnswer>();
    submittedAnswers.forEach((answer) => {
      if (answer && typeof answer.questionId === "string") {
        answerMap.set(answer.questionId, answer);
      }
    });

    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return NextResponse.json(
        { error: "Quiz has no questions" },
        { status: 400 }
      );
    }

    let correctAnswers = 0;

    quiz.questions.forEach((question) => {
      const submitted = answerMap.get(question.id);

      if (!submitted) {
        return;
      }

      if (question.type === "TRUE_FALSE") {
        if (
          typeof submitted.answerBoolean === "boolean" &&
          submitted.answerBoolean === question.correctTrueFalse
        ) {
          correctAnswers += 1;
        }
        return;
      }

      const selectedOptionId =
        typeof submitted.selectedOptionId === "string"
          ? submitted.selectedOptionId
          : "";

      if (!selectedOptionId) {
        return;
      }

      const correctOption = question.options.find((option) => option.isCorrect);

      if (correctOption && correctOption.id === selectedOptionId) {
        correctAnswers += 1;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        userId: currentUser.id,
        quizId,
        score,
        passed,
      },
    });

    return NextResponse.json({
      message: "Quiz submitted successfully",
      attemptId: attempt.id,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      attemptCount: attemptCount + 1,
      remainingAttempts:
        quiz.maxAttempts === null ? null : quiz.maxAttempts - (attemptCount + 1),
    });
  } catch (error) {
    console.error("[STUDENT_QUIZ_SUBMIT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}