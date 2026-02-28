// src/types/index.ts
// Shared TypeScript types used across frontend and backend.
// Keeping types in one place prevents them from drifting apart.

export type TransactionType = "CREDIT" | "DEBIT";

export type TransactionCategory =
  | "Income"
  | "Food"
  | "Transport"
  | "Housing"
  | "Utilities"
  | "Entertainment"
  | "Healthcare"
  | "Deposit"
  | "General";

// ─── API RESPONSE SHAPES ─────────────────────────────────────────────────────
// These are what your API routes return as JSON.

export interface WalletData {
  id: string;
  balanceKobo: number;
  monthlyLimitKobo: number;
  currency: string;
  // Computed fields (calculated in the API, not stored in DB)
  balanceFormatted: string;       // e.g. "₦250,000.00"
  monthlySpentKobo: number;       // Total debits this month
  monthlySpentFormatted: string;
  monthlyLimitFormatted: string;
  isNearLimit: boolean;           // true if spent > 80% of limit
}

export interface TransactionData {
  id: string;
  type: TransactionType;
  amountKobo: number;
  amountFormatted: string;        // e.g. "₦15,000.00"
  description: string;
  category: TransactionCategory;
  balanceAfterKobo: number;
  balanceAfterFormatted: string;
  createdAt: string;              // ISO date string
}

// ─── API REQUEST SHAPES ──────────────────────────────────────────────────────
// What the frontend sends in the request body.

export interface TransactionRequest {
  type: TransactionType;
  amountNaira: number;            // Frontend sends in Naira, API converts to Kobo
  description: string;
  category: TransactionCategory;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── GENERIC API RESPONSE ────────────────────────────────────────────────────
// All API routes return this shape — consistent error handling.
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
