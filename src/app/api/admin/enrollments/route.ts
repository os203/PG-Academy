import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken();
    if (!decoded?.userId || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollments = await db.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        track: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("[ADMIN_ENROLLMENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
