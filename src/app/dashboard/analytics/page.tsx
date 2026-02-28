"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    CalendarDays
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    type: "DEBIT" | "CREDIT";
    amountKobo: number;
    description: string;
    category: string;
    createdAt: string;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [tRes, uRes] = await Promise.all([
                    fetch("/api/transactions?limit=100"),
                    fetch("/api/auth/me")
                ]);
                const tData = await tRes.json();
                const uData = await uRes.json();

                if (tData.success) {
                    setTransactions(tData.data.transactions);
                }
                if (uData.success) {
                    setUser(uData.data);
                }
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const totalIncome = transactions
            .filter(tx => tx.type === "CREDIT")
            .reduce((sum, tx) => sum + tx.amountKobo, 0);

        const totalExpenses = transactions
            .filter(tx => tx.type === "DEBIT")
            .reduce((sum, tx) => sum + tx.amountKobo, 0);

        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        return {
            totalIncome: `₦${(totalIncome / 100).toLocaleString()}`,
            totalExpenses: `₦${(totalExpenses / 100).toLocaleString()}`,
            netSavings: `₦${(netSavings / 100).toLocaleString()}`,
            savingsRate: savingsRate.toFixed(1) + "%",
            isPositive: netSavings >= 0
        };
    }, [transactions]);

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
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

            <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                <header className="mb-12">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Dashboard Overview</span>
                    </button>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Financial Analytics</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Visual insights into your spending and saving habits.</p>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    <AnalyticsStatCard
                        label="Total Income"
                        value={stats.totalIncome}
                        icon={TrendingUp}
                        color="emerald"
                    />
                    <AnalyticsStatCard
                        label="Total Expenses"
                        value={stats.totalExpenses}
                        icon={TrendingDown}
                        color="red"
                    />
                    <AnalyticsStatCard
                        label="Net Savings"
                        value={stats.netSavings}
                        icon={BarChart3}
                        color={stats.isPositive ? "indigo" : "amber"}
                    />
                    <AnalyticsStatCard
                        label="Savings Rate"
                        value={stats.savingsRate}
                        icon={PieChartIcon}
                        color="blue"
                    />
                </div>

                {/* Main Charts Section */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">Spending Trends</h2>
                                <p className="text-zinc-500 font-medium">Daily transaction volume over time</p>
                            </div>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                                <button className="px-4 py-2 bg-white dark:bg-zinc-700 shadow-sm rounded-xl text-sm font-bold">Last 30 Days</button>
                                <button className="px-4 py-2 text-zinc-500 text-sm font-bold">All Time</button>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <TrendChart transactions={transactions} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-1">Category Breakdown</h2>
                                    <p className="text-zinc-500 font-medium">Distribution of expenses by category</p>
                                </div>
                            </div>
                            <div className="h-[400px]">
                                <CategoryPieChart transactions={transactions} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AnalyticsStatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
    const colorClasses = {
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorClasses[color as keyof typeof colorClasses])}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{value}</h3>
        </div>
    );
}
