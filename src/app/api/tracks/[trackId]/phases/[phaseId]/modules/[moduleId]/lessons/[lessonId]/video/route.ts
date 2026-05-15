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
];

function normalizePathForDb(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function getFileExtension(fileName: string): string {
  const ext = path.extname(fileName || "").toLowerCase();

  if (ext) {
    return ext;
  }

  return ".mp4";
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

  const maxMb = Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_UPLOAD_MB;

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await verifyToken(token);

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

  const track = await db.track.findFirst({
    where:
      decoded.role === "ADMIN"
        ? {
            id: trackId,
          }
        : {
            id: trackId,
            instructorId: decoded.userId,
          },
    include: {
      phases: {
        where: { id: phaseId },
        include: {
          modules: {
            where: {
              id: moduleId,
            },
            include: {
              lessons: {
                where: {
                  id: lessonId,
                },
              },
            },
          },
        },
      },
    },
  });

  const lesson = track?.phases[0]?.modules[0]?.lessons[0];

  if (!track || !lesson) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Lesson not found or access denied" },
        { status: 404 }
      ),
    };
  }

  return {
    ok: true as const,
    userId: decoded.userId,
    role: decoded.role,
    track,
    lesson,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { trackId, phaseId, moduleId, lessonId } = await params;

  try {
    const authResult = await getAuthorizedLesson(trackId, phaseId, moduleId, lessonId);

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
    const hlsRoot =
      process.env.VIDEO_HLS_DIR || path.join(storageRoot, "hls");

    const extension = getFileExtension(uploadedFile.name);

    const originalDir = path.join(originalsRoot, phaseId, moduleId, lessonId);
    const hlsOutputDir = path.join(hlsRoot, phaseId, moduleId, lessonId);

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
        where: {
          id: videoAsset.id,
        },
        data: {
          hlsManifestPath: normalizePathForDb(hlsManifestPath),
          duration,
          status: "READY",
          errorMessage: null,
        },
      });

      await db.lesson.update({
        where: {
          id: lessonId,
        },
        data: {
          videoPath: normalizePathForDb(hlsManifestPath),
          duration,
        },
      });

      return NextResponse.json(
        {
          message: "Video uploaded and converted successfully",
          videoAsset: updatedVideoAsset,
        },
        { status: 201 }
      );
    } catch (conversionError) {
      const errorMessage =
        conversionError instanceof Error
          ? conversionError.message
          : "Video conversion failed";

      const failedVideoAsset = await db.videoAsset.update({
        where: {
          id: videoAsset.id,
        },
        data: {
          status: "FAILED",
          errorMessage,
        },
      });

      return NextResponse.json(
        {
          error: "Video uploaded but conversion failed",
          videoAsset: failedVideoAsset,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[LESSON_VIDEO_UPLOAD_ERROR]", error);

    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}