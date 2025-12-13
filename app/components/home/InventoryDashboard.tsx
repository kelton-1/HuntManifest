"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, Plus } from "lucide-react";
import { InventoryItem, InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";

interface InventoryDashboardProps {
    inventory: InventoryItem[];
}

type ViewMode = "all" | InventoryCategory;

export function InventoryDashboard({ inventory }: InventoryDashboardProps) {
    const [activeView, setActiveView] = useState<ViewMode>("all");

    // Get counts per category
    const categoryCounts = INVENTORY_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = inventory.filter(item => item.category === cat).length;
        return acc;
    }, {} as Record<InventoryCategory, number>);

    // Get active categories (ones with items)
    const activeCategories = INVENTORY_CATEGORIES.filter(cat => categoryCounts[cat] > 0);

    // Filter items based on view
    const filteredItems = activeView === "all"
        ? inventory
        : inventory.filter(item => item.category === activeView);

    // Get display count
    const displayCount = activeView === "all" ? inventory.length : filteredItems.length;

    return (
        <section className="space-y-3">
            {/* Header with link */}
            <Link
                href="/inventory"
                className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-mallard-yellow/10 via-mallard-yellow/5 to-transparent border border-mallard-yellow/20 shadow-sm card-hover"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-mallard-yellow/15 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-6 w-6 text-mallard-yellow" />
                    </div>
                    <div>
                        <span className="font-bold text-base block">Inventory</span>
                        <span className="text-xs text-muted-foreground">
                            {displayCount} {activeView === "all" ? "items" : activeView.toLowerCase()} tracked
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-secondary text-[10px] font-bold px-2.5 py-1 rounded-full text-muted-foreground">
                        Manage
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
            </Link>

            {/* Category Toggle Pills */}
            {activeCategories.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => setActiveView("all")}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${activeView === "all"
                            ? "bg-mallard-yellow text-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                    >
                        All ({inventory.length})
                    </button>
                    {activeCategories.slice(0, 5).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveView(cat)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeView === cat
                                ? "bg-mallard-yellow text-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                }`}
                        >
                            <CategoryIcon category={cat} className="h-3 w-3" />
                            {categoryCounts[cat]}
                        </button>
                    ))}
                </div>
            )}

            {/* Quick Preview Cards */}
            {filteredItems.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {filteredItems.slice(0, 4).map(item => (
                        <Link
                            key={item.id}
                            href={`/inventory`}
                            className="flex-shrink-0 w-28 p-3 bg-card border border-border rounded-xl shadow-sm hover:bg-secondary/50 transition-colors"
                        >
                            <div className="flex items-center justify-center mb-2">
                                <CategoryIcon category={item.category} className="h-5 w-5 text-mallard-yellow" />
                            </div>
                            <p className="text-xs font-medium text-center truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground text-center">
                                Qty: {item.quantity}
                            </p>
                        </Link>
                    ))}

                    {/* Add new quick action - pass category if filtered */}
                    <Link
                        href={activeView !== "all" ? `/inventory/add?category=${activeView}` : "/inventory/add"}
                        className="flex-shrink-0 w-20 p-3 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Add</span>
                    </Link>
                </div>
            )}

            {/* Empty state */}
            {inventory.length === 0 && (
                <Link
                    href="/inventory"
                    className="block p-6 bg-card/50 border-2 border-dashed border-border rounded-xl text-center hover:bg-card transition-colors"
                >
                    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Start your inventory</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tap to add items</p>
                </Link>
            )}
        </section>
    );
}
