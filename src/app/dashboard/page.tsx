"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    Search,
    LayoutGrid
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { cn } from "@/lib/utils";

// --- TYPES (Matching Backend API Responses) ---

interface Transaction {
    id: string;
    walletId: string;
    type: "DEBIT" | "CREDIT";
    amountKobo: number;
    description: string;
    category: string;
    balanceAfterKobo: number;
    createdAt: string;
    amountFormatted: string;
    balanceAfterFormatted: string;
}

interface WalletData {
    id: string;
    balanceKobo: number;
    balanceFormatted: string;
    monthlyLimitKobo: number;
    monthlyLimitFormatted: string;
    monthlySpentKobo: number;
    monthlySpentFormatted: string;
    isNearLimit: boolean;
    currency: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; createdAt: string } | null>(null);

    // --- DATA FETCHING ---

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [wRes, tRes, uRes] = await Promise.all([
                    fetch("/api/wallet"),
                    fetch("/api/transactions?limit=20"),
                    fetch("/api/auth/me"),
                ]);

                if (wRes.status === 401) {
                    router.push("/auth/login");
                    return;
                }

                const wData = await wRes.json();
                const tData = await tRes.json();

                if (wData.success) {
                    setWallet(wData.data);
                } else {
                    setError("Failed to load wallet data");
                }

                if (tData.success) {
                    setTransactions(tData.data.transactions);
                } else {
                    setError("Failed to load transactions");
                }

                const uData = await uRes.json();
                if (uData.success) {
                    setUser(uData.data);
                }
            } catch (err) {
                setError("An unexpected error occurred. Please try again later.");
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [router]);

    // --- DERIVED DATA (useMemo for optimization) ---

    const stats = useMemo(() => {
        const totalIncome = transactions
            .filter((tx) => tx.type === "CREDIT")
            .reduce((sum, tx) => sum + tx.amountKobo, 0);

        const totalExpenses = transactions
            .filter((tx) => tx.type === "DEBIT")
            .reduce((sum, tx) => sum + tx.amountKobo, 0);

        const netCashflow = totalIncome - totalExpenses;

        return {
            totalIncome: `₦${(totalIncome / 100).toLocaleString()}`,
            totalExpenses: `₦${(totalExpenses / 100).toLocaleString()}`,
            netCashflow: `₦${(netCashflow / 100).toLocaleString()}`,
            isPositiveCashflow: netCashflow >= 0,
        };
    }, [transactions]);

    const spentPercentage = useMemo(() => {
        if (!wallet || wallet.monthlyLimitKobo === 0) return 0;
        return (wallet.monthlySpentKobo / wallet.monthlyLimitKobo) * 100;
    }, [wallet]);

    // greeting text, hello for first time login and welcome back for recurrent login
    // check using  the users createdAt timeline

    const greeterText = useMemo(() => {
        if (!user) return "Hello";

        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        // If account was created less than 24 hours ago, it's a "first time" login vibe
        if (diffInHours < 24) {
            return "Hello";
        }

        // For recurrent users, use a time-based greeting
        const hour = now.getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, [user]);



    // --- HANDLERS ---

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    // --- RENDER HELPERS ---

    if (loading) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/20 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Plus className="w-8 h-8 rotate-45" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Something went wrong</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
            <Sidebar
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
            />

            <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 overflow-x-hidden transition-all duration-300">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            {/* Mobile Burger Menu */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                <LayoutGrid className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">Financial Overview</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm md:font-medium ">
                                    {greeterText} {user?.name ? `, ${user.name}` : ""}! <span className="md:inline-block hidden">Here's what's happening today.</span>
                                </p>
                            </div>
                        </div>

                        {/* Mobile Add Funds Button (Visible only on mobile header row) */}
                        <button
                            onClick={() => router.push("/dashboard/credit")}
                            className="md:hidden p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Search className="w-4 h-4 text-zinc-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="bg-transparent border-none outline-none text-sm w-48 font-medium"
                            />
                        </div>
                        <button className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group">
                            <LayoutGrid className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/credit")}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Funds</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Top Summary Row (Span full width) */}
                    <div className="lg:col-span-8">
                        <BalanceCard
                            balance={wallet?.balanceFormatted || "₦0.00"}
                            monthlySpent={wallet?.monthlySpentFormatted || "₦0.00"}
                            monthlyLimit={wallet?.monthlyLimitFormatted || "₦0.00"}
                            spentPercentage={spentPercentage}
                            isNearLimit={wallet?.isNearLimit || false}
                            className="h-full min-h-[300px]"
                        />
                    </div>

                    <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                        <StatsCard
                            label="Total Income"
                            value={stats.totalIncome}
                            icon={TrendingUp}
                            trend={{ value: "12%", isPositive: true }}
                            iconClassName="text-emerald-500"
                        />
                        <StatsCard
                            label="Total Expenses"
                            value={stats.totalExpenses}
                            icon={TrendingDown}
                            trend={{ value: "4%", isPositive: false }}
                            iconClassName="text-red-500"
                        />
                        <StatsCard
                            label="Net Cashflow"
                            value={stats.netCashflow}
                            icon={LayoutGrid}
                            className={cn(stats.isPositiveCashflow ? "border-emerald-100 dark:border-emerald-900/20" : "border-red-100 dark:border-red-900/20")}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="lg:col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <TrendChart transactions={transactions} />
                        <CategoryPieChart transactions={transactions} />
                    </div>

                    {/* Bottom Row */}
                    <div className="lg:col-span-12">
                        <TransactionsTable
                            transactions={transactions.slice(0, 10)}
                            onSeeAll={() => router.push("/dashboard/history")}
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}