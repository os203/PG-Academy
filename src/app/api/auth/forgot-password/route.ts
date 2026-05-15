import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return new NextResponse("If an account exists, a reset link has been sent.", { status: 200 });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before saving to the database for security
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Token expires in 1 hour
    const tokenExpiry = new Date(Date.now() + 3600000);

    await db.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: tokenExpiry,
      },
    });

    // Send email with the unhashed token
    await sendPasswordResetEmail(email, resetToken);

    return new NextResponse("If an account exists, a reset link has been sent.", { status: 200 });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
