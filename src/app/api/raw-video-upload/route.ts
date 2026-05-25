import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { pipeline } from "stream/promises";



export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken();

    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract metadata from headers instead of FormData
    const trackId = req.headers.get("x-track-id");
    const phaseId = req.headers.get("x-phase-id");
    const moduleId = req.headers.get("x-module-id");
    const lessonId = req.headers.get("x-lesson-id");
    const originalName = req.headers.get("x-file-name") || "video.mp4";

    if (!trackId || !phaseId || !moduleId || !lessonId) {
      return NextResponse.json(
        { error: "Missing required metadata headers" },
        { status: 400 }
      );
    }

    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          id: moduleId,
          phaseId,
          phase: {
            id: phaseId,
            trackId,
            track:
              decoded.role === "ADMIN"
                ? { id: trackId }
                : { id: trackId, instructorId: decoded.userId },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or access denied" },
        { status: 404 }
      );
    }

    const extension = path.extname(originalName).toLowerCase() || ".mp4";
    const publicVideosDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "videos",
      trackId,
      phaseId,
      moduleId,
      lessonId
    );
    await fs.mkdir(publicVideosDir, { recursive: true });

    const publicVideoPath = path.join(publicVideosDir, `video${extension}`);

    // Since req.body is a ReadableStream (web streams), we can convert it to an array buffer
    // This perfectly handles raw binary data without any FormData parsing bugs!
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(publicVideoPath, buffer);

    const dbPublicPath = `/uploads/videos/${trackId}/${phaseId}/${moduleId}/${lessonId}/video${extension}`;

    await db.lesson.update({
      where: { id: lessonId },
      data: {
        videoPath: dbPublicPath,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Video uploaded successfully via raw stream",
    });
  } catch (error) {
    console.error("[RAW_VIDEO_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Error during video upload" },
      { status: 500 }
    );
  }
}
