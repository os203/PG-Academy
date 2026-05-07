import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Module title is required" },
        { status: 400 }
      );
    }

    const authResult = await getAuthorizedCourse(courseId);
    if (!authResult.ok) {
      return authResult.response;
    }

    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const createdModule = await db.module.create({
      data: {
        title,
        courseId,
        order: newOrder,
      },
    });

    return NextResponse.json(createdModule, { status: 201 });
  } catch (error) {
    console.error("[MODULE_CREATE_ERROR]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}