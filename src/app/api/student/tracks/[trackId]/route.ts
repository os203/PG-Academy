import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId: trackId,
        status: "APPROVED" // Must be approved to view content
      },
      include: {
        track: {
          include: {
            phases: {
              orderBy: { order: "asc" },
              include: {
                modules: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: {
                        progress: {
                          where: { userId: currentUser.id },
                        },
                        resources: {
                          select: { id: true, name: true, url: true },
                        },
                        quizzes: {
                          include: {
                            attempts: {
                              where: { userId: currentUser.id },
                              orderBy: { createdAt: "desc" },
                              take: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Track not found or enrollment not approved" },
        { status: 404 }
      );
    }

    if (enrollment.track.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Track is not available" },
        { status: 403 }
      );
    }

    const track = enrollment.track;
    const allLessons = track.phases.flatMap(p => p.modules.flatMap(m => m.lessons));

    let completedLessonsCount = 0;

    const phases = track.phases.map(phase => ({
      id: phase.id,
      title: phase.title,
      order: phase.order,
      modules: phase.modules.map(module => ({
        id: module.id,
        title: module.title,
        order: module.order,
        lessons: module.lessons.map(lesson => {
          const progressRecord = lesson.progress[0];
          const quiz = lesson.quizzes[0];
          const latestAttempt = quiz?.attempts[0];
          const isCompleted = progressRecord?.isCompleted ?? false;

          if (isCompleted) {
             completedLessonsCount++;
          }

          return {
            id: lesson.id,
            title: lesson.title,
            notes: lesson.notes,
            videoPath: lesson.videoPath,
            order: lesson.order,
            watchedPercent: progressRecord?.watchedPercent ?? 0,
            lastPosition: progressRecord?.lastPosition ?? 0,
            isCompleted,
            isUnlocked: true, // we will compute real lock status in UI or here later
            quizId: quiz?.id ?? null,
            hasQuiz: lesson.quizzes.length > 0,
            quizPassed: latestAttempt ? latestAttempt.passed : false,
            attemptCount: quiz?.attempts.length ?? 0,
            latestScore: latestAttempt?.score ?? null,
            resources: lesson.resources || [],
          };
        }),
      })),
    }));

    const overallProgress = allLessons.length > 0
      ? Math.round((completedLessonsCount / allLessons.length) * 100)
      : 0;

    // Compute sequential locks logic
    let isUnlocked = true;
    for (const phase of phases) {
      for (const mod of phase.modules) {
        for (const lesson of mod.lessons) {
          lesson.isUnlocked = isUnlocked;
          if (!lesson.isCompleted) {
             isUnlocked = false; // Next lessons are locked
          }
        }
      }
    }

    const response = {
      id: track.id,
      title: track.title,
      description: track.description,
      overallProgress,
      phases,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[STUDENT_TRACK_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}