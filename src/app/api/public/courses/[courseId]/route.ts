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
        status: "PUBLISHED", // Only allow fetching published courses publicly
      },
      include: {
        instructor: {
          select: {
            name: true,
            email: true,
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
                // Notice we do NOT select videoUrl or textContent here.
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

    // Calculate aggregated data
    const lessonsCount = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    const reviewCount = course.reviews.length;
    const averageRating = reviewCount
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    const publicCourseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      category: course.category || "Others",
      instructorName: course.instructor.name,
      modulesCount: course.modules.length,
      lessonsCount,
      studentsCount: course._count.enrollments,
      rating: Number(averageRating.toFixed(1)),
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessons: m.lessons,
      })),
    };

    return NextResponse.json({ course: publicCourseData });
  } catch (error) {
    console.error("[PUBLIC_COURSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
