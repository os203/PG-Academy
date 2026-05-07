import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type CourseStatusValue = "DRAFT" | "PUBLISHED";

function isCourseStatus(value: string): value is CourseStatusValue {
  return value === "DRAFT" || value === "PUBLISHED";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const courses = await db.course.findMany({
      where:
        decoded.role === "ADMIN"
          ? {}
          : {
              instructorId: decoded.userId,
            },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnail: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        instructor: { select: { name: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
        modules: {
          select: {
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[COURSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only Admins can create courses." }, { status: 403 });
    }

    const body = await req.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const price =
      typeof body.price === "number" && Number.isFinite(body.price)
        ? body.price
        : 0;

    const statusRaw =
      typeof body.status === "string" ? body.status.trim() : "DRAFT";

    const status: CourseStatusValue = isCourseStatus(statusRaw)
      ? statusRaw
      : "DRAFT";

    const thumbnail =
      typeof body.thumbnail === "string" ? body.thumbnail.trim() : null;

    const category =
      typeof body.category === "string" ? body.category.trim() : null;

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

    const instructorId = typeof body.instructorId === "string" ? body.instructorId.trim() : null;
    if (!instructorId) {
      return NextResponse.json(
        { error: "Instructor ID is required to create a course." },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        price,
        status,
        thumbnail,
        category,
        instructorId: instructorId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("[COURSE_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}