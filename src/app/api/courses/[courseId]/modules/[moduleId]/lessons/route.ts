import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedCourse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;

    const authResult = await getAuthorizedCourse(courseId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const moduleRecord = await db.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({ lessons: moduleRecord.lessons });
  } catch (error) {
    console.error("[LESSONS_GET_ERROR]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const videoPath =
      typeof body.videoPath === "string" ? body.videoPath.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const authResult = await getAuthorizedCourse(courseId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const moduleRecord = await db.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const lastLesson = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await db.lesson.create({
      data: {
        title,
        notes: notes || null,
        videoPath: videoPath || null,
        moduleId,
        order: newOrder,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("[LESSON_CREATE_ERROR]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}