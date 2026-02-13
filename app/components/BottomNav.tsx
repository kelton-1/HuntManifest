"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, NotebookPen, User, Plus, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { hapticMedium, hapticLight } from "@/lib/haptics";
import { staggerContainer, staggerChild } from "@/lib/motion";

export function BottomNav() {
    const pathname = usePathname();
    const [isFabOpen, setIsFabOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    // Close FAB on route change
    useEffect(() => {
        setIsFabOpen(false);
    }, [pathname]);

    // Close FAB on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabOpen(false);
            }
        };

        if (isFabOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFabOpen]);

    const leftItems = [
        { href: "/", icon: Home, label: "Home", matchExact: true },
        { href: "/log", icon: NotebookPen, label: "Journal", matchExact: false },
    ];

    const rightItems = [
        { href: "/inventory", icon: Package, label: "Gear", matchExact: false },
        { href: "/profile", icon: User, label: "Profile", matchExact: false },
    ];

    const isActive = (href: string, matchExact: boolean) =>
        matchExact ? pathname === href : pathname.startsWith(href);

    const toggleFab = () => {
        hapticMedium();
        setIsFabOpen(!isFabOpen);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
            {/* Gradient fade for content below - visible only when nav present */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

            {/* Overlay for FAB focus */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[-1] pointer-events-auto"
                        onClick={() => setIsFabOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="relative max-w-sm mx-auto mb-5 px-5 pointer-events-auto">
                <div className="flex items-center justify-between h-[68px] glass-nav rounded-2xl px-3 relative">

                    {/* Left nav items */}
                    {leftItems.map((item) => {
                        const active = isActive(item.href, item.matchExact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => hapticLight()}
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

                    {/* Center Speed Dial FAB */}
                    <div ref={fabRef} className="relative -top-5">
                        <AnimatePresence>
                            {isFabOpen && (
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col gap-3 items-center min-w-[140px]"
                                >
                                    {/* Action 1: Plan Hunt */}
                                    <motion.div variants={staggerChild}>
                                        <Link
                                            href="/plan/new"
                                            onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-card border border-border rounded-full shadow-lg whitespace-nowrap group hover:bg-secondary transition-colors"
                                        >
                                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Plan Hunt</span>
                                            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-full">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </motion.div>

                                    {/* Action 2: Add Gear */}
                                    <motion.div variants={staggerChild}>
                                        <Link
                                            href="/inventory/add"
                                            onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-card border border-border rounded-full shadow-lg whitespace-nowrap group hover:bg-secondary transition-colors"
                                        >
                                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Add Gear</span>
                                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-full">
                                                <Package className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </motion.div>

                                    {/* Action 3: Log Hunt (Dominant) */}
                                    <motion.div variants={staggerChild}>
                                        <Link
                                            href="/log/new"
                                            onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-mallard-green text-white border border-mallard-green rounded-full shadow-lg shadow-mallard-green/20 whitespace-nowrap group hover:bg-mallard-green/90 transition-colors"
                                        >
                                            <span className="text-xs font-bold">Log Hunt</span>
                                            <div className="p-2 bg-white/20 rounded-full">
                                                <NotebookPen className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main FAB Trigger */}
                        <div className="relative">
                            <AnimatePresence>
                                {!isFabOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 -z-10 rounded-full bg-primary/20 dark:bg-primary/15 blur-md animate-glow-pulse"
                                    />
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleFab}
                                className={`relative flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-colors duration-300 ${isFabOpen
                                    ? "bg-secondary text-foreground rotate-45"
                                    : "bg-primary text-primary-foreground rotate-0"
                                    }`}
                            >
                                <Plus className={`h-6 w-6 transition-transform duration-300 ${isFabOpen ? "rotate-45" : ""}`} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Right nav items */}
                    {rightItems.map((item) => {
                        const active = isActive(item.href, item.matchExact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => hapticLight()}
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
