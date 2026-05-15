import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

type CourseStatusValue = "DRAFT" | "PUBLISHED";

function isCourseStatus(value: string): value is CourseStatusValue {
  return value === "DRAFT" || value === "PUBLISHED";
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
                resources: true,
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
      typeof body.title === "string"
        ? body.title.trim()
        : authResult.course.title;

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

    const thumbnail =
      typeof body.thumbnail === "string"
        ? body.thumbnail.trim()
        : authResult.course.thumbnail;

    const categoryId =
      typeof body.categoryId === "string"
        ? body.categoryId.trim()
        : authResult.course.categoryId;

    const subtitle =
      typeof body.subtitle === "string"
        ? body.subtitle.trim()
        : (authResult.course as Record<string, unknown>).subtitle as string | null;

    const language =
      typeof body.language === "string"
        ? body.language.trim()
        : (authResult.course as Record<string, unknown>).language as string | null;

    const level =
      typeof body.level === "string"
        ? body.level.trim()
        : (authResult.course as Record<string, unknown>).level as string | null;

    const learningObjectives =
      typeof body.learningObjectives === "string"
        ? body.learningObjectives
        : (authResult.course as Record<string, unknown>).learningObjectives as string | null;

    const requirements =
      typeof body.requirements === "string"
        ? body.requirements
        : (authResult.course as Record<string, unknown>).requirements as string | null;

    const targetAudience =
      typeof body.targetAudience === "string"
        ? body.targetAudience
        : (authResult.course as Record<string, unknown>).targetAudience as string | null;

    const tags =
      typeof body.tags === "string"
        ? body.tags
        : (authResult.course as Record<string, unknown>).tags as string | null;

    const previewVideoUrl =
      typeof body.previewVideoUrl === "string"
        ? body.previewVideoUrl.trim()
        : (authResult.course as Record<string, unknown>).previewVideoUrl as string | null;

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
        subtitle,
        price,
        status,
        thumbnail,
        categoryId,
        language,
        level,
        learningObjectives,
        requirements,
        targetAudience,
        tags,
        previewVideoUrl,
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
