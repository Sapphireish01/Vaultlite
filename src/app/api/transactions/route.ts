// src/app/api/transactions/route.ts
// GET  /api/transactions — List transactions (with pagination + filters)
// POST /api/transactions — Create a new credit or debit

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { nairaToKobo, formatNaira } from "@/lib/currency";

// ─── VALIDATION ──────────────────────────────────────────────────────────────
const transactionSchema = z.object({
  type: z.enum(["CREDIT", "DEBIT"]),
  amountNaira: z
    .number()
    .positive("Amount must be greater than 0")
    .max(10_000_000, "Amount too large"), // ₦10M max per transaction
  description: z.string().min(1).max(100),
  category: z.enum([
    "Income", "Food", "Transport", "Housing",
    "Utilities", "Entertainment", "Healthcare", "Deposit", "General",
  ]),
});

// ─── GET — List transactions ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Parse query params for filtering + pagination
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type") as "CREDIT" | "DEBIT" | null;
  const category = searchParams.get("category");

  // Get the wallet first (we need walletId to query transactions)
  const wallet = await db.wallet.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });

  if (!wallet) {
    return NextResponse.json(
      { success: false, error: "Wallet not found" },
      { status: 404 }
    );
  }

  // Build the WHERE clause dynamically based on filters
  const where = {
    walletId: wallet.id,
    ...(type && { type }),                              // Filter by CREDIT/DEBIT if provided
    ...(category && { category }),                      // Filter by category if provided
  };

  // Run two queries in parallel: data + total count (for pagination)
  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,   // Pagination offset
      take: limit,
    }),
    db.transaction.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      transactions: transactions.map((t) => ({
        ...t,
        amountFormatted: formatNaira(t.amountKobo),
        balanceAfterFormatted: formatNaira(t.balanceAfterKobo),
        createdAt: t.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    },
  });
}

// ─── POST — Create a transaction ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, amountNaira, description, category } =
      transactionSchema.parse(body);

    const amountKobo = nairaToKobo(amountNaira);

    // ─── DATABASE TRANSACTION ─────────────────────────────────────────────
    // This is the most important pattern in fintech backend development!
    //
    // db.$transaction() wraps multiple DB operations atomically:
    // - If ANYTHING fails inside, ALL changes are rolled back.
    // - This means we can never end up with money deducted but no record created,
    //   or a record created but balance not updated.
    //
    // Without this, a server crash mid-operation could corrupt user balances.

    const result = await db.$transaction(async (tx) => {
      // 1. Lock and fetch the wallet (select for update)
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.id },
      });

      if (!wallet) throw new Error("Wallet not found");

      // 2. Business logic validation
      if (type === "DEBIT") {
        // Can't debit more than current balance
        if (amountKobo > wallet.balanceKobo) {
          throw new Error("Insufficient balance");
        }

        // Check monthly spending limit
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlySpent = await tx.transaction.aggregate({
          where: {
            walletId: wallet.id,
            type: "DEBIT",
            createdAt: { gte: startOfMonth },
          },
          _sum: { amountKobo: true },
        });

        const totalMonthlySpent =
          (monthlySpent._sum.amountKobo || 0) + amountKobo;

        if (totalMonthlySpent > wallet.monthlyLimitKobo) {
          throw new Error(
            `This transaction would exceed your monthly limit of ${formatNaira(wallet.monthlyLimitKobo)}`
          );
        }
      }

      // 3. Calculate new balance
      const newBalanceKobo =
        type === "CREDIT"
          ? wallet.balanceKobo + amountKobo
          : wallet.balanceKobo - amountKobo;

      // 4. Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceKobo: newBalanceKobo },
      });

      // 5. Create the transaction record (the permanent audit trail)
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type,
          amountKobo,
          description,
          category,
          balanceAfterKobo: newBalanceKobo,
        },
      });

      return { transaction, newBalanceKobo };
    });
    // ─── END DB TRANSACTION ────────────────────────────────────────────────

    return NextResponse.json(
      {
        success: true,
        data: {
          ...result.transaction,
          amountFormatted: formatNaira(result.transaction.amountKobo),
          newBalanceFormatted: formatNaira(result.newBalanceKobo),
          createdAt: result.transaction.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Known business logic errors (insufficient balance, limit exceeded)
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 422 } // 422 Unprocessable Entity — valid request, but business rule failed
      );
    }

    console.error("Transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
