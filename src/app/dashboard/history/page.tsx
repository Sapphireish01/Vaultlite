"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";
import { TransactionsTable, Transaction } from "@/components/dashboard/TransactionsTable";

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

function HistoryPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    // Filters (from URL if possible)
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [type, setType] = useState(searchParams.get("type") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "15",
                ...(type && { type }),
                ...(category && { category })
            });

            const [tRes, uRes] = await Promise.all([
                fetch(`/api/transactions?${params.toString()}`),
                fetch("/api/auth/me")
            ]);
            const tData = await tRes.json();
            const uData = await uRes.json();

            if (tData.success) {
                setTransactions(tData.data.transactions);
                setPagination(tData.data.pagination);
            }

            if (uData.success) {
                setUser(uData.data);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    }, [page, type, category]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    const filteredTransactions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-4xl font-black tracking-tight mb-2">Transaction History</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Detailed record of all your financial movements.</p>
                </header>

                {/* Filters Section */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-8">
                    <div className="xl:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by description or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium"
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="w-full px-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium appearance-none cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="CREDIT">Income (Credit)</option>
                        <option value="DEBIT">Expenses (Debit)</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className="w-full px-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium appearance-none cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Deposit", "General"].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <p className="text-zinc-500 font-medium animate-pulse">Loading transactions...</p>
                        </div>
                    ) : (
                        <>
                            <TransactionsTable
                                transactions={filteredTransactions}
                                hideSeeAll={true}
                                noContainer={true}
                            />

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm font-medium text-zinc-500">
                                        Showing <span className="text-zinc-900 dark:text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="text-zinc-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-zinc-900 dark:text-white">{pagination.total}</span> entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={pagination.page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={cn(
                                                    "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                                    pagination.page === i + 1
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            disabled={!pagination.hasMore}
                                            onClick={() => setPage(p => p + 1)}
                                            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {filteredTransactions.length === 0 && !loading && (
                                <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No transactions found</h3>
                                    <p className="text-zinc-500 max-w-xs">We couldn't find any results matching your filters. Try adjusting your search.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        }>
            <HistoryPageContent />
        </Suspense>
    );
}
