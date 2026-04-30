import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseOwner = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: decoded.userId,
      },
    });

    if (!courseOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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