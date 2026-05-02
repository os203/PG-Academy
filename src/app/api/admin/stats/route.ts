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

    // Run all queries in parallel for performance
    const [
      totalUsers,
      studentCount,
      instructorCount,
      adminCount,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      todayEnrollments,
      revenueResult,
      completedPayments,
      pendingPayments,
      failedPayments,
      recentEnrollments,
      recentPayments,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "INSTRUCTOR" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.course.count(),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.course.count({ where: { status: "DRAFT" } }),
      db.enrollment.count(),
      db.enrollment.count({
        where: {
          enrolledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      db.payment.count({ where: { status: "COMPLETED" } }),
      db.payment.count({ where: { status: "PENDING" } }),
      db.payment.count({ where: { status: "FAILED" } }),
      db.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
      db.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    const grossRevenue = revenueResult._sum.amount || 0;
    const platformCut = 0.2; // 20% platform fee
    const netRevenue = grossRevenue * platformCut;

    // Build activity feed from real data
    const activityFeed = [
      ...recentEnrollments.map((e) => ({
        type: "enrollment" as const,
        message: `${e.user.name} enrolled in "${e.course.title}"`,
        time: e.enrolledAt.toISOString(),
      })),
      ...recentPayments.map((p) => ({
        type: "payment" as const,
        message: `$${p.amount.toFixed(2)} payment ${p.status.toLowerCase()} from ${p.user.name}`,
        time: p.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);

    return NextResponse.json({
      users: {
        total: totalUsers,
        students: studentCount,
        instructors: instructorCount,
        admins: adminCount,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
      },
      enrollments: {
        total: totalEnrollments,
        today: todayEnrollments,
      },
      revenue: {
        gross: grossRevenue,
        net: netRevenue,
        platformCut,
      },
      payments: {
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments,
      },
      activityFeed,
    });
  } catch (error) {
    console.error("Admin Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
