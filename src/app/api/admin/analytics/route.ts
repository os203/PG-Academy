import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      enrollmentTrend,
      userGrowth,
      topCourses,
      topInstructors,
      revenueByStatus,
    ] = await Promise.all([
      // Enrollment trend — last 30 days (raw data, grouped client-side)
      db.enrollment.findMany({
        where: { enrolledAt: { gte: thirtyDaysAgo } },
        select: { enrolledAt: true },
        orderBy: { enrolledAt: "asc" },
      }),

      // User growth — last 30 days
      db.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: "asc" },
      }),

      // Top courses by enrollment count
      db.course.findMany({
        take: 10,
        orderBy: { enrollments: { _count: "desc" } },
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      }),

      // Top instructors by course count and enrollment
      db.user.findMany({
        where: { role: "INSTRUCTOR" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { courses: true } },
          courses: {
            select: {
              _count: { select: { enrollments: true } },
              price: true,
            },
          },
        },
      }),

      // Revenue breakdown by payment status
      db.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Process enrollment trend into daily buckets
    const enrollmentByDay = enrollmentTrend.reduce(
      (acc: Record<string, number>, e) => {
        const day = e.enrolledAt.toISOString().split("T")[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {}
    );

    // Process user growth into daily buckets
    const userGrowthByDay = userGrowth.reduce(
      (acc: Record<string, number>, u) => {
        const day = u.createdAt.toISOString().split("T")[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate instructor revenue estimates
    const instructorLeaderboard = topInstructors
      .map((inst) => ({
        id: inst.id,
        name: inst.name,
        email: inst.email,
        courseCount: inst._count.courses,
        totalEnrollments: inst.courses.reduce(
          (sum, c) => sum + c._count.enrollments,
          0
        ),
        estimatedRevenue: inst.courses.reduce(
          (sum, c) => sum + c._count.enrollments * c.price * 0.8, // 80% instructor cut
          0
        ),
      }))
      .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);

    return NextResponse.json({
      enrollmentTrend: enrollmentByDay,
      userGrowth: userGrowthByDay,
      topCourses: topCourses.map((c) => ({
        ...c,
        enrollments: c._count.enrollments,
        estimatedRevenue: c._count.enrollments * c.price,
      })),
      instructorLeaderboard,
      revenueByStatus: revenueByStatus.map((r) => ({
        status: r.status,
        total: r._sum.amount || 0,
        count: r._count,
      })),
    });
  } catch (error) {
    console.error("Admin Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
