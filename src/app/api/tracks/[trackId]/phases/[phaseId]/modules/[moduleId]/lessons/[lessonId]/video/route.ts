import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

type RouteParams = {
  trackId: string;
  phaseId: string;
  moduleId: string;
  lessonId: string;
};

const DEFAULT_MAX_UPLOAD_MB = 500;

const DEFAULT_ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
];

function normalizePathForDb(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function getFileExtension(fileName: string): string {
  const ext = path.extname(fileName || "").toLowerCase();
  return ext || ".mp4";
}

function getAllowedTypes(): string[] {
  const raw = process.env.VIDEO_ALLOWED_TYPES;

  if (!raw) {
    return DEFAULT_ALLOWED_TYPES;
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMaxUploadBytes(): number {
  const value = Number(process.env.VIDEO_MAX_UPLOAD_MB || DEFAULT_MAX_UPLOAD_MB);
  const maxMb =
    Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_UPLOAD_MB;

  return maxMb * 1024 * 1024;
}

async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function removeDirectoryIfExists(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

async function getVideoDurationSeconds(filePath: string): Promise<number | null> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    const duration = Number(stdout.trim());

    if (!Number.isFinite(duration)) {
      return null;
    }

    return Math.round(duration);
  } catch {
    return null;
  }
}

async function convertVideoToHls({
  inputPath,
  outputDir,
}: {
  inputPath: string;
  outputDir: string;
}): Promise<string> {
  await ensureDirectory(outputDir);

  const manifestPath = path.join(outputDir, "index.m3u8");
  const segmentPattern = path.join(outputDir, "segment_%03d.ts");

  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-codec:v",
    "libx264",
    "-codec:a",
    "aac",
    "-hls_time",
    "10",
    "-hls_playlist_type",
    "vod",
    "-hls_segment_filename",
    segmentPattern,
    manifestPath,
  ]);

  return manifestPath;
}

async function getAuthorizedLesson(
  trackId: string,
  phaseId: string,
  moduleId: string,
  lessonId: string
) {
  const decoded = await verifyToken();

  if (!decoded?.userId || !decoded?.role) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (decoded.role !== "ADMIN" && decoded.role !== "INSTRUCTOR") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
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
              ? {
                  id: trackId,
                }
              : {
                  id: trackId,
                  instructorId: decoded.userId,
                },
        },
      },
    },
    include: {
      module: {
        include: {
          phase: {
            include: {
              track: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Lesson not found or access denied",
          debug: {
            trackId,
            phaseId,
            moduleId,
            lessonId,
            userId: decoded.userId,
            role: decoded.role,
          },
        },
        { status: 404 }
      ),
    };
  }

  return {
    ok: true as const,
    userId: decoded.userId,
    role: decoded.role,
    track: lesson.module.phase.track,
    lesson,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { trackId, phaseId, moduleId, lessonId } = await params;

  try {
    const authResult = await getAuthorizedLesson(
      trackId,
      phaseId,
      moduleId,
      lessonId
    );

    if (!authResult.ok) {
      return authResult.response;
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400 }
      );
    }

    const allowedTypes = getAllowedTypes();

    if (!allowedTypes.includes(uploadedFile.type)) {
      return NextResponse.json(
        {
          error: "Unsupported video type",
          allowedTypes,
        },
        { status: 400 }
      );
    }

    const maxUploadBytes = getMaxUploadBytes();

    if (uploadedFile.size > maxUploadBytes) {
      return NextResponse.json(
        {
          error: `Video file is too large. Maximum allowed size is ${
            maxUploadBytes / 1024 / 1024
          }MB`,
        },
        { status: 400 }
      );
    }

    const storageRoot = process.env.VIDEO_STORAGE_ROOT || "./private/videos";

    const originalsRoot =
      process.env.VIDEO_ORIGINALS_DIR || path.join(storageRoot, "originals");

    const hlsRoot = process.env.VIDEO_HLS_DIR || path.join(storageRoot, "hls");

    const extension = getFileExtension(uploadedFile.name);

    const originalDir = path.join(
      originalsRoot,
      trackId,
      phaseId,
      moduleId,
      lessonId
    );

    const hlsOutputDir = path.join(
      hlsRoot,
      trackId,
      phaseId,
      moduleId,
      lessonId
    );

    await ensureDirectory(originalDir);
    await removeDirectoryIfExists(hlsOutputDir);
    await ensureDirectory(hlsOutputDir);

    const originalFilePath = path.join(originalDir, `original${extension}`);

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(originalFilePath, buffer);

    const videoAsset = await db.videoAsset.upsert({
      where: {
        lessonId,
      },
      create: {
        lessonId,
        originalPath: normalizePathForDb(originalFilePath),
        status: "PROCESSING",
      },
      update: {
        originalPath: normalizePathForDb(originalFilePath),
        hlsManifestPath: null,
        duration: null,
        status: "PROCESSING",
        errorMessage: null,
      },
    });

    try {
      const hlsManifestPath = await convertVideoToHls({
        inputPath: originalFilePath,
        outputDir: hlsOutputDir,
      });

      const duration = await getVideoDurationSeconds(originalFilePath);

      const updatedVideoAsset = await db.videoAsset.update({
        where: { id: videoAsset.id },
        data: {
          hlsManifestPath: normalizePathForDb(hlsManifestPath),
          duration,
          status: "READY",
          errorMessage: null,
        },
      });

      await db.lesson.update({
        where: { id: lessonId },
        data: {
          videoPath: normalizePathForDb(hlsManifestPath),
          duration,
        },
      });

      return NextResponse.json({ message: "Video uploaded and converted to HLS successfully", videoAsset: updatedVideoAsset }, { status: 201 });
    } catch (conversionError) {
      console.warn("[FFMPEG_MISSING_FALLBACK]", conversionError);
      
      // Fallback: If ffmpeg is missing (e.g., local development), serve the raw MP4 directly from public directory
      const publicVideosDir = path.join(process.cwd(), "public", "uploads", "videos", trackId, phaseId, moduleId, lessonId);
      await ensureDirectory(publicVideosDir);
      
      const publicVideoPath = path.join(publicVideosDir, `video${extension}`);
      await fs.copyFile(originalFilePath, publicVideoPath);
      
      const dbPublicPath = `/uploads/videos/${trackId}/${phaseId}/${moduleId}/${lessonId}/video${extension}`;

      const updatedVideoAsset = await db.videoAsset.update({
        where: { id: videoAsset.id },
        data: {
          status: "READY",
          errorMessage: "HLS skipped, using raw MP4 fallback",
        },
      });

      await db.lesson.update({
        where: { id: lessonId },
        data: {
          videoPath: dbPublicPath,
        },
      });

      return NextResponse.json({ message: "Video uploaded using raw MP4 fallback", videoAsset: updatedVideoAsset }, { status: 201 });
    }
  } catch (error) {
    console.error("[LESSON_VIDEO_UPLOAD_ERROR]", error);

    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}