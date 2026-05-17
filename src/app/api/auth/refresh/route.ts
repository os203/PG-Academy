import { NextResponse } from 'next/server';
import { verifyToken, signAccessToken, JwtPayload } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const decoded = await verifyToken(refreshToken);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User no longer exists' }, { status: 401 });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = await signAccessToken(payload);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    const isSecureEnv = process.env.NODE_ENV === 'production' && process.env.REQUIRE_HTTPS === 'true';

    response.cookies.set({
      name: 'token',
      value: accessToken,
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;

  } catch (error: unknown) {
    console.error('Refresh Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
