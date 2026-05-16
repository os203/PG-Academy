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

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const moduleRecord = await db.module.update({
      where: {
        id: moduleId,
        phaseId: phaseId,
      },
      data: {
        title,
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
