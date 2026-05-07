import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId || (decoded.role !== "INSTRUCTOR" && decoded.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all courses this instructor owns
    const courses = await db.course.findMany({
      where:
        decoded.role === "ADMIN"
          ? {}
          : { instructorId: decoded.userId },
      select: {
        id: true,
        title: true,
        modules: {
          select: {
            lessons: {
              select: { id: true },
            },
          },
        },
        enrollments: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            enrolledAt: true,
          },
        },
      },
    });

    // Build a flat list of students with their progress
    const students: Array<{
      userId: string;
      name: string;
      email: string;
      courseId: string;
      courseTitle: string;
      enrolledAt: string;
      totalLessons: number;
      completedLessons: number;
      progressPercent: number;
      bestQuizScore: number | null;
    }> = [];

    for (const course of courses) {
      const allLessonIds = course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );
      const totalLessons = allLessonIds.length;

      for (const enrollment of course.enrollments) {
        const studentId = enrollment.user.id;

        // Count completed lessons (watchedPercent >= 90)
        const completedCount = totalLessons > 0
          ? await db.progress.count({
              where: {
                userId: studentId,
                lessonId: { in: allLessonIds },
                watchedPercent: { gte: 90 },
              },
            })
          : 0;

        // Get best quiz score for this student in this course
        const bestAttempt = allLessonIds.length > 0
          ? await db.quizAttempt.findFirst({
              where: {
                userId: studentId,
                quiz: {
                  lessonId: { in: allLessonIds },
                },
              },
              orderBy: { score: "desc" },
              select: { score: true },
            })
          : null;

        students.push({
          userId: studentId,
          name: enrollment.user.name,
          email: enrollment.user.email,
          courseId: course.id,
          courseTitle: course.title,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          totalLessons,
          completedLessons: completedCount,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0,
          bestQuizScore: bestAttempt?.score ?? null,
        });
      }
    }

    return NextResponse.json({
      students,
      courseNames: courses.map((c) => ({ id: c.id, title: c.title })),
    });
  } catch (error) {
    console.error("[INSTRUCTOR_STUDENTS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
