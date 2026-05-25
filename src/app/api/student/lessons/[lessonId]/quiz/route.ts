import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const decoded = await verifyToken();

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

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
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
        quizzes: {
          orderBy: { createdAt: "desc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                options: {
                  orderBy: { order: "asc" },
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
      return NextResponse.json({ error: "Track not available" }, { status: 403 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId: lesson.module.phase.track.id,
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this track" },
        { status: 403 }
      );
    }

    const quiz = lesson.quizzes[0] ?? null;

    if (!quiz) {
      return NextResponse.json({ quiz: null });
    }

    const sanitizedQuiz = {
      id: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        type: question.type,
        order: question.order,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          order: option.order,
        })),
      })),
    };

    return NextResponse.json({ quiz: sanitizedQuiz });
  } catch (error) {
    console.error("[STUDENT_LESSON_QUIZ_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}