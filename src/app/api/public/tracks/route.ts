import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface PublicCourseResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  instructorName: string;
  modulesCount: number;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  category: string;
}

export async function GET() {
  try {
    const tracks = await db.track.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: { select: { name: true } },
        instructor: {
          select: {
            name: true,
          },
        },
        phases: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const normalizedCourses: PublicCourseResponse[] = tracks.map((track) => {
      const allModules = track.phases.flatMap((phase) => phase.modules);
      const lessonsCount = allModules.reduce((total, module) => {
        return total + module.lessons.length;
      }, 0);

      const reviewCount = track.reviews.length;
      const averageRating = reviewCount
        ? track.reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviewCount
        : 0;

      return {
        id: track.id,
        title: track.title,
        description: track.description,
        thumbnail: track.thumbnail ?? null,
        price: track.price,
        status: track.status,
        instructorName: track.instructor.name,
        modulesCount: allModules.length,
        lessonsCount,
        studentsCount: track._count.enrollments,
        rating: Number(averageRating.toFixed(1)),
        category: track.category?.name || "Others",
      };
    });

    return NextResponse.json({ tracks: normalizedCourses });
  } catch (error) {
    console.error("[PUBLIC_COURSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}