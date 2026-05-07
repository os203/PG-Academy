import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId || (decoded.role !== "INSTRUCTOR" && decoded.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all lessons from instructor's courses
    const courses = await db.course.findMany({
      where:
        decoded.role === "ADMIN"
          ? {}
          : { instructorId: decoded.userId },
      select: {
        id: true,
        title: true,
        modules: {
          select: {
            lessons: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    const lessonMap = new Map<string, { lessonTitle: string; courseTitle: string }>();
    for (const course of courses) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          lessonMap.set(lesson.id, {
            lessonTitle: lesson.title,
            courseTitle: course.title,
          });
        }
      }
    }

    const lessonIds = Array.from(lessonMap.keys());

    if (lessonIds.length === 0) {
      return NextResponse.json({ questions: [], unansweredCount: 0 });
    }

    const questions = await db.qAQuestion.findMany({
      where: {
        lessonId: { in: lessonIds },
      },
      orderBy: [
        { answer: "asc" }, // unanswered first (null comes first)
        { createdAt: "desc" },
      ],
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const mapped = questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      studentName: q.user.name,
      studentEmail: q.user.email,
      lessonTitle: lessonMap.get(q.lessonId)?.lessonTitle ?? "Unknown",
      courseTitle: lessonMap.get(q.lessonId)?.courseTitle ?? "Unknown",
    }));

    const unansweredCount = mapped.filter((q) => !q.answer).length;

    return NextResponse.json({ questions: mapped, unansweredCount });
  } catch (error) {
    console.error("[INSTRUCTOR_QA_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId || (decoded.role !== "INSTRUCTOR" && decoded.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { questionId, answer } = body;

    if (!questionId || typeof answer !== "string") {
      return NextResponse.json(
        { error: "questionId and answer are required" },
        { status: 400 }
      );
    }

    // Verify the question belongs to a lesson in instructor's course
    const question = await db.qAQuestion.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: { select: { instructorId: true } },
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (
      decoded.role !== "ADMIN" &&
      question.lesson.module.course.instructorId !== decoded.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.qAQuestion.update({
      where: { id: questionId },
      data: { answer: answer.trim() || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[INSTRUCTOR_QA_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
