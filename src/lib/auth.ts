// src/lib/auth.ts
// Handles JWT creation, verification, and reading the session from cookies.
// This is your "auth layer" — every protected API route uses getSession().

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

// Secret key used to sign JWTs. Must be long and random. Set in .env!
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-this-secret-in-production-min-32-chars"
);

const COOKIE_NAME = "vaultlite_session";
const TOKEN_EXPIRY = "7d"; // Tokens expire after 7 days

// ─── CREATE TOKEN ────────────────────────────────────────────────────────────
// Called after login. Creates a signed JWT containing the userId.
// The user's browser stores this in an httpOnly cookie (JS can't read it = safer).

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

// ─── VERIFY TOKEN ────────────────────────────────────────────────────────────
// Checks that a JWT is valid and hasn't been tampered with.

export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null; // Token expired or invalid
  }
}

// ─── GET SESSION ─────────────────────────────────────────────────────────────
// The most-used function. Call this at the top of any protected API route.
// Returns the full user object, or null if not logged in.

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Fetch user from DB to make sure they still exist
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, createdAt: true }, // Never return passwordHash!
  });

  return user;
}

// ─── SET SESSION COOKIE ──────────────────────────────────────────────────────
// Called after successful login/register. Sets an httpOnly cookie.
// httpOnly = browser JavaScript cannot access this cookie (XSS protection).

export async function setSessionCookie(userId: string) {
  const token = await createToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,      // JS can't read this
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",     // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });

  return token;
}

// ─── CLEAR SESSION ───────────────────────────────────────────────────────────

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
