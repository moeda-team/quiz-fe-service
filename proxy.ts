// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass route yang TIDAK boleh diintercept
  if (
    pathname.startsWith("/api/auth") ||  // endpoint NextAuth (session, signin, callback, dll)
    pathname.startsWith("/_next") ||     // file Next.js internal
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")               // file statis (.png, .jpg, .js, dll)
  ) {
    return NextResponse.next();
  }

  // 2. Public routes: boleh tanpa login
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/forgot-password"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Ambil token NextAuth (JWT)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 4. Belum login dan mau akses /dashboard → lempar ke login
  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Kalau tetap tidak ada token (tapi kena matcher lain) → anggap 404
  if (!token) {
    const notFoundUrl = req.nextUrl.clone();
    notFoundUrl.pathname = "/error/404"; // pastikan kamu punya app/error/404/page.tsx
    return NextResponse.redirect(notFoundUrl);
  }

  const role = token.role as "admin" | "student" | "teacher" | undefined;

  // 6. RULE BY PATH + ROLE

  // /dashboard/admin/*
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    const notFoundUrl = req.nextUrl.clone();
    notFoundUrl.pathname = "/error/404";
    return NextResponse.redirect(notFoundUrl);
  }

  // /dashboard/teacher/*
  if (pathname.startsWith("/dashboard/teacher") && role !== "teacher") {
    const notFoundUrl = req.nextUrl.clone();
    notFoundUrl.pathname = "/error/404";
    return NextResponse.redirect(notFoundUrl);
  }

  // /dashboard/student/*
  if (pathname.startsWith("/dashboard/student") && role !== "student") {
    const notFoundUrl = req.nextUrl.clone();
    notFoundUrl.pathname = "/error/404";
    return NextResponse.redirect(notFoundUrl);
  }

  // 7. Lolos semua cek → lanjut
  return NextResponse.next();
}

// proxy ini jalan untuk semua path di bawah:
export const config = {
  matcher: [
    "/dashboard/:path*", // semua halaman dashboard
    "/api/:path*",       // kalau mau proteksi API lain
  ],
};
