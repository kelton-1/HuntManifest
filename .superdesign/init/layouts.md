# Layout Components

All pages share a single root layout (`app/layout.tsx`) with `TopNav` (sticky header) and `BottomNav` (floating bottom tab bar). The `AppWrapper` gates content behind onboarding.

---

## Root Layout

**Path:** `app/layout.tsx`
**Description:** Wraps all pages with ThemeProvider, AuthProvider, AppWrapper, TopNav, BottomNav.

```tsx
import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { BottomNav } from "./components/BottomNav";
import { TopNav } from "./components/TopNav";
import { AppWrapper } from "./components/AppWrapper";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HuntManifest | Waterfowl Logistics",
  description: "Logistics for Waterfowl. Track hunts, manage gear inventory, and log success.",
  keywords: ["waterfowl", "duck hunting", "hunt tracker", "hunting log", "gear inventory", "logistics"],
  authors: [{ name: "HuntManifest" }],
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HuntManifest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppWrapper>
              <div className="min-h-screen flex flex-col relative">
                {/* Mesh gradient ambient layer — dark mode only */}
                <div
                  className="hidden dark:block fixed inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background: `
                      radial-gradient(ellipse 60% 50% at 10% 20%, rgba(22, 102, 83, 0.06) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 85% 75%, rgba(245, 184, 0, 0.04) 0%, transparent 70%),
                      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(30, 58, 95, 0.08) 0%, transparent 60%)
                    `,
                    zIndex: 0,
                  }}
                />
                <TopNav />
                <main className="flex-1 pb-24 pt-4 px-4 max-w-md mx-auto w-full relative z-[1]">
                  {children}
                </main>
                <BottomNav />
              </div>
            </AppWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## TopNav (Sticky Header)

**Path:** `app/components/TopNav.tsx`
**Description:** Auto-hiding sticky header with logo, app title, and theme toggle. Applies glassmorphism on scroll.

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export function TopNav() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { scrollY } = useScroll();

    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        const isScrollingDown = latest > previous;
        const isScrollingUp = latest < previous;

        if (isScrollingDown && latest > 150) {
            setHidden(true);
        } else if (isScrollingUp) {
            setHidden(false);
        }

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
                </div>
            </div>
        </motion.header>
    );
}
```

---

## BottomNav (Floating Tab Bar)

**Path:** `app/components/BottomNav.tsx`
**Description:** Fixed-bottom floating glassmorphism nav bar with 4 tabs (Home, Journal, Gear, Profile) and a center FAB speed dial (Log Hunt, Add Gear, Plan Hunt).

```tsx
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

    useEffect(() => {
        setIsFabOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabOpen(false);
            }
        };
        if (isFabOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [isFabOpen]);

    const leftItems = [
        { href: "/", icon: Home, label: "Home", matchExact: true },
        { href: "/log", icon: NotebookPen, label: "Journal", matchExact: false },
    ];

    const rightItems = [
        { href: "/inventory", icon: Package, label: "Gear", matchExact: false },
        { href: "/profile", icon: User, label: "Profile", matchExact: false },
    ];

    const isActive = (href: string, matchExact: boolean) => {
        if (matchExact) return pathname === href || (href === "/" && pathname === "/insights");
        return pathname.startsWith(href);
    };

    const toggleFab = () => {
        hapticMedium();
        setIsFabOpen(!isFabOpen);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

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
                                <item.icon className="relative h-5 w-5 transition-all duration-300" strokeWidth={active ? 2.5 : 1.5} />
                                <span className={`relative text-[10px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-70"}`}>
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
                                    <motion.div variants={staggerChild}>
                                        <Link href="/plan/new" onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-card border border-border rounded-full shadow-lg whitespace-nowrap group hover:bg-secondary transition-colors">
                                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Plan Hunt</span>
                                            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-full"><Calendar className="h-4 w-4" /></div>
                                        </Link>
                                    </motion.div>
                                    <motion.div variants={staggerChild}>
                                        <Link href="/inventory/add" onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-card border border-border rounded-full shadow-lg whitespace-nowrap group hover:bg-secondary transition-colors">
                                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Add Gear</span>
                                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-full"><Package className="h-4 w-4" /></div>
                                        </Link>
                                    </motion.div>
                                    <motion.div variants={staggerChild}>
                                        <Link href="/log/new" onClick={() => setIsFabOpen(false)}
                                            className="flex items-center gap-3 pl-4 pr-2 py-2 bg-mallard-green text-white border border-mallard-green rounded-full shadow-lg shadow-mallard-green/20 whitespace-nowrap group hover:bg-mallard-green/90 transition-colors">
                                            <span className="text-xs font-bold">Log Hunt</span>
                                            <div className="p-2 bg-white/20 rounded-full"><NotebookPen className="h-4 w-4" /></div>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                <item.icon className="relative h-5 w-5 transition-all duration-300" strokeWidth={active ? 2.5 : 1.5} />
                                <span className={`relative text-[10px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-70"}`}>
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
```
