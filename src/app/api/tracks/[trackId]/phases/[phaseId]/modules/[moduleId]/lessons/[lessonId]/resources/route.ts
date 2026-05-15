import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ trackId: string; phaseId: string; moduleId: string; lessonId: string }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId } = await params;

    // Check authorization
    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    // Verify module and lesson belong to track
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        moduleId: moduleId,
        module: {
          phaseId: phaseId,
          phase: {
            trackId: trackId,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        url,
        lessonId,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("[RESOURCE_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
