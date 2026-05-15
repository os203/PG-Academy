import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      session: {
        courseName: session.line_items ? undefined : session.metadata?.trackId,
        amount: session.amount_total,
        email: session.customer_email || session.customer_details?.email,
        paymentId: session.payment_intent || session.id,
      },
    });
  } catch (error) {
    console.error("[CHECKOUT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
