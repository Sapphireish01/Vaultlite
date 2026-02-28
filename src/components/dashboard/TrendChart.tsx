"use client";

import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    type: "DEBIT" | "CREDIT";
    amountKobo: number;
    createdAt: string;
}

interface TrendChartProps {
    transactions: Transaction[];
    className?: string;
}

export function TrendChart({
    transactions,
    className,
}: TrendChartProps) {
    const data = useMemo(() => {
        const dailyData: Record<string, { date: string; income: number; expense: number }> = {};

        // Sort transactions by date (oldest first) for the chart
        const sortedTxs = [...transactions].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sortedTxs.forEach((tx) => {
            const date = new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
            if (!dailyData[date]) {
                dailyData[date] = { date, income: 0, expense: 0 };
            }

            if (tx.type === "CREDIT") {
                dailyData[date].income += tx.amountKobo / 100;
            } else {
                dailyData[date].expense += tx.amountKobo / 100;
            }
        });

        return Object.values(dailyData);
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 h-[400px] flex items-center justify-center", className)}>
                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">No transaction history available</p>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 h-[400px] shadow-sm", className)}>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Income vs Expenses</h3>
            <div className="h-full">
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "1rem",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(4px)"
                            }}
                            cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" />
                        <Bar
                            name="Income"
                            dataKey="income"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Bar
                            name="Expenses"
                            dataKey="expense"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
