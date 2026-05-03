import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type CourseStatusValue = "DRAFT" | "PUBLISHED";

function isCourseStatus(value: string): value is CourseStatusValue {
  return value === "DRAFT" || value === "PUBLISHED";
}

async function getAuthorizedCourse(courseId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await verifyToken(token);

  if (!decoded?.userId || !decoded?.role) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const course = await db.course.findFirst({
    where:
      decoded.role === "ADMIN"
        ? { id: courseId }
        : {
            id: courseId,
            instructorId: decoded.userId,
          },
  });

  if (!course) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Course not found" }, { status: 404 }),
    };
  }

  return {
    ok: true as const,
    course,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const authResult = await getAuthorizedCourse(courseId);

    if (!authResult.ok) {
      return authResult.response;
    }

    const course = await db.course.findFirst({
      where: { id: courseId },
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

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_GET_BY_ID_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const authResult = await getAuthorizedCourse(courseId);

    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : authResult.course.title;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : authResult.course.description;

    const price =
      typeof body.price === "number" && Number.isFinite(body.price)
        ? body.price
        : authResult.course.price;

    const statusRaw =
      typeof body.status === "string"
        ? body.status.trim()
        : authResult.course.status;

    const status: CourseStatusValue = isCourseStatus(statusRaw)
      ? statusRaw
      : authResult.course.status;

    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Course description is required" },
        { status: 400 }
      );
    }

    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        title,
        description,
        price,
        status,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const authResult = await getAuthorizedCourse(courseId);

    if (!authResult.ok) {
      return authResult.response;
    }

    await db.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error("[COURSE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}