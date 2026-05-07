import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const LESSON_COMPLETE_THRESHOLD = 80;

interface StudentCourseResponse {
  id: string;
  title: string;
  description: string;
  overallProgress: number;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
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
      resources: Array<{ id: string; name: string; url: string }>;
    }>;
  }>;
}

export async function GET(
  req: Request,
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

    // Check if student is enrolled in this course and it's published
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        courseId: courseId,
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  include: {
                    progress: {
                      where: { userId: currentUser.id },
                    },
                    resources: {
                      select: { id: true, name: true, url: true },
                    },
                    quizzes: {
                      include: {
                        attempts: {
                          where: { userId: currentUser.id },
                          orderBy: { createdAt: "desc" },
                          take: 1,
                        },
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

    if (!enrollment) {
      return NextResponse.json(
        { error: "Course not found or not enrolled" },
        { status: 404 }
      );
    }

    // Ensure course is published
    if (enrollment.course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Course is not available" },
        { status: 403 }
      );
    }

    const course = enrollment.course;
    const allLessons = course.modules.flatMap((module) => module.lessons);

    // Calculate overall progress
    const completedLessons = allLessons.filter((lesson) => {
      const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
      const quiz = lesson.quizzes[0];
      const quizPassed = quiz && quiz.attempts.length > 0 ? quiz.attempts[0].passed : true;

      return watchedPercent >= LESSON_COMPLETE_THRESHOLD && quizPassed;
    }).length;

    const overallProgress =
      allLessons.length > 0
        ? Math.round((completedLessons / allLessons.length) * 100)
        : 0;

    const response: StudentCourseResponse = {
      id: course.id,
      title: course.title,
      description: course.description,
      overallProgress,
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        order: module.order,
        lessons: module.lessons.map((lesson) => {
          const progressRecord = lesson.progress[0];
          const quiz = lesson.quizzes[0];
          const latestAttempt = quiz?.attempts[0];
          const watchedPercent = progressRecord?.watchedPercent ?? 0;
          const isCompleted =
            watchedPercent >= LESSON_COMPLETE_THRESHOLD &&
            (latestAttempt ? latestAttempt.passed : true);

          return {
            id: lesson.id,
            title: lesson.title,
            notes: lesson.notes,
            videoPath: lesson.videoPath,
            order: lesson.order,
            watchedPercent,
            lastPosition: progressRecord?.lastPosition ?? 0,
            isCompleted,
            isUnlocked: true,
            quizId: quiz?.id ?? null,
            hasQuiz: lesson.quizzes.length > 0,
            quizPassed: latestAttempt ? latestAttempt.passed : false,
            attemptCount: quiz?.attempts.length ?? 0,
            latestScore: latestAttempt?.score ?? null,
            resources: lesson.resources || [],
          };
        }),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STUDENT_COURSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}