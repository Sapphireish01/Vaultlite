"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
    iconClassName?: string;
}

export function StatsCard({
    label,
    value,
    icon: Icon,
    trend,
    className,
    iconClassName,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2 uppercase tracking-tight">{label}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</h3>

                    {trend && (
                        <div className="mt-3 flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                    trend.isPositive
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                )}
                            >
                                {trend.isPositive ? "+" : "-"}{trend.value}
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-medium uppercase">vs last month</span>
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        "p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors",
                        iconClassName
                    )}
                >
                    <Icon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
            </div>
        </div>
    );
}
