"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Package, Layers, Calculator, Trophy, Star, TrendingUp } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { motion } from "framer-motion";
import { ScrollRevealItem } from "@/app/components/StaggerAnimation";

interface CategoryStats {
    category: InventoryCategory;
    itemCount: number;
    totalQty: number;
    totalValue: number;
}

export default function InventorySummaryPage() {
    const router = useRouter();
    const { inventory } = useInventory();

    const stats = useMemo(() => {
        const categoryMap = new Map<InventoryCategory, CategoryStats>();

        for (const item of inventory) {
            const existing = categoryMap.get(item.category);
            const itemValue = (item.purchasePrice || 0) * item.quantity;

            if (existing) {
                existing.itemCount += 1;
                existing.totalQty += item.quantity;
                existing.totalValue += itemValue;
            } else {
                categoryMap.set(item.category, {
                    category: item.category,
                    itemCount: 1,
                    totalQty: item.quantity,
                    totalValue: itemValue,
                });
            }
        }

        const categories = Array.from(categoryMap.values()).sort((a, b) => b.totalValue - a.totalValue);
        const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);
        const totalItems = inventory.length;
        const totalCategories = categories.length;
        const avgPerItem = totalItems > 0 ? totalValue / totalItems : 0;

        const topCategory = categories[0] || null;
        const mostValuable = [...inventory].sort((a, b) =>
            ((b.purchasePrice || 0) * b.quantity) - ((a.purchasePrice || 0) * a.quantity)
        )[0] || null;
        const mostValuableValue = mostValuable ? (mostValuable.purchasePrice || 0) * mostValuable.quantity : 0;

        return { categories, totalValue, totalItems, totalCategories, avgPerItem, topCategory, mostValuable, mostValuableValue };
    }, [inventory]);

    const maxCategoryValue = stats.categories.length > 0 ? stats.categories[0].totalValue : 1;

    const barColors = [
        "bg-primary",
        "bg-mallard-green-light",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-sky-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-pink-500",
    ];

    return (
        <div className="min-h-screen bg-background pb-8 animate-fade-in">
            {/* Header */}
            <header className="pt-2 px-5 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h1 className="font-bold text-xl">Inventory Summary</h1>
                        </div>
                        <p className="text-xs text-muted-foreground">Analytics & value breakdown</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="px-5 space-y-5">
                {/* Total Value Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Inventory Value</p>
                        {stats.totalValue > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-mallard-green/20">
                                <TrendingUp className="h-3 w-3 text-mallard-green-light" />
                                <span className="text-[10px] font-bold text-mallard-green-light">Tracked</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-end gap-1 mb-4">
                        <span className="font-bold text-4xl text-primary font-mono">
                            ${Math.floor(stats.totalValue).toLocaleString()}
                        </span>
                        <span className="text-lg text-muted-foreground mb-0.5">
                            .{(stats.totalValue % 1).toFixed(2).slice(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{stats.totalItems}</p>
                                <p className="text-[10px] text-muted-foreground">Items</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Layers className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{stats.totalCategories}</p>
                                <p className="text-[10px] text-muted-foreground">Categories</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calculator className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">${Math.round(stats.avgPerItem)}</p>
                                <p className="text-[10px] text-muted-foreground">Avg/Item</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass-card rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Top Category</span>
                        </div>
                        <p className="font-bold text-lg">{stats.topCategory?.category || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                            {stats.topCategory ? `$${stats.topCategory.totalValue.toFixed(0)} • ${stats.topCategory.itemCount} items` : "No data"}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Most Valuable</span>
                        </div>
                        <p className="font-bold text-lg truncate">{stats.mostValuable?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                            {stats.mostValuable ? `$${stats.mostValuableValue.toFixed(0)} • ${stats.mostValuable.category}` : "No data"}
                        </p>
                    </motion.div>
                </div>

                {/* Category Breakdown Chart */}
                {stats.categories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category Breakdown</p>
                            <span className="text-[10px] font-mono text-muted-foreground">By Value</span>
                        </div>
                        <div className="flex items-end gap-2 h-32 mb-2">
                            {stats.categories.map((cat, i) => {
                                const height = maxCategoryValue > 0
                                    ? Math.max(8, (cat.totalValue / maxCategoryValue) * 100)
                                    : 8;
                                return (
                                    <div key={cat.category} className="flex-1 flex flex-col items-center gap-1">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.2 + i * 0.05 }}
                                            className={`w-full rounded-t-md ${barColors[i % barColors.length]}`}
                                        />
                                        <span className="text-[9px] text-muted-foreground truncate max-w-full">{cat.category}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Detailed Category List */}
                {stats.categories.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Category Details</p>
                        {stats.categories.map((cat, index) => {
                            const pct = stats.totalValue > 0 ? (cat.totalValue / stats.totalValue) * 100 : 0;
                            return (
                                <ScrollRevealItem key={cat.category} index={index}>
                                    <div className="glass-card rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                                                <CategoryIcon category={cat.category} className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-sm">{cat.category}</p>
                                                    <p className="font-mono font-bold text-sm text-primary">${cat.totalValue.toFixed(0)}</p>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">{cat.itemCount} item{cat.itemCount !== 1 ? "s" : ""} &middot; {cat.totalQty} total qty</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                                                className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-2 text-right">{pct.toFixed(1)}% of total</p>
                                    </div>
                                </ScrollRevealItem>
                            );
                        })}
                    </div>
                )}

                {inventory.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-5 bg-primary/10 rounded-2xl mb-4">
                            <BarChart3 className="h-10 w-10 text-primary" />
                        </div>
                        <p className="font-semibold text-lg">No Inventory Data</p>
                        <p className="text-sm text-muted-foreground mt-1">Add items to see analytics here</p>
                    </div>
                )}
            </main>
        </div>
    );
}
