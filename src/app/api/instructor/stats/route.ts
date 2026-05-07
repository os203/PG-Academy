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

    const instructorId = decoded.userId;

    // Get all courses for this instructor
    const courses = await db.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        modules: {
          select: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    const courseIds = courses.map((c) => c.id);

    // Total unique students
    const totalStudents = await db.enrollment.groupBy({
      by: ["userId"],
      where: { courseId: { in: courseIds } },
    });

    // Revenue estimate: sum course price * enrollment count
    const coursesWithEnrollments = await db.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        price: true,
        _count: { select: { enrollments: true } },
      },
    });
    const totalRevenue = coursesWithEnrollments.reduce(
      (sum, c) => sum + c.price * c._count.enrollments,
      0
    );

    // Average completion percentage
    const allLessonIds = courses.flatMap((c) =>
      c.modules.flatMap((m) => m.lessons.map((l) => l.id))
    );
    const totalLessons = allLessonIds.length;

    let avgCompletion = 0;
    if (totalStudents.length > 0 && totalLessons > 0) {
      const totalCompleted = await db.progress.count({
        where: {
          lessonId: { in: allLessonIds },
          watchedPercent: { gte: 90 },
        },
      });
      avgCompletion = Math.round(
        (totalCompleted / (totalStudents.length * totalLessons)) * 100
      );
    }

    // Unanswered Q&A count
    const unansweredQA = await db.qAQuestion.count({
      where: {
        lesson: {
          module: {
            course: { instructorId },
          },
        },
        answer: null,
      },
    });

    return NextResponse.json({
      totalStudents: totalStudents.length,
      totalRevenue,
      avgCompletion,
      unansweredQA,
      totalCourses: courseIds.length,
    });
  } catch (error) {
    console.error("[INSTRUCTOR_STATS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
