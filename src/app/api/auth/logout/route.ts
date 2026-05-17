import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Terminate user session by clearing authentication cookies
 */
export async function POST() {
  try {
    const isSecureEnv = process.env.NODE_ENV === 'production' && process.env.REQUIRE_HTTPS === 'true';

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
    
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[AUTH_LOGOUT_ERROR]:', error);
    return NextResponse.json(
      { error: "Failed to process logout" },
      { status: 500 }
    );
  }
}