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

    // Block direct enrollment for paid tracks
    if (track.price > 0) {
      return NextResponse.json(
        { error: "This track requires payment. Please use the checkout process." },
        { status: 402 }
      );
    }

    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: currentUser.id,
        trackId,
      },
      select: {
        id: true,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        message: "You are already enrolled in this track",
        alreadyEnrolled: true,
      });
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: currentUser.id,
        trackId,
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
