// src/lib/db.ts
// Singleton Prisma client — we reuse one connection across the whole app.
// Without this pattern, Next.js dev mode would create too many DB connections.

import { PrismaClient } from "@prisma/client";

// Attach to globalThis so hot-reloading doesn't create new connections
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    // In dev, log every SQL query so you can see exactly what's happening
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
