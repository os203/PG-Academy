import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  lessonId: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { lessonId } = await params;

    const decoded = await verifyToken();
    if (!decoded?.userId || !decoded?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
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
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson || !lesson.videoPath) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const track = lesson.module.phase.track;
    const isAdmin = decoded.role === "ADMIN";
    const isInstructor =
      decoded.role === "INSTRUCTOR" && track.instructorId === decoded.userId;
    const isApprovedStudent =
      decoded.role === "STUDENT" && track.enrollments.length > 0;

    if (!isAdmin && !isInstructor && !isApprovedStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Resolve the video file path
    let videoFilePath: string;
    if (lesson.videoPath.startsWith("/uploads/")) {
      // Public uploads fallback path
      videoFilePath = path.join(process.cwd(), "public", lesson.videoPath);
    } else {
      // Direct path (e.g., from private storage)
      videoFilePath = path.resolve(lesson.videoPath);
    }

    if (!fs.existsSync(videoFilePath)) {
      return NextResponse.json({ error: "Video file not found on disk" }, { status: 404 });
    }

    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    // Determine content type
    const ext = path.extname(videoFilePath).toLowerCase();
    const contentType =
      ext === ".webm"
        ? "video/webm"
        : ext === ".mov"
        ? "video/quicktime"
        : "video/mp4";

    if (range) {
      // Parse Range header: "bytes=start-end"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(videoFilePath, { start, end });

      const readableStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk) =>
            controller.enqueue(new Uint8Array(chunk as Buffer))
          );
          stream.on("end", () => controller.close());
          stream.on("error", (err: Error) => controller.error(err));
        },
        cancel() {
          stream.destroy();
        },
      });

      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "private, no-store",
        },
      });
    }

    // No range header → serve full file
    const stream = fs.createReadStream(videoFilePath);

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) =>
          controller.enqueue(new Uint8Array(chunk as Buffer))
        );
        stream.on("end", () => controller.close());
        stream.on("error", (err: Error) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[RAW_VIDEO_STREAM_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
