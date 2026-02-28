// src/app/api/auth/login/route.ts
// POST /api/auth/login
// Validates credentials and sets a session cookie.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // 1. Find user by email
    const user = await db.user.findUnique({ where: { email } });

    // 2. IMPORTANT: Always run bcrypt.compare even if user doesn't exist.
    // This prevents "timing attacks" — where an attacker can tell if an
    // email is registered based on how fast the response comes back.
    const dummyHash = "$2a$12$dummyhashtopreventtimingattacks.padded";
    const passwordValid = await bcrypt.compare(
      password,
      user?.passwordHash ?? dummyHash
    );

    if (!user || !passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 } // 401 Unauthorized
      );
    }

    // 3. Set session cookie
    await setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
