// src/app/api/wallet/route.ts
// GET /api/wallet — Returns the current user's wallet info.
// This is a PROTECTED route — unauthenticated users get 401.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatNaira, calcMonthlySpent } from "@/lib/currency";

export async function GET(request: NextRequest) {
  // ─── AUTHENTICATION CHECK ───────────────────────────────────────────────
  // Every protected route starts with this. If no valid session → 401.
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "You must be logged in" },
      { status: 401 }
    );
  }

  // ─── FETCH WALLET ───────────────────────────────────────────────────────
  const wallet = await db.wallet.findUnique({
    where: { userId: session.id },
    include: {
      // Include recent transactions for monthly spend calculation
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 100, // Last 100 transactions is enough for monthly calc
      },
    },
  });

  if (!wallet) {
    return NextResponse.json(
      { success: false, error: "Wallet not found" },
      { status: 404 }
    );
  }

  // ─── COMPUTE DERIVED FIELDS ─────────────────────────────────────────────
  // These are calculated, not stored in the DB
  const monthlySpentKobo = calcMonthlySpent(wallet.transactions);
  const isNearLimit = monthlySpentKobo >= wallet.monthlyLimitKobo * 0.8;

  return NextResponse.json({
    success: true,
    data: {
      id: wallet.id,
      balanceKobo: wallet.balanceKobo,
      balanceFormatted: formatNaira(wallet.balanceKobo),
      monthlyLimitKobo: wallet.monthlyLimitKobo,
      monthlyLimitFormatted: formatNaira(wallet.monthlyLimitKobo),
      monthlySpentKobo,
      monthlySpentFormatted: formatNaira(monthlySpentKobo),
      isNearLimit,
      currency: wallet.currency,
    },
  });
}

// ─── UPDATE WALLET (Limit) ──────────────────────────────────────────────────
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { monthlyLimitNaira } = await request.json();

    if (typeof monthlyLimitNaira !== "number" || monthlyLimitNaira < 0) {
      return NextResponse.json({ success: false, error: "Invalid limit amount" }, { status: 400 });
    }

    const monthlyLimitKobo = Math.round(monthlyLimitNaira * 100);

    const updatedWallet = await db.wallet.update({
      where: { userId: session.id },
      data: { monthlyLimitKobo },
    });

    return NextResponse.json({
      success: true,
      data: {
        monthlyLimitKobo: updatedWallet.monthlyLimitKobo,
        monthlyLimitFormatted: formatNaira(updatedWallet.monthlyLimitKobo),
      },
    });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update wallet" }, { status: 500 });
  }
}
