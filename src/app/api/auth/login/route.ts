import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  comparePasswords,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

/**
 * Handle user authentication and session initiation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request payload against authentication schema
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Verify user existence in PostgreSQL via Prisma
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Validate credential integrity using bcrypt comparison
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate dual-token system for session management
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
      token: accessToken,
    });

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

    // Persist refresh token in a secure HttpOnly cookie
    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7-day retention
    });

    return response;
  } catch (error: unknown) {
    console.error("[AUTH_LOGIN_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
