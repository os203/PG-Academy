import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";
import { sendCertificateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type RouteParams = {
  courseId: string;
};

// Helper to generate a unique 8-character uppercase code
function generateUniqueCode(): string {
  return "PG-CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded?.userId) return new NextResponse("Unauthorized", { status: 401 });

    const certificate = await db.certificate.findFirst({
      where: {
        userId: decoded.userId,
        courseId,
      },
    });

    if (!certificate) {
      return new NextResponse(JSON.stringify({ exists: false }), { status: 200 });
    }

    return new NextResponse(JSON.stringify({ exists: true, certificate }), { status: 200 });
  } catch (error) {
    console.error("[CERTIFICATE_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded?.userId) return new NextResponse("Unauthorized", { status: 401 });
    
    const userId = decoded.userId;

    // 1. Verify enrollment
    const enrollment = await db.enrollment.findFirst({
      where: { userId, courseId },
    });
    
    if (!enrollment) {
      return new NextResponse("Not enrolled in this course", { status: 403 });
    }

    // 2. Check if certificate already exists
    const existingCert = await db.certificate.findFirst({
      where: { userId, courseId },
    });
    
    if (existingCert) {
      return new NextResponse(JSON.stringify(existingCert), { status: 200 });
    }

    // 3. Fetch course structure to evaluate completion
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: true,
              }
            }
          }
        }
      }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Collect all lesson IDs and quiz IDs
    const lessonIds: string[] = [];
    const quizIds: string[] = [];
    
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        lessonIds.push(lesson.id);
        for (const quiz of lesson.quizzes) {
          quizIds.push(quiz.id);
        }
      }
    }

    // Check lesson progress
    const progresses = await db.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds }
      }
    });

    // Check quiz attempts
    const passedAttempts = await db.quizAttempt.findMany({
      where: {
        userId,
        quizId: { in: quizIds },
        passed: true
      }
    });

    // Evaluate
    // Rule: All lessons must have a progress record with watchedPercent >= 90
    // Rule: All quizzes must have at least one passed attempt
    
    const passedQuizIds = new Set(passedAttempts.map(a => a.quizId));
    let isComplete = true;

    for (const lid of lessonIds) {
      const p = progresses.find(prog => prog.lessonId === lid);
      if (!p || p.watchedPercent < 90) {
        isComplete = false;
        break;
      }
    }

    if (isComplete) {
      for (const qid of quizIds) {
        if (!passedQuizIds.has(qid)) {
          isComplete = false;
          break;
        }
      }
    }

    if (!isComplete) {
      return new NextResponse("Course not fully completed yet", { status: 400 });
    }

    // 4. Generate Certificate
    let uniqueCode = generateUniqueCode();
    let isUnique = false;
    
    while (!isUnique) {
      const collision = await db.certificate.findUnique({ where: { uniqueCode } });
      if (!collision) isUnique = true;
      else uniqueCode = generateUniqueCode();
    }

    const newCertificate = await db.certificate.create({
      data: {
        userId,
        courseId,
        uniqueCode,
      }
    });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      try {
        await sendCertificateEmail(user.email, user.name, course.title, uniqueCode);
      } catch (err) {
        console.error("[CERTIFICATE_EMAIL_ERROR]", err);
      }
    }

    return new NextResponse(JSON.stringify(newCertificate), { status: 201 });
  } catch (error) {
    console.error("[CERTIFICATE_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
