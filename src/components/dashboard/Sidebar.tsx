"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    History,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
    user?: { name: string; email: string } | null;
}

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Transactions", icon: History, href: "/dashboard/history" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar({ onLogout, isOpen, onClose, user }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 z-[70]",
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile visibility
                    isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Logo & Toggle */}
                    <div className="flex items-center justify-between gap-3 px-2 mb-8 h-12">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            {(!isCollapsed || isOpen) && (
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 whitespace-nowrap">
                                    VaultLite
                                </span>
                            )}
                        </div>
                        {(!isCollapsed || isOpen) && <ThemeToggle />}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => onClose()} // Close sidebar on link click on mobile
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:scale-110 transition-transform")} />
                                    {(!isCollapsed || isOpen) && <span className="font-medium">{item.label}</span>}
                                    {isActive && (!isCollapsed || isOpen) && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout & User Profile */}
                    <div className="space-y-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        {user && (!isCollapsed || isOpen) && (
                            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            {(!isCollapsed || isOpen) && <span className="font-medium">Logout</span>}
                        </button>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex items-center gap-3 px-3 py-3 w-full rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
                                <>
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="font-medium text-sm">Collapse Sidebar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
