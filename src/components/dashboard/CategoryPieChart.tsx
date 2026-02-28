"use client";

import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    type: "DEBIT" | "CREDIT";
    amountKobo: number;
    category: string;
}

interface CategoryPieChartProps {
    transactions: Transaction[];
    className?: string;
}

const COLORS = [
    "#6366f1", // Indigo
    "#3b82f6", // Blue
    "#0ea5e9", // Sky
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#10b981", // Emerald
    "#a855f7", // Purple
    "#ec4899", // Pink
];

export function CategoryPieChart({
    transactions,
    className,
}: CategoryPieChartProps) {
    const data = useMemo(() => {
        const categories: Record<string, number> = {};

        // Only include DEBIT transactions
        transactions
            .filter((tx) => tx.type === "DEBIT")
            .forEach((tx) => {
                categories[tx.category] = (categories[tx.category] || 0) + tx.amountKobo;
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value: value / 100 })) // Convert kobo to currency units
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 h-[400px] flex items-center justify-center", className)}>
                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">No spending data available</p>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 h-[400px] shadow-sm", className)}>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Spending by Category</h3>
            <div className="h-full">
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: "1rem",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(4px)"
                            }}
                            formatter={(value: number | string | any) => `₦${value.toLocaleString()}`}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: "20px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
