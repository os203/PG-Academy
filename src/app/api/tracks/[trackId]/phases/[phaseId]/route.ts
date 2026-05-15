import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string; phaseId: string }> }
) {
  try {
    const { trackId, phaseId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const phase = await db.phase.update({
      where: {
        id: phaseId,
        trackId: trackId,
      },
      data: {
        title,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error("[PHASE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ trackId: string; phaseId: string }> }
) {
  try {
    const { trackId, phaseId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    await db.phase.delete({
      where: {
        id: phaseId,
        trackId: trackId,
      },
    });

    return NextResponse.json({ message: "Phase deleted" });
  } catch (error) {
    console.error("[PHASE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
