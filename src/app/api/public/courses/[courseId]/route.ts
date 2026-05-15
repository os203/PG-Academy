import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
      },
      include: {
        category: { select: { name: true } },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          },
        },
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                title: true,
                order: true,
                duration: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or not published" },
        { status: 404 }
      );
    }

    // Calculate aggregated course data
    const lessonsCount = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    const reviewCount = course.reviews.length;
    const averageRating = reviewCount
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    // Calculate total duration
    const totalDuration = course.modules.reduce(
      (total, mod) =>
        total + mod.lessons.reduce((lt, l) => lt + (l.duration || 0), 0),
      0
    );

    // Get instructor stats
    const instructorCourses = await db.course.findMany({
      where: { instructorId: course.instructor.id, status: "PUBLISHED" },
      select: {
        id: true,
        reviews: { select: { rating: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const instructorTotalStudents = instructorCourses.reduce(
      (sum, c) => sum + c._count.enrollments,
      0
    );

    const allInstructorReviews = instructorCourses.flatMap((c) => c.reviews);
    const instructorReviewCount = allInstructorReviews.length;
    const instructorAvgRating = instructorReviewCount
      ? allInstructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviewCount
      : 0;

    // Safely parse JSON string fields
    const parseJsonArray = (val: string | null): string[] => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const publicCourseData = {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      category: course.category?.name || "Others",
      language: course.language || "English",
      level: course.level || "All Levels",
      previewVideoUrl: course.previewVideoUrl,
      learningObjectives: parseJsonArray(course.learningObjectives),
      requirements: parseJsonArray(course.requirements),
      targetAudience: parseJsonArray(course.targetAudience),
      tags: parseJsonArray(course.tags),
      updatedAt: course.updatedAt,
      instructorName: course.instructor.name,
      instructor: {
        id: course.instructor.id,
        name: course.instructor.name,
        bio: course.instructor.bio,
        rating: Number(instructorAvgRating.toFixed(1)),
        reviewCount: instructorReviewCount,
        studentsCount: instructorTotalStudents,
        coursesCount: instructorCourses.length,
      },
      modulesCount: course.modules.length,
      lessonsCount,
      totalDuration,
      studentsCount: course._count.enrollments,
      rating: Number(averageRating.toFixed(1)),
      reviewCount,
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessonsCount: m.lessons.length,
        totalDuration: m.lessons.reduce((s, l) => s + (l.duration || 0), 0),
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          duration: l.duration,
        })),
      })),
    };

    return NextResponse.json({ course: publicCourseData });
  } catch (error) {
    console.error("[PUBLIC_COURSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
