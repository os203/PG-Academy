import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storage } from "@/lib/storage";
import { verifyToken } from "@/lib/auth";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

async function authorizeUploader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await verifyToken(token);

  if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    user,
  };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeUploader();
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(fileEntry.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed: jpg, jpeg, png, webp",
        },
        { status: 400 }
      );
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Image size must be <= ${MAX_FILE_SIZE_MB}MB`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await storage.upload({
      buffer,
      filename: fileEntry.name,
      contentType: fileEntry.type,
      folder: "course-thumbnails",
    });

    return NextResponse.json(
      {
        message: "Thumbnail uploaded successfully",
        file: uploaded,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[COURSE_THUMBNAIL_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authorizeUploader();
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => null);
    const storageKey =
      typeof body?.storageKey === "string" ? body.storageKey.trim() : "";

    if (!storageKey) {
      return NextResponse.json(
        { error: "storageKey is required" },
        { status: 400 }
      );
    }

    await storage.delete({ storageKey });

    return NextResponse.json({
      message: "Thumbnail deleted successfully",
    });
  } catch (error) {
    console.error("[COURSE_THUMBNAIL_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}