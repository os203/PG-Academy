import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string; phaseId: string; moduleId: string }> }
) {
  try {
    const { trackId, phaseId, moduleId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await req.json();
    const { title, isPublished } = body;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    if (title === undefined && isPublished === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const moduleRecord = await db.module.update({
      where: {
        id: moduleId,
        phaseId: phaseId,
      },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json(moduleRecord);
  } catch (error) {
    console.error("[MODULE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ trackId: string; phaseId: string; moduleId: string }> }
) {
  try {
    const { trackId, phaseId, moduleId } = await params;

    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    await db.module.delete({
      where: {
        id: moduleId,
        phaseId: phaseId,
      },
    });

    return NextResponse.json({ message: "Module deleted" });
  } catch (error) {
    console.error("[MODULE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
