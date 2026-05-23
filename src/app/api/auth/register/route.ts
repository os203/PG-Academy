import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signAccessToken, signRefreshToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";

/**
 * Create a new user account and initialize session
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Sanitize and validate registration data
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = validation.data;

    // Prevent duplicate registrations
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email address already registered" },
        { status: 409 },
      );
    }

    // Securely hash credentials before persistence
    const hashedPassword = await hashPassword(password);

    // Create user with default STUDENT role as per SRS requirements
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
        },
        token: accessToken,
      },
      { status: 201 },
    );

    const isSecureEnv =
      process.env.NODE_ENV === "production" &&
      process.env.REQUIRE_HTTPS === "true";

    // Set access token cookie
    response.cookies.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Establish secure refresh token cookie
    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error("[AUTH_REGISTRATION_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
