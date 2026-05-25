import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/student/qa?lessonId=xxx — get Q&A for a specific lesson
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken();
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    // Verify user is enrolled in the track that has this lesson
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        module: {
          select: {
            phase: {
              select: {
                track: {
                  select: {
                    id: true,
                    enrollments: {
                      where: { userId: decoded.userId },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Allow enrolled students, instructors, and admins
    const isEnrolled = lesson.module.phase.track.enrollments.length > 0;
    const isPrivileged =
      decoded.role === "ADMIN" || decoded.role === "INSTRUCTOR";

    if (!isEnrolled && !isPrivileged) {
      return NextResponse.json(
        { error: "You are not enrolled in this track" },
        { status: 403 }
      );
    }

    const questions = await db.qAQuestion.findMany({
      where: { lessonId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    const mapped = questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      userName: q.user.name,
      isOwn: q.user.id === decoded.userId,
    }));

    return NextResponse.json({ questions: mapped });
  } catch (error) {
    console.error("[STUDENT_QA_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST /api/student/qa — submit a new question
export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken();
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { lessonId, question } = body;

    if (!lessonId || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "lessonId and question are required" },
        { status: 400 }
      );
    }

    // Verify user is enrolled in the track containing this lesson
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        module: {
          select: {
            phase: {
              select: {
                track: {
                  select: {
                    id: true,
                    enrollments: {
                      where: { userId: decoded.userId },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const isEnrolled = lesson.module.phase.track.enrollments.length > 0;
    const isPrivileged =
      decoded.role === "ADMIN" || decoded.role === "INSTRUCTOR";

    if (!isEnrolled && !isPrivileged) {
      return NextResponse.json(
        { error: "You must be enrolled to ask a question" },
        { status: 403 }
      );
    }

    const created = await db.qAQuestion.create({
      data: {
        userId: decoded.userId,
        lessonId,
        question: question.trim(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[STUDENT_QA_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
