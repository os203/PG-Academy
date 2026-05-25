import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Shim for API routes that previously verified JWTs
export async function verifyToken(_token?: string): Promise<JwtPayload | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
}

// Shim for authorization logic
export async function getAuthorizedCourse(trackId: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user?.role) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.role !== "ADMIN" && user.role !== "INSTRUCTOR") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const track = await db.track.findFirst({
    where:
      user.role === "ADMIN"
        ? { id: trackId }
        : {
            id: trackId,
            instructorId: userId,
          },
  });

  if (!track) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Track not found or forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    track,
    decoded: { userId, role: user.role },
  };
}
