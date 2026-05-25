import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { newInstructorId } = body;

    if (!newInstructorId) {
      return NextResponse.json({ error: "New instructor ID is required" }, { status: 400 });
    }

    // Verify the new instructor exists and has the correct role
    const newInstructor = await db.user.findUnique({ where: { id: newInstructorId } });
    
    if (!newInstructor || (newInstructor.role !== "INSTRUCTOR" && newInstructor.role !== "ADMIN")) {
      return NextResponse.json({ error: "Invalid instructor selected" }, { status: 400 });
    }

    const updatedTrack = await db.track.update({
      where: { id },
      data: { instructorId: newInstructorId },
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, phases: true } }
      }
    });

    return NextResponse.json({ ok: true, track: updatedTrack });
  } catch (error) {
    console.error("Failed to reassign track", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
