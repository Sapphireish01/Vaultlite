// src/proxy.ts
// Next.js proxy runs BEFORE every request hits your routes.
// We use it to redirect unauthenticated users away from protected pages.
//
// Think of it as a security guard at the door — faster than checking inside each route.

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes only for logged-out users (redirect to dashboard if already logged in)
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("vaultlite_session")?.value;

  const isAuthenticated = token ? await verifyToken(token) : null;

  // If trying to access a protected page without being logged in
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // If already logged in, redirect away from auth pages
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run proxy on these paths (not on API routes or static files)
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
