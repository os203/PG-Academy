import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("PATCH /api/admin/courses/[id]/approve - id:", id);
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      console.log("No token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    
    if (!user || user.role !== "ADMIN") {
      console.log("Invalid user or not ADMIN:", user);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);
    const { status } = body;

    if (!status || !["DRAFT", "PUBLISHED"].includes(status)) {
      console.log("Invalid status:", status);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedCourse = await db.course.update({
      where: { id },
      data: { status }
    });

    console.log("Updated course successfully");
    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error("Admin Course approve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
