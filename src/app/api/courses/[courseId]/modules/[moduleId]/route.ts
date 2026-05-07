import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
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
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Module title is required" },
        { status: 400 }
      );
    }

    const updatedModule = await db.module.update({
      where: { id: moduleId },
      data: { title },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("[MODULE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
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
      select: {
        id: true,
      },
    });

    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      const lessons = await tx.lesson.findMany({
        where: { moduleId },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length > 0) {
        const quizzes = await tx.quiz.findMany({
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
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
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
        });

        await tx.progress.deleteMany({
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
        });

        await tx.qAQuestion.deleteMany({
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
        });

        await tx.lesson.deleteMany({
          where: {
            id: {
              in: lessonIds,
            },
          },
        });
      }

      await tx.module.delete({
        where: {
          id: moduleId,
        },
      });
    });

    return NextResponse.json({
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE_MODULE_ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: "Failed to delete module",
        details: message,
      },
      { status: 500 }
    );
  }
}