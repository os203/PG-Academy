import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const LESSON_COMPLETE_THRESHOLD = 80;

interface CourseSummaryResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export async function GET() {
  try {
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

    const enrollments = await db.enrollment.findMany({
      where: {
        userId: currentUser.id,
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
                      select: {
                        watchedPercent: true,
                      },
                    },
                    quizzes: {
                      include: {
                        attempts: {
                          where: { userId: currentUser.id },
                          orderBy: { createdAt: "desc" },
                          select: {
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
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const courses: CourseSummaryResponse[] = enrollments
      .filter((enrollment) => enrollment.course.status === "PUBLISHED")
      .map((enrollment) => {
        const allLessons = enrollment.course.modules.flatMap(
          (module) => module.lessons
        );

        const totalLessons = allLessons.length;

        const completedLessons = allLessons.filter((lesson) => {
          const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
          const quiz = lesson.quizzes[0];
          const quizPassed = quiz ? quiz.attempts.some((a) => a.passed) : true;

          return watchedPercent >= LESSON_COMPLETE_THRESHOLD && quizPassed;
        }).length;

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnail: enrollment.course.thumbnail ?? null,
          price: enrollment.course.price,
          status: enrollment.course.status,
          totalLessons,
          completedLessons,
          progressPercentage,
        };
      });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[STUDENT_COURSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}