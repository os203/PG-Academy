import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/auth';

function getRequiredRole(pathname: string): JwtPayload['role'] | null {
  if (pathname.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname.startsWith('/dashboard/instructor')) return 'INSTRUCTOR';
  if (pathname.startsWith('/dashboard/student')) return 'STUDENT';
  return null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiredRole = getRequiredRole(pathname);

  // If the route doesn't require a specific role, proceed
  if (!requiredRole) {
    return NextResponse.next();
  }

  // Get token from secure cookies
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const decoded = await verifyToken(token);

  if (!decoded || !decoded.role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const userRole = decoded.role;

  // Authorization Hierarchy Checking:
  // 1. ADMIN has complete system access
  if (userRole === 'ADMIN') {
    return NextResponse.next();
  }

  // 2. INSTRUCTOR has access to instructor and student dashboards
  if (userRole === 'INSTRUCTOR' && (requiredRole === 'INSTRUCTOR' || requiredRole === 'STUDENT')) {
    return NextResponse.next();
  }

  // 3. STUDENT has access ONLY to the student dashboard
  if (userRole === 'STUDENT' && requiredRole === 'STUDENT') {
    return NextResponse.next();
  }

  // If none of the conditions match, user is unauthorized for this route
  return NextResponse.redirect(new URL('/unauthorized', req.url));
}

// Ensure the middleware strictly matches these protected paths
export const config = {
  matcher: ['/dashboard/admin/:path*', '/dashboard/instructor/:path*', '/dashboard/student/:path*'],
};
