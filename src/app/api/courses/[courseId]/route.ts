import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: decoded.userId,
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                quizzes: {
                  orderBy: { createdAt: "desc" },
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

    const normalizedCourse = {
      ...course,
      modules: (course.modules || []).map((module) => ({
        ...module,
        lessons: Array.isArray(module.lessons)
          ? module.lessons.map((lesson) => ({
              ...lesson,
              quizzes: Array.isArray(lesson.quizzes) ? lesson.quizzes : [],
            }))
          : [],
      })),
    };

    return NextResponse.json(normalizedCourse);
  } catch (error) {
    console.error("[COURSE_GET_BY_ID_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: decoded.userId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await db.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error("[COURSE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}