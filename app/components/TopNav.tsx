"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export function TopNav() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        const isScrollingDown = latest > previous;
        const isScrollingUp = latest < previous;

        // Hide on scroll down (if moved more than 150px)
        if (isScrollingDown && latest > 150) {
            setHidden(true);
        }
        // Show on scroll up
        else if (isScrollingUp) {
            setHidden(false);
        }

        // Glass effect trigger
        setScrolled(latest > 10);
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`sticky top-0 z-40 w-full transition-all duration-500 ${scrolled
                ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60"
                : "bg-transparent border-b border-transparent"
                }`}
        >
            <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <img src="/logo.png" alt="HuntManifest" className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110" />
                    <div className={`transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent">
                            HuntManifest
                        </span>
                        {/* Hide subtitle on scroll to save visual noise */}
                        <div className={`text-[8px] text-muted-foreground font-medium uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-500 ${scrolled ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                            Waterfowl Logistics Manager
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="relative p-2 rounded-full hover:bg-accent/50 transition-all duration-300 border border-transparent hover:border-border/50 group overflow-hidden"
                            aria-label="Toggle Theme"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={theme}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-5 w-5 text-mallard-yellow" />
                                    ) : (
                                        <Moon className="h-5 w-5 text-mallard-green" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    )}

                    <Link
                        href="/profile"
                        className={`relative p-2 rounded-full hover:bg-accent/50 transition-all duration-300 border border-transparent hover:border-border/50 ${pathname === "/profile" ? "text-primary bg-accent/30" : "text-muted-foreground"}`}
                        aria-label="Profile"
                    >
                        <User className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
