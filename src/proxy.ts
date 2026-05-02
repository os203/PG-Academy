import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/auth";

function getRequiredRole(pathname: string): JwtPayload["role"] | null {
  if (pathname.startsWith("/dashboard/admin")) return "ADMIN";
  if (pathname.startsWith("/dashboard/instructor")) return "INSTRUCTOR";
  if (pathname.startsWith("/dashboard/student")) return "STUDENT";
  return null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiredRole = getRequiredRole(pathname);

  // المسارات غير المحمية تكمل طبيعي
  if (!requiredRole) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded = await verifyToken(token);

  if (!decoded || !decoded.role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = decoded.role;

  // ADMIN dashboard
  if (requiredRole === "ADMIN") {
    if (userRole === "ADMIN") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // INSTRUCTOR dashboard
  if (requiredRole === "INSTRUCTOR") {
    if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // STUDENT dashboard
  if (requiredRole === "STUDENT") {
    if (userRole === "ADMIN" || userRole === "STUDENT") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/dashboard/instructor/:path*",
    "/dashboard/student/:path*",
  ],
};