"use server";

import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function uploadLessonVideoAction(formData: FormData) {
  try {
    const decoded = await verifyToken();

    if (!decoded?.userId || !decoded?.role) {
      return { ok: false, error: "Unauthorized" };
    }

    if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
      return { ok: false, error: "Forbidden" };
    }

    const trackId = formData.get("trackId") as string;
    const phaseId = formData.get("phaseId") as string;
    const moduleId = formData.get("moduleId") as string;
    const lessonId = formData.get("lessonId") as string;

    if (!trackId || !phaseId || !moduleId || !lessonId) {
      return { ok: false, error: "Missing required parameters" };
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
      return { ok: false, error: "Lesson not found or access denied" };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "Video file is required" };
    }

    const extension = path.extname(file.name).toLowerCase() || ".mp4";
    
    // We skip HLS conversion here completely because this is a local development environment workaround
    // and the user does not have ffmpeg installed.
    const publicVideosDir = path.join(process.cwd(), "public", "uploads", "videos", trackId, phaseId, moduleId, lessonId);
    await fs.mkdir(publicVideosDir, { recursive: true });
    
    const publicVideoPath = path.join(publicVideosDir, `video${extension}`);
    
    // Write the file buffer to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(publicVideoPath, buffer);
    
    const dbPublicPath = `/uploads/videos/${trackId}/${phaseId}/${moduleId}/${lessonId}/video${extension}`;

    await db.lesson.update({
      where: { id: lessonId },
      data: {
        videoPath: dbPublicPath,
      },
    });

    return { ok: true, message: "Video uploaded successfully" };
  } catch (error) {
    console.error("[SERVER_ACTION_VIDEO_UPLOAD_ERROR]", error);
    return { ok: false, error: "Internal Error during video upload" };
  }
}
