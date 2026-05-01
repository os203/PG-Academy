import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const LESSON_COMPLETE_THRESHOLD = 80;

interface StudentLessonResponse {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
  watchedPercent: number;
  lastPosition: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  quizId: string | null;
  hasQuiz: boolean;
  quizPassed: boolean;
  attemptCount: number;
  latestScore: number | null;
}

interface StudentModuleResponse {
  id: string;
  title: string;
  order: number;
  lessons: StudentLessonResponse[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

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

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        courseId,
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                progress: {
                  where: { userId: currentUser.id },
                  select: {
                    watchedPercent: true,
                    lastPosition: true,
                  },
                },
                quizzes: {
                  orderBy: { createdAt: "desc" },
                  include: {
                    attempts: {
                      where: { userId: currentUser.id },
                      orderBy: { createdAt: "desc" },
                      select: {
                        score: true,
                        passed: true,
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

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let previousLessonSatisfied = true;
    let completedLessons = 0;
    let totalLessons = 0;

    const modules: StudentModuleResponse[] = course.modules.map((module) => {
      const lessons: StudentLessonResponse[] = module.lessons.map((lesson, index) => {
        const lessonProgress = lesson.progress[0];
        const watchedPercent = lessonProgress?.watchedPercent ?? 0;
        const lastPosition = lessonProgress?.lastPosition ?? 0;

        const quiz = lesson.quizzes[0] ?? null;
        const hasQuiz = Boolean(quiz);
        const quizPassed = quiz ? quiz.attempts.some((a) => a.passed) : false;
        const attemptCount = quiz ? quiz.attempts.length : 0;
        const latestScore = quiz?.attempts[0]?.score ?? null;

        const isCompleted =
          watchedPercent >= LESSON_COMPLETE_THRESHOLD &&
          (!hasQuiz || quizPassed);

        const isFirstLessonInCourse = totalLessons === 0 && index === 0;
        const isUnlocked = isFirstLessonInCourse ? true : previousLessonSatisfied;

        totalLessons += 1;

        if (isCompleted) {
          completedLessons += 1;
        }

        previousLessonSatisfied = isCompleted;

        return {
          id: lesson.id,
          title: lesson.title,
          notes: lesson.notes ?? null,
          videoPath: lesson.videoPath ?? null,
          order: lesson.order,
          watchedPercent,
          lastPosition,
          isCompleted,
          isUnlocked,
          quizId: quiz?.id ?? null,
          hasQuiz,
          quizPassed,
          attemptCount,
          latestScore,
        };
      });

      return {
        id: module.id,
        title: module.title,
        order: module.order,
        lessons,
      };
    });

    const overallProgress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      overallProgress,
      modules,
    });
  } catch (error) {
    console.error("[STUDENT_COURSE_DETAIL_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
