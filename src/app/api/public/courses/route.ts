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
}

export async function GET() {
  try {
    const courses = await db.course.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
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
        createdAt: "desc",
      },
    });

    const normalizedCourses: PublicCourseResponse[] = courses.map((course) => {
      const lessonsCount = course.modules.reduce((total, module) => {
        return total + module.lessons.length;
      }, 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail ?? null,
        price: course.price,
        status: course.status,
        instructorName: course.instructor.name,
        modulesCount: course.modules.length,
        lessonsCount,
      };
    });

    return NextResponse.json({ courses: normalizedCourses });
  } catch (error) {
    console.error("[PUBLIC_COURSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
