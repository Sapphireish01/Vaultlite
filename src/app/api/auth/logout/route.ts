// src/app/api/auth/logout/route.ts
// POST /api/auth/logout — Clears the session cookie.


export const dynamic = "force-dynamic";
export const runtime = "nodejs";


import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearSessionCookie();
  return NextResponse.json({ success: true, data: null });
}
