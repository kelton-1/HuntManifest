"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Plus, X, Package, NotebookPen, Map, Calendar } from "lucide-react";
import { useState } from "react";

export function BottomNav() {
    const pathname = usePathname();
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

    const toggleActionSheet = () => setIsActionSheetOpen(!isActionSheetOpen);

    return (
        <>
            {/* Action Sheet Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isActionSheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsActionSheetOpen(false)}
            />

            {/* Action Sheet Menu */}
            <div
                className={`fixed bottom-24 left-4 right-4 z-50 transition-all duration-300 transform ${isActionSheetOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"}`}
            >
                <div className="bg-card border border-border rounded-3xl shadow-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</span>
                        <button onClick={() => setIsActionSheetOpen(false)} className="p-1 hover:bg-secondary rounded-full">
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    <Link
                        href="/plan"
                        onClick={() => setIsActionSheetOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                        <div className="p-2 bg-mallard-green/10 rounded-xl">
                            <Map className="h-5 w-5 text-mallard-green" />
                        </div>
                        <div>
                            <span className="block font-bold">Plan a Hunt</span>
                            <span className="text-xs text-muted-foreground">Prepare gear & check conditions</span>
                        </div>
                    </Link>

                    <Link
                        href="/log/new"
                        onClick={() => setIsActionSheetOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <NotebookPen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <span className="block font-bold">Record Hunt</span>
                            <span className="text-xs text-muted-foreground">Log harvest & outcome</span>
                        </div>
                    </Link>

                    <Link
                        href="/inventory/add"
                        onClick={() => setIsActionSheetOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                        <div className="p-2 bg-mallard-yellow/10 rounded-xl">
                            <Package className="h-5 w-5 text-mallard-yellow" />
                        </div>
                        <div>
                            <span className="block font-bold">+ Inventory</span>
                            <span className="text-xs text-muted-foreground">Add to your inventory</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Bottom Dock */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
                {/* Gradient fade for content below */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />

                <div className="relative max-w-sm mx-auto mb-6 px-6">
                    <div className="flex items-center justify-between h-16 bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-6 supports-[backdrop-filter]:bg-background/60">

                        {/* Home Link */}
                        <Link
                            href="/"
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <Home className={`h-6 w-6 ${pathname === "/" ? "fill-current" : ""}`} />
                        </Link>

                        {/* FAB Interaction */}
                        <div className="relative -top-6">
                            <button
                                onClick={toggleActionSheet}
                                className={`
                                    flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-transform duration-300
                                    ${isActionSheetOpen ? "bg-muted text-foreground rotate-45" : "bg-primary text-primary-foreground hover:scale-110"}
                                `}
                            >
                                <Plus className="h-7 w-7" />
                            </button>
                        </div>

                        {/* Profile Link */}
                        <Link
                            href="/profile"
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            <User className={`h-6 w-6 ${pathname === "/profile" ? "fill-current" : ""}`} />
                        </Link>

                    </div>
                </div>
            </nav>
        </>
    );
}
