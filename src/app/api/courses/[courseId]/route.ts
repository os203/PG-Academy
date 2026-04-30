import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type CourseStatusValue = "DRAFT" | "PUBLISHED";

function isValidStatus(value: string): value is CourseStatusValue {
  return value === "DRAFT" || value === "PUBLISHED";
}

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
        lessons: Array.isArray(module.lessons) ? module.lessons : [],
      })),
    };

    return NextResponse.json(normalizedCourse);
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

    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const status =
      typeof body.status === "string" ? body.status.trim() : course.status;
    const price =
      body.price !== undefined && body.price !== null && body.price !== ""
        ? Number(body.price)
        : course.price;

    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }

    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: "Invalid course status" },
        { status: 400 }
      );
    }

    const updatedCourse = await db.course.update({
      where: { id: courseId },
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