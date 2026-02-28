"use client";

import React from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Utensils,
    Car,
    Home,
    Lightbulb,
    Film,
    HeartPulse,
    Briefcase,
    Building2,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Transaction {
    id: string;
    type: "DEBIT" | "CREDIT";
    amountFormatted: string;
    description: string;
    category: string;
    createdAt: string;
}

interface TransactionsTableProps {
    transactions: Transaction[];
    className?: string;
    onSeeAll?: () => void;
    hideSeeAll?: boolean;
    title?: string;
    noContainer?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
    Food: Utensils,
    Transport: Car,
    Housing: Home,
    Utilities: Lightbulb,
    Entertainment: Film,
    Healthcare: HeartPulse,
    Income: Briefcase,
    Deposit: Building2,
    General: CreditCard,
};

export function TransactionsTable({
    transactions,
    className,
    onSeeAll,
    hideSeeAll = false,
    title = "Recent Transactions",
    noContainer = false,
}: TransactionsTableProps) {
    return (
        <div
            className={cn(
                !noContainer && "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm",
                className
            )}
        >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                {onSeeAll && !hideSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
                    >
                        See all
                    </button>
                )}
            </div>

            <div className="overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">No transactions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {transactions.map((tx) => {
                            const Icon = CATEGORY_ICONS[tx.category] || CreditCard;
                            const isCredit = tx.type === "CREDIT";

                            return (
                                <div
                                    key={tx.id}
                                    className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110",
                                                isCredit
                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                    : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-900 dark:text-white font-bold text-sm leading-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                {tx.description}
                                            </p>
                                            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
                                                {tx.category} • {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={cn(
                                                "text-sm font-black tracking-tight",
                                                isCredit ? "text-emerald-500" : "text-zinc-900 dark:text-white"
                                            )}
                                        >
                                            {isCredit ? "+" : "-"}{tx.amountFormatted}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isCredit ? (
                                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                                            )}
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{isCredit ? "Received" : "Spent"}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
