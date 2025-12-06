"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, NotebookPen, Package, User } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Gear", href: "/inventory", icon: Package },
        { name: "Log", href: "/log", icon: NotebookPen },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pb-safe">
            <div className="max-w-md mx-auto">
                <div className="flex h-16 items-center justify-around px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    relative flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 px-3 rounded-xl transition-all duration-300
                                    ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                                `}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                                )}

                                {/* Glow effect for active */}
                                {isActive && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-lg"
                                        style={{ boxShadow: '0 0 12px var(--primary)' }} />
                                )}

                                <Icon
                                    className={`relative h-5 w-5 transition-all duration-300 ${isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.5px]"
                                        }`}
                                />
                                <span className={`relative text-[10px] font-medium transition-all duration-300 ${isActive ? "font-semibold" : ""
                                    }`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
