import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

// GET /api/profile — fetch current user's profile
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            tracks: true,
            certificates: true,
          },
        },
      },
    });

    if (!user) {
      // Fallback for local development if webhook hasn't fired
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || `no-email-${userId}@example.com`;
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "New User";
      
      await db.user.create({
        data: {
          id: userId,
          email,
          name,
          password: 'clerk-managed',
          role: 'STUDENT',
        }
      });
      
      // Fetch again to get the exact shape we expect
      user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, role: true, bio: true, createdAt: true,
          _count: { select: { enrollments: true, tracks: true, certificates: true } },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/profile — update current user's profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Allow updating name and bio
    if (typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (typeof body.bio === "string") {
      updateData.bio = body.bio.trim() || null;
    }



    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
