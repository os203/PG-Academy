import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can purchase tracks" }, { status: 403 });
    }

    const body = await req.json();
    const trackId = typeof body.trackId === "string" ? body.trackId.trim() : "";
    const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";

    if (!trackId) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    const track = await db.track.findFirst({
      where: { id: trackId, status: "PUBLISHED" },
      select: { id: true, title: true, price: true, thumbnail: true, instructorId: true },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found or not published" }, { status: 404 });
    }

    // Check already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: { userId: currentUser.id, trackId },
      select: { id: true },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "You are already enrolled in this track", alreadyEnrolled: true }, { status: 400 });
    }

    // Free track — enroll directly
    if (track.price === 0) {
      const enrollment = await db.enrollment.create({
        data: { userId: currentUser.id, trackId },
      });
      return NextResponse.json({ free: true, enrollment }, { status: 201 });
    }

    // Calculate discount if coupon provided
    let finalPrice = track.price;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });

      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
      }

      couponId = coupon.id;

      if (coupon.discountType === "PERCENTAGE") {
        finalPrice = track.price * (1 - coupon.value / 100);
      } else {
        finalPrice = Math.max(0, track.price - coupon.value);
      }

      // If discount makes it free, enroll directly
      if (finalPrice <= 0) {
        const [enrollment] = await Promise.all([
          db.enrollment.create({ data: { userId: currentUser.id, trackId } }),
          db.payment.create({
            data: {
              userId: currentUser.id,
              trackId,
              amount: 0,
              type: "COURSE_PURCHASE",
              status: "COMPLETED",
              couponId,
            },
          }),
        ]);
        return NextResponse.json({ free: true, enrollment }, { status: 201 });
      }
    }

    // Create Stripe Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: currentUser.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: track.title,
              ...(track.thumbnail ? { images: [track.thumbnail.startsWith("http") ? track.thumbnail : `${appUrl}${track.thumbnail}`] } : {}),
            },
            unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: currentUser.id,
        trackId: track.id,
        couponId: couponId || "",
        originalPrice: String(track.price),
        finalPrice: String(finalPrice),
      },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&trackId=${trackId}`,
      cancel_url: `${appUrl}/payment/cancel?trackId=${trackId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
