// src/app/api/auth/logout/route.ts
// POST /api/auth/logout — Clears the session cookie.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

// NextRequest param is required — without it Vercel's build tries to
// statically optimize this route and fails when it finds cookies() usage.
export async function POST(_request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.json({ success: true, data: null });
}
