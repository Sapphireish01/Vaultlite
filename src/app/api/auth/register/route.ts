// src/app/api/auth/register/route.ts
// POST /api/auth/register
// Creates a new user account + wallet.
// This is a Next.js Route Handler — the function name matches the HTTP method.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";           // Zod = runtime input validation
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────
// Zod checks the request body before we touch the database.
// If validation fails, we return a 400 error immediately.
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body
    const body = await request.json();

    // 2. Validate — throws if invalid
    const { name, email, password } = registerSchema.parse(body);

    // 3. Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Hash the password (NEVER store plain text!)
    // 12 = salt rounds. Higher = slower to crack if DB is stolen, but also slower to register.
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create user + wallet in a single transaction
    // If wallet creation fails, the user won't be created either (atomicity).
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        wallet: {
          create: {
            balanceKobo: 0,
            monthlyLimitKobo: 500_000_00, // ₦500,000 default limit
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    // 6. Log them in immediately by setting a session cookie
    await setSessionCookie(user.id);

    // 7. Return the user (without passwordHash!)
    return NextResponse.json(
      { success: true, data: user },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation failed — tell the user what's wrong
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 } // 400 Bad Request
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 } // 500 Internal Server Error
    );
  }
}
