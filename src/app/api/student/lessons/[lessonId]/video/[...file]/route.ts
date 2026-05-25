import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  lessonId: string;
  file: string[];
};

function getContentType(fileName: string): string {
  if (fileName.endsWith(".m3u8")) {
    return "application/vnd.apple.mpegurl";
  }

  if (fileName.endsWith(".ts")) {
    return "video/mp2t";
  }

  if (fileName.endsWith(".mp4")) {
    return "video/mp4";
  }

  return "application/octet-stream";
}

function normalizeStoredPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { lessonId, file } = await params;

    const requestedFile = file.join("/");

    if (!requestedFile || requestedFile.includes("..")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const decoded = await verifyToken();

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoAsset = await db.videoAsset.findUnique({
      where: {
        lessonId,
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                phase: {
                  include: {
                    track: {
                      include: {
                        enrollments: {
                          where: {
                            userId: decoded.userId,
                            status: "APPROVED",
                          },
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!videoAsset || videoAsset.status !== "READY" || !videoAsset.hlsManifestPath) {
      return NextResponse.json(
        { error: "Video not found or not ready" },
        { status: 404 }
      );
    }

    const track = videoAsset.lesson.module.phase.track;

    const isAdmin = decoded.role === "ADMIN";
    const isInstructor =
      decoded.role === "INSTRUCTOR" && track.instructorId === decoded.userId;
    const isApprovedStudent =
      decoded.role === "STUDENT" && track.enrollments.length > 0;

    if (!isAdmin && !isInstructor && !isApprovedStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const manifestPath = normalizeStoredPath(videoAsset.hlsManifestPath);
    const hlsDirectory = path.resolve(path.dirname(manifestPath));
    const targetPath = path.resolve(hlsDirectory, requestedFile);

    if (!targetPath.startsWith(hlsDirectory)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(targetPath);
    const contentType = getContentType(requestedFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[SECURE_LESSON_VIDEO_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}