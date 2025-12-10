"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Plus, RotateCcw, Package
} from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { InventoryAuditCard } from "@/app/components/inventory/InventoryAuditCard";

export default function InventoryPage() {
    const {
        inventory,
        toggleStatus,
        setItemStatus,
        deleteItem,
        resetPostHunt,
        seedInventory
    } = useInventory();

    // Sort inventory: Missing first, then by Category, then Name
    const sortedInventory = [...inventory].sort((a, b) => {
        // Prioritize MISSING
        if (a.status === 'MISSING' && b.status !== 'MISSING') return -1;
        if (a.status !== 'MISSING' && b.status === 'MISSING') return 1;

        // Then by Category index
        const catA = INVENTORY_CATEGORIES.indexOf(a.category);
        const catB = INVENTORY_CATEGORIES.indexOf(b.category);
        if (catA !== catB) return catA - catB;

        // Then by Name
        return a.name.localeCompare(b.name);
    });

    const categories = INVENTORY_CATEGORIES.filter(cat =>
        sortedInventory.some(item => item.category === cat)
    );

    const groupedInventory = categories.reduce((acc, category) => {
        acc[category] = sortedInventory.filter((item) => item.category === category);
        return acc;
    }, {} as Record<InventoryCategory, typeof inventory>);

    const packedCount = inventory.filter(item => item.status === 'PACKED').length;
    const missingCount = inventory.filter(item => item.status === 'MISSING').length;

    return (
        <div className="pb-20 animate-fade-in relative min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2 pb-4 mb-2 border-b border-border/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent uppercase tracking-tight">
                            Gear Audit
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            {inventory.length} items • {packedCount} packed
                            {missingCount > 0 && <span className="text-destructive font-bold ml-2">• {missingCount} MISSING</span>}
                        </p>
                    </div>

                    {/* Add Button */}
                    <Link
                        href="/inventory/add"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                    </Link>
                </div>

                {/* Reset Action */}
                {(packedCount > 0 || missingCount > 0) && (
                    <button
                        onClick={() => {
                            if (confirm("Reset all PACKED items to READY? (Missing items will remain missing)")) {
                                resetPostHunt();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-secondary/50 hover:bg-secondary text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Post-Hunt Reset
                    </button>
                )}
            </header>

            {/* Empty State / Cold Start */}
            {inventory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-slide-up">
                    <div className="p-6 bg-mallard-green/10 rounded-full mb-6 relative">
                        <div className="absolute inset-0 animate-ping opacity-20 bg-mallard-green rounded-full"></div>
                        <Package className="h-12 w-12 text-mallard-green" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Build Your Loadout</h2>
                    <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Start with our pro-curated Master Inventory list, then swipe left to remove what you don't use.
                    </p>
                    <button
                        onClick={() => seedInventory()}
                        className="w-full max-w-sm py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all text-center"
                    >
                        Load Master Inventory
                    </button>
                    <p className="mt-6 text-xs text-muted-foreground">
                        Or <Link href="/inventory/add" className="underline hover:text-primary">add items manually</Link>
                    </p>
                </div>
            )}

            {/* Inventory List */}
            <div className="space-y-6">
                {categories.map((category) => {
                    const items = groupedInventory[category];
                    if (!items || items.length === 0) return null;

                    return (
                        <section key={category} className="space-y-1">
                            {/* Category Header */}
                            <div className="flex items-center gap-2 px-2 py-1 mb-1">
                                <CategoryIcon category={category} className="h-4 w-4 text-primary/70" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                                    {category}
                                </h3>
                            </div>

                            {/* Items */}
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <InventoryAuditCard
                                        key={item.id}
                                        item={item}
                                        onToggleStatus={(id, status) => toggleStatus(id, status)}
                                        onSetMissing={(id) => setItemStatus(id, 'MISSING')}
                                        onDelete={(id) => deleteItem(id)}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
