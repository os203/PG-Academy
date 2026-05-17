import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Terminate user session by clearing authentication cookies
 */
export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
    
    // Explicitly delete cookies using Next.js Response Cookie API
    response.cookies.delete('token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('[AUTH_LOGOUT_ERROR]:', error);
    return NextResponse.json(
      { error: "Failed to process logout" },
      { status: 500 }
    );
  }
}