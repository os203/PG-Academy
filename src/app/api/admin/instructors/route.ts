import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const decoded = await verifyToken();

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    // Create user in Clerk
    const clerk = await clerkClient();
    
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: password,
        firstName: firstName,
        lastName: lastName,
        publicMetadata: { role: "INSTRUCTOR" }
      });
    } catch (err: unknown) {
      console.error("Clerk creation error:", err);
      const clerkErr = err as { errors?: { message?: string }[] };
      const errorMsg = clerkErr?.errors?.[0]?.message || "Failed to create user in Clerk";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Create instructor in Prisma immediately so the UI reflects it without waiting for webhook
    const newInstructor = await db.user.upsert({
      where: { id: clerkUser.id },
      update: {
        role: "INSTRUCTOR",
        name,
        email,
      },
      create: {
        id: clerkUser.id,
        name,
        email,
        password: "clerk-managed",
        role: "INSTRUCTOR",
      }
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        adminId: decoded.userId,
        action: `Created new INSTRUCTOR account: ${email}`,
        category: "USER_MGMT",
        severity: "success",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newInstructor.id,
        name: newInstructor.name,
        email: newInstructor.email,
        role: newInstructor.role
      } 
    });

  } catch (error) {
    console.error("Error creating instructor:", error);
    return NextResponse.json({ error: "Failed to create instructor" }, { status: 500 });
  }
}
