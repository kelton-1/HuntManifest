"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, NotebookPen, BarChart3 } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Gradient fade for content below */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />

            <div className="relative max-w-sm mx-auto mb-6 px-6">
                <div className="flex items-center justify-between h-16 bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-4 supports-[backdrop-filter]:bg-background/60">

                    {/* Home */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors ${pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Home className={`h-5 w-5 ${pathname === "/" ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>

                    {/* Gear (Inventory) */}
                    <Link
                        href="/inventory"
                        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors ${pathname.startsWith("/inventory") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Package className={`h-5 w-5 ${pathname.startsWith("/inventory") ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-medium">Gear</span>
                    </Link>

                    {/* Log FAB (center) */}
                    <Link
                        href="/log/new"
                        className="relative -top-5"
                    >
                        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform">
                            <NotebookPen className="h-6 w-6" />
                        </div>
                    </Link>

                    {/* Insights */}
                    <Link
                        href="/insights"
                        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors ${pathname.startsWith("/insights") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <BarChart3 className={`h-5 w-5 ${pathname.startsWith("/insights") ? "fill-current" : ""}`} />
                        <span className="text-[10px] font-medium">Insights</span>
                    </Link>

                </div>
            </div>
        </nav>
    );
}
