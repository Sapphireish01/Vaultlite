"use client";

import React from "react";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    balance: string;
    monthlySpent: string;
    monthlyLimit: string;
    spentPercentage: number;
    isNearLimit: boolean;
    className?: string;
}

export function BalanceCard({
    balance,
    monthlySpent,
    monthlyLimit,
    spentPercentage,
    isNearLimit,
    className,
}: BalanceCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl transition-all duration-300",
                "bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500",
                className
            )}
        >
            {/* Decorative background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">Total Balance</p>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">{balance}</h2>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                        <p className="text-blue-100/70 text-xs font-medium mb-1 uppercase tracking-wider">Monthly Spent</p>
                        <p className="text-lg font-bold">{monthlySpent}</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                        <p className="text-blue-100/70 text-xs font-medium mb-1 uppercase tracking-wider">Monthly Limit</p>
                        <p className="text-lg font-bold">{monthlyLimit}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-blue-100">Spending Progress</span>
                        <span className="text-sm font-bold">{Math.round(spentPercentage)}%</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out",
                                isNearLimit ? "bg-orange-400" : "bg-emerald-400"
                            )}
                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                        />
                    </div>
                    {isNearLimit && (
                        <div className="flex items-center gap-2 text-orange-200 text-xs font-semibold bg-orange-500/20 px-3 py-1.5 rounded-lg w-fit">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Approaching monthly limit</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
