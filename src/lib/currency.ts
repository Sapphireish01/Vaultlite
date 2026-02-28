// src/lib/currency.ts
// All money math lives here. Keep currency logic centralized to avoid bugs.

// ─── KOBO / NAIRA CONVERSION ─────────────────────────────────────────────────
// We store money as integers (kobo) to avoid floating point issues.
// e.g. 0.1 + 0.2 = 0.30000000000000004 in JavaScript! Not great for a bank.

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100); // Round to avoid floating point drift
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(koboToNaira(kobo));
}

// ─── MONTHLY SPENDING CALCULATOR ─────────────────────────────────────────────
// Calculates how much has been spent (DEBIT only) in the current calendar month.

import type { Transaction } from "@prisma/client";

export function calcMonthlySpent(transactions: Transaction[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return transactions
    .filter(
      (t) =>
        t.type === "DEBIT" && new Date(t.createdAt) >= startOfMonth
    )
    .reduce((sum, t) => sum + t.amountKobo, 0);
}
