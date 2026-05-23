import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const forbidden = () =>
  NextResponse.json({ error: "Forbidden" }, { status: 403 });

async function getAuthPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

async function buildProfileResponse(userId: string) {
  const currentUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    return null;
  }

  const baseProfile = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role.toLowerCase(),
    bio: currentUser.bio ?? "",
    avatarUrl: currentUser.avatarUrl ?? null,
  };

  if (currentUser.role === "STUDENT") {
    const enrollments = await db.enrollment.findMany({
      where: { userId: currentUser.id },
      orderBy: { enrolledAt: "desc" },
      include: {
        track: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      ...baseProfile,
      enrolledCourses: enrollments.map((enrollment) => ({
        id: enrollment.track.id,
        title: enrollment.track.title,
      })),
    };
  }

  if (currentUser.role === "INSTRUCTOR") {
    const assignedCourses = await db.track.findMany({
      where: { instructorId: currentUser.id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      ...baseProfile,
      assignedCourses: assignedCourses.map((track) => ({
        id: track.id,
        title: track.title,
        studentCount: track._count.enrollments,
      })),
    };
  }

  if (currentUser.role === "ADMIN") {
    const totalUsers = await db.user.count();
    const totalCourses = await db.track.count();
    const totalEnrollments = await db.enrollment.count();

    return {
      ...baseProfile,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
      },
    };
  }

  return baseProfile;
}

export async function GET() {
  const payload = await getAuthPayload();
  if (!payload?.userId) {
    return unauthorized();
  }

  const profile = await buildProfileResponse(payload.userId);
  if (!profile) {
    return unauthorized();
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const payload = await getAuthPayload();
  if (!payload?.userId) {
    return unauthorized();
  }

  const contentType = request.headers.get("content-type") || "";
  let name: string | undefined;
  let bio: string | undefined;
  let avatarUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const nameField = formData.get("name");
    const bioField = formData.get("bio");
    const file = formData.get("avatar") as File | null;

    name = typeof nameField === "string" ? nameField.trim() : undefined;
    bio = typeof bioField === "string" ? bioField.trim() : undefined;

    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `avatar-${payload.userId}-${uniqueSuffix}.png`;

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        avatarUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error("Error saving avatar:", err);
        return NextResponse.json(
          { error: "Failed to save avatar file." },
          { status: 500 },
        );
      }
    }
  } else {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : undefined;
    bio = typeof body.bio === "string" ? body.bio.trim() : undefined;
  }

  if (name !== undefined && name.length === 0) {
    return NextResponse.json(
      { error: "Name cannot be empty." },
      { status: 400 },
    );
  }

  const updateData: Record<string, string | null> = {};
  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  const updatedUser = await db.user.update({
    where: { id: payload.userId },
    data: updateData,
  });

  const profile = await buildProfileResponse(updatedUser.id);
  return NextResponse.json(profile);
}
