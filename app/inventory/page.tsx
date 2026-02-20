"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ChevronRight, Package, BarChart3, LayoutGrid, List } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryItem, InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { ScrollRevealItem } from "@/app/components/StaggerAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { hapticLight } from "@/lib/haptics";

type ViewMode = "list" | "category";

interface CategoryGroup {
    category: InventoryCategory;
    items: InventoryItem[];
    totalQty: number;
    totalValue: number;
}

const STATUS_CONFIG = {
    READY: { label: "Ready", color: "bg-emerald-500", textColor: "text-emerald-500" },
    PACKED: { label: "Packed", color: "bg-amber-500", textColor: "text-amber-500" },
    MISSING: { label: "Missing", color: "bg-red-500", textColor: "text-red-500" },
} as const;

export default function InventoryPage() {
    const { inventory, seedInventory, addItem } = useInventory();
    const [activeCategory, setActiveCategory] = useState<InventoryCategory | "all">("all");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [showSamplePreview, setShowSamplePreview] = useState(false);

    const categoryGroups = useMemo(() => {
        const groups: CategoryGroup[] = [];
        const map = new Map<InventoryCategory, InventoryItem[]>();

        for (const item of inventory) {
            const existing = map.get(item.category) || [];
            existing.push(item);
            map.set(item.category, existing);
        }

        for (const [category, items] of map) {
            const totalQty = items.reduce((s, i) => s + i.quantity, 0);
            const totalValue = items.reduce((s, i) => s + (i.purchasePrice || 0) * i.quantity, 0);
            groups.push({ category, items, totalQty, totalValue });
        }

        groups.sort((a, b) => b.totalValue - a.totalValue || b.items.length - a.items.length);
        return groups;
    }, [inventory]);

    const filteredGroups = useMemo(() => {
        if (activeCategory === "all") return categoryGroups;
        return categoryGroups.filter((g) => g.category === activeCategory);
    }, [categoryGroups, activeCategory]);

    const filteredItems = useMemo(() => {
        const items = activeCategory === "all" ? inventory : inventory.filter((i) => i.category === activeCategory);
        // Sort: MISSING first, then PACKED, then READY, then alphabetical
        return [...items].sort((a, b) => {
            const statusOrder = { MISSING: 0, PACKED: 1, READY: 2 };
            const diff = statusOrder[a.status] - statusOrder[b.status];
            if (diff !== 0) return diff;
            return a.name.localeCompare(b.name);
        });
    }, [inventory, activeCategory]);

    const totalValue = useMemo(() =>
        inventory.reduce((s, i) => s + (i.purchasePrice || 0) * i.quantity, 0),
        [inventory]
    );

    const activeCategories = useMemo(() =>
        INVENTORY_CATEGORIES.filter((cat) => inventory.some((i) => i.category === cat)),
        [inventory]
    );

    const statusCounts = useMemo(() => {
        const counts = { READY: 0, PACKED: 0, MISSING: 0 };
        for (const item of inventory) {
            counts[item.status] = (counts[item.status] || 0) + 1;
        }
        return counts;
    }, [inventory]);

    const SAMPLE_ITEMS: Partial<InventoryItem>[] = [
        { name: "Mallard Drake Decoys", category: "Decoy", quantity: 12, status: "READY", specs: { brand: "Avian-X" } },
        { name: "Double Reed Duck Call", category: "Call", quantity: 1, status: "READY", specs: { brand: "Zink" } },
        { name: "Insulated Waders", category: "Waders", quantity: 1, status: "READY", specs: { brand: "Sitka" } },
        { name: "12ga Steel #2", category: "Ammo", quantity: 4, status: "READY", specs: { brand: "Federal" } },
        { name: "Layout Blind", category: "Blind", quantity: 2, status: "READY", specs: { brand: "Avery" } },
    ];

    const loadSampleItems = () => {
        SAMPLE_ITEMS.forEach((item, index) => {
            setTimeout(() => addItem(item as InventoryItem), index * 50);
        });
        setShowSamplePreview(false);
    };

    return (
        <div className="pb-24 animate-fade-in relative min-h-screen bg-background">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md pt-2 pb-3 border-b border-border/50">
                <div className="px-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-2xl font-bold">Inventory</h1>
                            <p className="text-xs text-muted-foreground">
                                {inventory.length} items &middot; {activeCategories.length} categories
                                {totalValue > 0 && <> &middot; <span className="text-primary font-mono">${totalValue.toFixed(0)}</span></>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/inventory/summary"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                                aria-label="Summary"
                            >
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link
                                href="/inventory/add"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Link>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <Link
                        href="/inventory/search"
                        className="relative flex items-center gap-3 w-full pl-4 pr-4 py-2.5 bg-secondary rounded-xl text-sm text-muted-foreground"
                    >
                        <Search className="h-4 w-4" />
                        Search inventory...
                    </Link>

                    {/* Status Summary Pills */}
                    {inventory.length > 0 && (statusCounts.PACKED > 0 || statusCounts.MISSING > 0) && (
                        <div className="flex gap-2 mt-3">
                            {statusCounts.READY > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500">{statusCounts.READY} Ready</span>
                                </div>
                            )}
                            {statusCounts.PACKED > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-500">{statusCounts.PACKED} Packed</span>
                                </div>
                            )}
                            {statusCounts.MISSING > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-bold text-red-500">{statusCounts.MISSING} Missing</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Pills + View Toggle */}
                    {inventory.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 pb-1">
                                <button
                                    onClick={() => setActiveCategory("all")}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        activeCategory === "all"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    }`}
                                >
                                    All ({inventory.length})
                                </button>
                                {activeCategories.map((cat) => {
                                    const count = inventory.filter((i) => i.category === cat).length;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                activeCategory === cat
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                            }`}
                                        >
                                            <CategoryIcon category={cat} className="h-3 w-3" />
                                            {cat} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                            {/* View Toggle */}
                            <div className="flex rounded-lg bg-secondary p-0.5 shrink-0">
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                    aria-label="List view"
                                >
                                    <List className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("category")}
                                    className={`p-1.5 rounded-md transition-colors ${viewMode === "category" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                    aria-label="Category view"
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Empty State */}
            {inventory.length === 0 && !showSamplePreview && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-slide-up">
                    <div className="p-6 bg-mallard-green/10 rounded-full mb-6 relative">
                        <div className="absolute inset-0 animate-ping opacity-20 bg-mallard-green rounded-full" />
                        <Package className="h-12 w-12 text-mallard-green" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Build Your Loadout</h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                        Get started with our pro-curated list or add your own items.
                    </p>
                    <div className="w-full max-w-sm space-y-3">
                        <button
                            onClick={() => seedInventory()}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Load Master Gear List
                        </button>
                        <button
                            onClick={() => setShowSamplePreview(true)}
                            className="w-full py-3 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-all"
                        >
                            Preview What It Looks Like
                        </button>
                        <Link
                            href="/inventory/add"
                            className="block w-full py-3 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Or add items manually →
                        </Link>
                    </div>
                </div>
            )}

            {/* Sample Preview Banner */}
            {showSamplePreview && (
                <div className="mx-4 mt-4 p-3 bg-mallard-yellow/10 border border-mallard-yellow/30 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Preview Mode</p>
                            <p className="text-xs text-muted-foreground">Showing sample inventory</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSamplePreview(false)} className="px-3 py-1.5 text-xs font-medium bg-secondary rounded-lg">Close</button>
                            <button onClick={loadSampleItems} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg">Use These Items</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════ LIST VIEW (DEFAULT) ════════════════════════════ */}
            {inventory.length > 0 && viewMode === "list" && (
                <div className="p-4 space-y-2">
                    {filteredItems.map((item, index) => {
                        const status = STATUS_CONFIG[item.status];
                        return (
                            <ScrollRevealItem key={item.id} index={index}>
                                <Link
                                    href={`/inventory/detail?id=${item.id}`}
                                    className="glass-card rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-all"
                                >
                                    <div className="relative w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <CategoryIcon category={item.category} className="h-4 w-4 text-primary" />
                                        {/* Status dot */}
                                        <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${status.color} ring-2 ring-card`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{item.name}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {item.specs?.brand ? `${item.specs.brand} · ` : ""}{item.category}
                                            {item.status !== "READY" && (
                                                <span className={`ml-1.5 ${status.textColor} font-semibold`}>· {status.label}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold font-mono text-sm">{item.quantity}</p>
                                        {item.purchasePrice != null && item.purchasePrice > 0 && (
                                            <p className="text-[10px] text-muted-foreground font-mono">${(item.purchasePrice * item.quantity).toFixed(0)}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                </Link>
                            </ScrollRevealItem>
                        );
                    })}

                    {/* Add Item Link */}
                    <ScrollRevealItem index={filteredItems.length}>
                        <Link
                            href={activeCategory !== "all" ? `/inventory/add?category=${activeCategory}` : "/inventory/add"}
                            className="flex items-center gap-3 p-3 border-2 border-dashed border-border/60 rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Plus className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold">Add Item</span>
                        </Link>
                    </ScrollRevealItem>
                </div>
            )}

            {/* ════════════════════════════ CATEGORY VIEW ════════════════════════════ */}
            {inventory.length > 0 && viewMode === "category" && (
                <div className="p-4 space-y-3">
                    {filteredGroups.map((group, index) => (
                        <ScrollRevealItem key={group.category} index={index}>
                            <div className="glass-card rounded-2xl overflow-hidden">
                                {/* Category Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <CategoryIcon category={group.category} className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-base">{group.category}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {group.items.length} item{group.items.length !== 1 ? "s" : ""} &middot; {group.totalQty} total
                                            {group.totalValue > 0 && <> &middot; <span className="font-mono">${group.totalValue.toFixed(0)}</span></>}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Items in category */}
                                <div className="border-t border-white/5">
                                    {group.items.map((item) => {
                                        const status = STATUS_CONFIG[item.status];
                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/inventory/detail?id=${item.id}`}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] last:border-b-0"
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.color} shrink-0`} />
                                                <span className="text-sm truncate flex-1">{item.name}</span>
                                                {item.specs?.brand && (
                                                    <span className="text-[10px] text-muted-foreground shrink-0">{item.specs.brand}</span>
                                                )}
                                                <span className="text-xs font-mono text-muted-foreground shrink-0">×{item.quantity}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </ScrollRevealItem>
                    ))}

                    {/* Add New Card */}
                    <ScrollRevealItem index={filteredGroups.length}>
                        <Link
                            href={activeCategory !== "all" ? `/inventory/add?category=${activeCategory}` : "/inventory/add"}
                            className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border/60 rounded-2xl text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/8 transition-all"
                        >
                            <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/8">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold">Add Item</span>
                        </Link>
                    </ScrollRevealItem>
                </div>
            )}
        </div>
    );
}
