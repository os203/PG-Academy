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

    if (lesson.module.course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Course not available" }, { status: 403 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        courseId: lesson.module.course.id,
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
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