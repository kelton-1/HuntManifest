"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TopNav() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <div>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent">
                            HuntManifest
                        </span>
                        <div className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest whitespace-nowrap">
                            Waterfowl Logistics Manager. Created By Talkin&apos; Timber
                        </div>
                    </div>
                </div>

                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="relative p-2.5 rounded-xl hover:bg-accent transition-all duration-300 border border-border/50 group"
                        aria-label="Toggle Theme"
                    >
                        <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5 text-mallard-yellow transition-transform group-hover:rotate-45 duration-300" />
                        ) : (
                            <Moon className="h-5 w-5 text-mallard-green transition-transform group-hover:-rotate-12 duration-300" />
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
