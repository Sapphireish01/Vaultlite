"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Wallet,
    ArrowLeft,
    Save,
    Bell,
    Shield,
    Settings,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Info
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    // User/Wallet data
    const [user, setUser] = useState({ name: "", email: "" });
    const [monthlyLimit, setMonthlyLimit] = useState("");

    useEffect(() => {
        async function fetchSettings() {
            try {
                const [wRes, uRes] = await Promise.all([
                    fetch("/api/wallet"),
                    fetch("/api/auth/me") // Assuming this exists or using session logic
                ]);

                const wData = await wRes.json();
                if (wData.success) {
                    setMonthlyLimit((wData.data.monthlyLimitKobo / 100).toString());
                }

                const uData = await uRes.json();
                if (uData.success) {
                    setUser(uData.data);
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setStatus("idle");

        try {
            const res = await fetch("/api/wallet", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    monthlyLimitNaira: parseFloat(monthlyLimit)
                }),
            });

            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        } finally {
            setSaving(false);
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
                    <h1 className="text-4xl font-black tracking-tight mb-2">Account Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Manage your profile and financial preferences.</p>
                </header>

                <div className="max-w-4xl grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Navigation tabs (Simplified for now) */}
                    <div className="xl:col-span-1 space-y-2">
                        <SettingsTab icon={Settings} label="General" active />
                        <SettingsTab icon={User} label="Profile Info" />
                        <SettingsTab icon={Shield} label="Security" />
                        <SettingsTab icon={Bell} label="Notifications" />
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-2 space-y-8">
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Profile Section */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-10 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    Personal Identity
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={user.name}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-6 font-medium text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            readOnly
                                            value={user.email}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 px-6 font-medium text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="pt-2 flex items-start gap-3 text-sm text-zinc-500 italic">
                                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>Profile information is synced with your primary account and cannot be changed here.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Settings Section */}
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 lg:p-10 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-indigo-600" />
                                    Wallet Configuration
                                </h3>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Monthly Spending Limit (₦)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-zinc-400 group-focus-within:text-indigo-600 transition-colors">₦</span>
                                        <input
                                            type="number"
                                            required
                                            value={monthlyLimit}
                                            onChange={(e) => setMonthlyLimit(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 outline-none rounded-2xl py-4 pl-10 pr-6 font-bold transition-all"
                                        />
                                    </div>
                                    <p className="mt-3 text-sm text-zinc-500 font-medium">This limit helps you track your budget on the main dashboard.</p>
                                </div>

                                <div className="mt-10 flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>

                                    {status === "success" && (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Settings saved!
                                        </div>
                                    )}

                                    {status === "error" && (
                                        <div className="flex items-center gap-2 text-red-600 font-bold animate-in fade-in slide-in-from-left-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Failed to save
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SettingsTab({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={cn(
            "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
            active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900"
        )}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}
