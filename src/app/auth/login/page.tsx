// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            router.push("/dashboard");

        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#0f0f14] flex items-center justify-center p-5 font-['Outfit'] transition-colors duration-300">
            <div className="w-full max-auto max-w-[400px] bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[24px] p-10 shadow-xl dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Logo */}
                <div className="flex items-center gap-2.5 justify-center mb-7">
                    <span className="text-2xl">🏦</span>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">VaultLite</h1>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5">Welcome back</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-500">Sign in to your wallet</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 tracking-wide uppercase">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 tracking-wide uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3.5 py-3 rounded-xl text-xs">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 mt-1"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                </form>

                <p className="text-center mt-6 text-sm text-slate-500 dark:text-zinc-500">
                    No account?{" "}
                    <Link href="/auth/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline decoration-2 underline-offset-4">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
