import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const track = await db.track.findFirst({
      where: {
        id: trackId,
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
        phases: {
          orderBy: {
            order: "asc",
          },
          include: {
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

    if (!track) {
      return NextResponse.json(
        { error: "Track not found or not published" },
        { status: 404 }
      );
    }

    // Flatten modules from phases
    const allModules = track.phases.flatMap((phase) => phase.modules);

    // Calculate aggregated track data
    const lessonsCount = allModules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    const reviewCount = track.reviews.length;
    const averageRating = reviewCount
      ? track.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    // Calculate total duration
    const totalDuration = allModules.reduce(
      (total, mod) =>
        total + mod.lessons.reduce((lt: number, l) => lt + (l.duration || 0), 0),
      0
    );

    // Get instructor stats
    const instructorCourses = await db.track.findMany({
      where: { instructorId: track.instructor.id, status: "PUBLISHED" },
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
      id: track.id,
      title: track.title,
      subtitle: track.subtitle,
      description: track.description,
      thumbnail: track.thumbnail,
      price: track.price,
      category: track.category?.name || "Others",
      language: track.language || "English",
      level: track.level || "All Levels",
      previewVideoUrl: track.previewVideoUrl,
      learningObjectives: parseJsonArray(track.learningObjectives),
      requirements: parseJsonArray(track.requirements),
      targetAudience: parseJsonArray(track.targetAudience),
      tags: parseJsonArray(track.tags),
      updatedAt: track.updatedAt,
      instructorName: track.instructor.name,
      instructor: {
        id: track.instructor.id,
        name: track.instructor.name,
        bio: track.instructor.bio,
        rating: Number(instructorAvgRating.toFixed(1)),
        reviewCount: instructorReviewCount,
        studentsCount: instructorTotalStudents,
        coursesCount: instructorCourses.length,
      },
      modulesCount: allModules.length,
      lessonsCount,
      totalDuration,
      studentsCount: track._count.enrollments,
      rating: Number(averageRating.toFixed(1)),
      reviewCount,
      phases: track.phases.map((phase) => ({
        id: phase.id,
        title: phase.title,
        order: phase.order,
        modules: phase.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessonsCount: m.lessons.length,
          totalDuration: m.lessons.reduce((s: number, l) => s + (l.duration || 0), 0),
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            order: l.order,
            duration: l.duration,
          })),
        })),
      })),
    };

    return NextResponse.json({ track: publicCourseData });
  } catch (error) {
    console.error("[PUBLIC_COURSE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
