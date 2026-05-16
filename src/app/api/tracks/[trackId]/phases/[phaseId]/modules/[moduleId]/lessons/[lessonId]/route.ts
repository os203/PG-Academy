import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const moduleRecord = await db.module.findFirst({
      where: {
        id: moduleId,
        phaseId,
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const lessonRecord = await db.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
      },
    });

    if (!lessonRecord) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const body = await req.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const videoPath = typeof body.videoPath === "string" ? body.videoPath.trim() : "";
    const isPublished = body.isPublished;

    if (!title) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const updatedLesson = await db.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        notes: notes || null,
        videoPath: videoPath || null,
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("[LESSON_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const moduleRecord = await db.module.findFirst({
      where: {
        id: moduleId,
        phaseId,
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const lessonRecord = await db.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
      },
      select: {
        id: true,
      },
    });

    if (!lessonRecord) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      const quizzes = await tx.quiz.findMany({
        where: { lessonId },
        select: { id: true },
      });

      const quizIds = quizzes.map((quiz) => quiz.id);

      if (quizIds.length > 0) {
        await tx.quizAttempt.deleteMany({
          where: {
            quizId: {
              in: quizIds,
            },
          },
        });
      }

      await tx.quiz.deleteMany({
        where: { lessonId },
      });

      await tx.progress.deleteMany({
        where: { lessonId },
      });

      await tx.qAQuestion.deleteMany({
        where: { lessonId },
      });

      await tx.lesson.delete({
        where: { id: lessonId },
      });
    });

    return NextResponse.json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE_LESSON_ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: "Failed to delete lesson",
        details: message,
      },
      { status: 500 }
    );
  }
}