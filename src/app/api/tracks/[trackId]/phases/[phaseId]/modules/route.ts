import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function POST(
  req: Request,
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

    const lastModule = await db.module.findFirst({
      where: { phaseId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const moduleRecord = await db.module.create({
      data: {
        title,
        order: newOrder,
        phaseId,
      },
    });

    return NextResponse.json(moduleRecord);
  } catch (error) {
    console.error("[MODULE_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
