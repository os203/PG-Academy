import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can enroll in tracks" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const trackId =
      typeof body.trackId === "string" ? body.trackId.trim() : "";

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const track = await db.track.findFirst({
      where: {
        id: trackId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        status: true,
        price: true,
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found or not published" },
        { status: 404 }
      );
    }

    // Paid track must go through Stripe checkout
    if (track.price > 0) {
      return NextResponse.json(
        {
          error:
            "This track requires payment. Please use the checkout process.",
        },
        { status: 402 }
      );
    }

    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId,
      },
    });

    // If enrollment already exists
    if (existingEnrollment) {
      // If free track and enrollment is still pending/rejected, approve it
      if (existingEnrollment.status !== "APPROVED") {
        const updatedEnrollment = await db.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            status: "APPROVED",
          },
        });

        return NextResponse.json({
          message: "Enrollment approved successfully",
          enrollment: updatedEnrollment,
          alreadyEnrolled: true,
        });
      }

      return NextResponse.json({
        message: "You are already enrolled in this track",
        enrollment: existingEnrollment,
        alreadyEnrolled: true,
      });
    }

    // Free track enrollment should be approved immediately
    const enrollment = await db.enrollment.create({
      data: {
        userId: currentUser.id,
        trackId,
        status: "APPROVED",
      },
    });

    return NextResponse.json(
      {
        message: "Enrolled successfully",
        enrollment,
        alreadyEnrolled: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[STUDENT_ENROLL_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}