"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Wallet,
    ArrowLeft,
    Plus,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

const AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export default function CreditPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("Wallet Top-up");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    React.useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.success) setUser(data.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        }
        fetchUser();
    }, []);

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "CREDIT",
                    amountNaira: parseFloat(amount),
                    description,
                    category: "Deposit"
                }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus("success");
                setAmount("");
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Failed to add funds");
            }
        } catch (err) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (status === "success") {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Funds Added Successfully!</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8">Your wallet balance has been updated. Redirecting to dashboard...</p>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full animate-progress" />
                    </div>
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

            <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                <header className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back to Dashboard</span>
                    </button>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Add Funds</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Top up your virtual wallet securely.</p>
                </header>

                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Amount Section */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
                            <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-6">
                                Select or Enter Amount
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                {AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setAmount(amt.toString())}
                                        className={cn(
                                            "py-4 px-2 rounded-2xl border font-bold transition-all",
                                            amount === amt.toString()
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]"
                                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-indigo-600 dark:hover:border-indigo-400"
                                        )}
                                    >
                                        ₦{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400 group-focus-within:text-indigo-600 transition-colors">₦</span>
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter custom amount"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 outline-none rounded-2xl py-6 pl-12 pr-6 text-2xl font-bold transition-all placeholder:text-zinc-400"
                                />
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
                            <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                                Description
                            </label>
                            <input
                                type="text"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this for?"
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 outline-none rounded-2xl py-4 px-6 font-medium transition-all"
                            />
                        </div>

                        {status === "error" && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="font-medium text-sm">{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-6 h-6" />
                                    <span>Complete Top-up</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            <style jsx global>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s linear forwards;
                }
            `}</style>
        </div>
    );
}
