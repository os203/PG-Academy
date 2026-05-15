import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create instructor
    const newInstructor = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
