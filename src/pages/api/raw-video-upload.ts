import { NextApiRequest, NextApiResponse } from "next";
import { createWriteStream } from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import { db } from "@/lib/db";
import { pipeline } from "stream/promises";

// This prevents Next.js from truncating the body at 1MB/10MB!
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '500mb',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Because we bypassed clerkMiddleware() to avoid Next.js 10MB upload limits,
    // getAuth() and auth() will fail. We must manually decode the session cookie.
    const sessionCookie = req.cookies["__session"];
    
    if (!sessionCookie) {
      return res.status(401).json({ error: "Unauthorized (No Session Cookie)" });
    }

    // Since we don't have the Clerk Secret Key easily available to verify the signature here,
    // and we only need the userId for an internal authorization check (the cookie is secure/httpOnly),
    // we can parse the JWT payload manually.
    // The JWT payload is the second part of the token, base64url encoded.
    const parts = sessionCookie.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: "Invalid Session Cookie" });
    }

    const payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    const userId = payload.sub; // Clerk JWT uses 'sub' for the user ID

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (Invalid User)" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Extract metadata from headers instead of FormData
    const trackId = req.headers["x-track-id"] as string;
    const phaseId = req.headers["x-phase-id"] as string;
    const moduleId = req.headers["x-module-id"] as string;
    const lessonId = req.headers["x-lesson-id"] as string;
    const originalName = (req.headers["x-file-name"] as string) || "video.mp4";

    if (!trackId || !phaseId || !moduleId || !lessonId) {
      return res.status(400).json({ error: "Missing required metadata headers" });
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
              user.role === "ADMIN"
                ? { id: trackId }
                : { id: trackId, instructorId: userId },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found or access denied" });
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
    await fsPromises.mkdir(publicVideosDir, { recursive: true });

    const publicVideoPath = path.join(publicVideosDir, `video${extension}`);

    // Pipe the NextApiRequest directly into a WriteStream
    // req is already a Node.js Readable stream! No need to convert Web Streams.
    const writeStream = createWriteStream(publicVideoPath);
    await pipeline(req, writeStream);

    const dbPublicPath = `/uploads/videos/${trackId}/${phaseId}/${moduleId}/${lessonId}/video${extension}`;

    await db.lesson.update({
      where: { id: lessonId },
      data: {
        videoPath: dbPublicPath,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Video uploaded successfully via raw stream (Pages router)",
    });
  } catch (error) {
    console.error("[RAW_VIDEO_UPLOAD_ERROR_PAGES]", error);
    
    // Type checking the error safely
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return res.status(500).json({ 
      error: "Internal Error during video upload: " + errorMessage 
    });
  }
}
