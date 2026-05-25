import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const user = await verifyToken();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await db.coupon.findMany({
      include: {
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin Coupons fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, discountType, value, expiryDate } = body;

    if (!code || !discountType || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, discountType, value" },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return NextResponse.json(
        { error: "discountType must be PERCENTAGE or FIXED" },
        { status: 400 }
      );
    }

    if (discountType === "PERCENTAGE" && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        value: parseFloat(value),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("Admin Coupon create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyToken();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Admin Coupon delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
