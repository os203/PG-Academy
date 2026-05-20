import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const LESSON_COMPLETE_THRESHOLD = 80;

interface PhaseSummary {
  id: string;
  title: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isLocked: boolean;
}

interface CourseSummaryResponse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  hoursLearned: number;
  instructorName: string;
  phases: PhaseSummary[];
}

export async function GET() {
  try {
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

    const certificateCount = await db.certificate.count({
      where: { userId: currentUser.id },
    });

    const progressRecords = await db.progress.findMany({
      where: { userId: currentUser.id },
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const progressDates = new Set(
      progressRecords.map((record) =>
        record.updatedAt.toISOString().slice(0, 10),
      ),
    );

    const getUTCDateString = (date: Date) => date.toISOString().slice(0, 10);

    let streakDays = 0;
    let currentDay = new Date();
    currentDay = new Date(
      Date.UTC(
        currentDay.getUTCFullYear(),
        currentDay.getUTCMonth(),
        currentDay.getUTCDate(),
      ),
    );

    while (progressDates.has(getUTCDateString(currentDay))) {
      streakDays++;
      currentDay = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
    }

    const enrollments = await db.enrollment.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        track: {
          include: {
            instructor: { select: { name: true } },
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
                          select: {
                            watchedPercent: true,
                          },
                        },
                        quizzes: {
                          include: {
                            attempts: {
                              where: { userId: currentUser.id },
                              orderBy: { createdAt: "desc" },
                              select: {
                                passed: true,
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
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const tracks: CourseSummaryResponse[] = enrollments
      .filter((enrollment) => enrollment.track.status === "PUBLISHED")
      .map((enrollment) => {
        let previousPhaseCompleted = true; // First phase is always unlocked
        const phases: PhaseSummary[] = [];

        const allLessons = enrollment.track.phases.flatMap((phase) => {
          const phaseLessons = phase.modules.flatMap(
            (module) => module.lessons,
          );

          let phaseCompletedLessons = 0;
          const phaseTotalLessons = phaseLessons.length;

          for (const lesson of phaseLessons) {
            const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
            const quiz = lesson.quizzes[0];
            const quizPassed = quiz
              ? quiz.attempts.some((a) => a.passed)
              : true;
            if (watchedPercent >= LESSON_COMPLETE_THRESHOLD && quizPassed) {
              phaseCompletedLessons++;
            }
          }

          const phaseProgressPercentage =
            phaseTotalLessons > 0
              ? Math.round((phaseCompletedLessons / phaseTotalLessons) * 100)
              : 0;

          const isLocked = !previousPhaseCompleted;

          phases.push({
            id: phase.id,
            title: phase.title,
            order: phase.order,
            totalLessons: phaseTotalLessons,
            completedLessons: phaseCompletedLessons,
            progressPercentage: phaseProgressPercentage,
            isLocked,
          });

          // Update for next phase
          if (
            phaseTotalLessons > 0 &&
            phaseCompletedLessons < phaseTotalLessons
          ) {
            previousPhaseCompleted = false;
          }

          return phaseLessons;
        });

        const totalLessons = allLessons.length;

        const completedLessons = allLessons.filter((lesson) => {
          const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
          const quiz = lesson.quizzes[0];
          const quizPassed = quiz ? quiz.attempts.some((a) => a.passed) : true;

          return watchedPercent >= LESSON_COMPLETE_THRESHOLD && quizPassed;
        }).length;

        const totalLearnedSeconds = allLessons.reduce((sum, lesson) => {
          const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
          const duration = lesson.duration ?? 0;
          return sum + (duration * Math.min(watchedPercent, 100)) / 100;
        }, 0);

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          id: enrollment.track.id,
          title: enrollment.track.title,
          description: enrollment.track.description,
          thumbnail: enrollment.track.thumbnail ?? null,
          price: enrollment.track.price,
          status: enrollment.track.status,
          totalLessons,
          completedLessons,
          progressPercentage,
          hoursLearned: Math.floor(totalLearnedSeconds / 3600),
          instructorName: enrollment.track.instructor.name,
          phases,
        };
      });

    let continueLearning = null;

    // Find the most recently enrolled track that has incomplete lessons
    for (const enrollment of enrollments) {
      if (enrollment.track.status !== "PUBLISHED") continue;

      let foundIncomplete = false;

      for (const phase of enrollment.track.phases) {
        if (foundIncomplete) break;
        for (const mod of phase.modules) {
          if (foundIncomplete) break;
          for (const lesson of mod.lessons) {
            const watchedPercent = lesson.progress[0]?.watchedPercent ?? 0;
            const quiz = lesson.quizzes[0];
            const quizPassed = quiz
              ? quiz.attempts.some((a) => a.passed)
              : true;
            const isCompleted =
              watchedPercent >= LESSON_COMPLETE_THRESHOLD && quizPassed;

            if (!isCompleted) {
              continueLearning = {
                trackId: enrollment.track.id,
                trackTitle: enrollment.track.title,
                phaseTitle: phase.title,
                moduleTitle: mod.title,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
              };
              foundIncomplete = true;
              break;
            }
          }
        }
      }

      if (continueLearning) break;
    }

    return NextResponse.json({
      tracks,
      continueLearning,
      certificateCount,
      streakDays,
    });
  } catch (error) {
    console.error("[STUDENT_COURSES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
