import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const lastPhase = await db.phase.findFirst({
      where: { trackId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastPhase ? lastPhase.order + 1 : 1;

    const phase = await db.phase.create({
      data: {
        title,
        order: newOrder,
        trackId,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error("[PHASE_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
