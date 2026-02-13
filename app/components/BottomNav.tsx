"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, NotebookPen, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Home, label: "Home", matchExact: true },
        { href: "/inventory", icon: Package, label: "Gear", matchExact: false },
    ];

    const rightItems = [
        { href: "/insights", icon: BarChart3, label: "Insights", matchExact: false },
    ];

    const isActive = (href: string, matchExact: boolean) =>
        matchExact ? pathname === href : pathname.startsWith(href);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Gradient fade for content below */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

            <div className="relative max-w-sm mx-auto mb-5 px-5">
                <div className="flex items-center justify-between h-[68px] glass-nav rounded-2xl px-3">

                    {/* Left nav items */}
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.matchExact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="navActiveBackground"
                                        className="absolute inset-0 bg-primary/10 dark:bg-primary/8 rounded-xl"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={`relative h-5 w-5 transition-all duration-300 ${active ? "fill-current scale-110" : ""
                                        }`}
                                />
                                <span className={`relative text-[10px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-70"
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Center FAB — Log Hunt */}
                    <Link
                        href="/log/new"
                        className="relative -top-5 group"
                    >
                        <div className="relative">
                            {/* Glow ring behind the FAB */}
                            <div className="absolute -inset-1.5 rounded-full bg-primary/20 dark:bg-primary/15 blur-md group-hover:bg-primary/30 transition-all duration-500" />
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg"
                            >
                                <NotebookPen className="h-6 w-6" />
                            </motion.div>
                        </div>
                    </Link>

                    {/* Right nav items */}
                    {rightItems.map((item) => {
                        const active = isActive(item.href, item.matchExact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="navActiveBackground"
                                        className="absolute inset-0 bg-primary/10 dark:bg-primary/8 rounded-xl"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    className={`relative h-5 w-5 transition-all duration-300 ${active ? "fill-current scale-110" : ""
                                        }`}
                                />
                                <span className={`relative text-[10px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-70"
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                </div>
            </div>
        </nav>
    );
}
