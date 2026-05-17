import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { sendInvoiceEmail } from "@/lib/email";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const trackId = session.metadata?.trackId;
    const couponId = session.metadata?.couponId || null;
    const finalPrice = parseFloat(session.metadata?.finalPrice || "0");

    if (!userId || !trackId) {
      console.error("[STRIPE_WEBHOOK] Missing userId or trackId in metadata", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      // Check if enrollment already exists (idempotency)
      const existingEnrollment = await db.enrollment.findFirst({
        where: { userId, trackId },
        select: { id: true },
      });

      if (!existingEnrollment) {
        // Create enrollment and payment in a transaction
        await db.$transaction([
          db.enrollment.create({
            data: {
              userId,
              trackId,
              status: "APPROVED",
            },
          }),
          db.payment.create({
            data: {
              userId,
              trackId,
              amount: finalPrice,
              type: "COURSE_PURCHASE",
              status: "COMPLETED",
              stripeId: session.id,
              couponId: couponId || null,
            },
          }),
        ]);

        console.log(`[STRIPE_WEBHOOK] Enrolled user ${userId} in track ${trackId} (payment: ${session.id})`);
      } else {
        // Still record the payment even if already enrolled (e.g., duplicate webhook)
        const existingPayment = await db.payment.findUnique({
          where: { stripeId: session.id },
        });

        if (!existingPayment) {
          await db.payment.create({
            data: {
              userId,
              trackId,
              amount: finalPrice,
              type: "COURSE_PURCHASE",
              status: "COMPLETED",
              stripeId: session.id,
              couponId: couponId || null,
            },
          });
        }

        console.log(`[STRIPE_WEBHOOK] User ${userId} already enrolled in track ${trackId}, payment recorded.`);
      }

      // Fetch user and track details to send the invoice email
      const user = await db.user.findUnique({ where: { id: userId } });
      const track = await db.track.findUnique({ where: { id: trackId } });

      if (user && track) {
        try {
          await sendInvoiceEmail(user.email, user.name, track.title, finalPrice, session.id);
          console.log(`[STRIPE_WEBHOOK] Invoice email sent to ${user.email} for track ${track.id}`);
        } catch (emailErr) {
          console.error("[STRIPE_WEBHOOK] Failed to send invoice email:", emailErr);
          // Do not fail the webhook if the email fails
        }
      }
    } catch (err) {
      console.error("[STRIPE_WEBHOOK_DB_ERROR]", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
