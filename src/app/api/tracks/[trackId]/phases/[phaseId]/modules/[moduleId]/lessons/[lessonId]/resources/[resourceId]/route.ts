import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getAuthorizedCourse } from "@/lib/auth";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      trackId: string;
      phaseId: string;
      moduleId: string;
      lessonId: string;
      resourceId: string;
    }>;
  }
) {
  try {
    const { trackId, phaseId, moduleId, lessonId, resourceId } = await params;

    // Check authorization
    const authResult = await getAuthorizedCourse(trackId);
    if (!authResult.ok) {
      return authResult.response;
    }

    // Verify resource exists and belongs to the lesson
    const existingResource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
        lessonId: lessonId,
        lesson: {
          moduleId: moduleId,
          module: {
            phaseId: phaseId,
            phase: {
              trackId: trackId,
            },
          },
        },
      },
    });

    if (!existingResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    await prisma.resource.delete({
      where: {
        id: resourceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESOURCE_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
