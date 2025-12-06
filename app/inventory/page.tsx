"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Plus, Trash2, CheckCircle2, Circle, Package, Sparkles
} from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";

export default function InventoryPage() {
    const { inventory, deleteItem, toggleChecked, resetChecks } = useInventory();
    const [isCheckMode, setIsCheckMode] = useState(false);

    const categories: InventoryCategory[] = [
        "Firearm",
        "Ammo",
        "Decoy",
        "Call",
        "Clothing",
        "Blind",
        "Safety",
        "Dog",
        "Vehicle",
        "Other",
    ];

    const groupedInventory = categories.reduce((acc, category) => {
        acc[category] = inventory.filter((item) => item.category === category);
        return acc;
    }, {} as Record<InventoryCategory, typeof inventory>);

    const checkedCount = inventory.filter(item => item.isChecked).length;
    const totalCount = inventory.length;
    const checkProgress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

    return (
        <div className="pb-8 animate-fade-in">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent uppercase tracking-tight">
                        Gear Locker
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {inventory.length} items ready
                    </p>
                </div>
                <Link
                    href="/inventory/add"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-mallard-green to-mallard-green-light text-white shadow-lg transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add Item</span>
                </Link>
            </header>

            {/* Pre-Hunt Check Card */}
            <div className="mb-6 rounded-2xl bg-card p-5 shadow-md border border-border overflow-hidden relative">
                {/* Decorative background */}
                {isCheckMode && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                )}

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-colors ${isCheckMode
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                            }`}>
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">Pre-Hunt Check</h2>
                            <p className="text-xs text-muted-foreground font-medium">
                                {isCheckMode
                                    ? `${checkedCount} of ${totalCount} packed`
                                    : "Verify everything is packed"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (isCheckMode) resetChecks();
                            setIsCheckMode(!isCheckMode);
                        }}
                        className={`rounded-xl px-4 py-2.5 text-sm font-bold tracking-wide transition-all tap-highlight ${isCheckMode
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                    >
                        {isCheckMode ? "End Check" : "Start Check"}
                    </button>
                </div>

                {/* Progress Bar */}
                {isCheckMode && (
                    <div className="relative mt-4 pt-4 border-t border-border">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${checkProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
                            {checkProgress === 100
                                ? "✓ All gear packed! Ready to hunt!"
                                : `${Math.round(checkProgress)}% complete`}
                        </p>
                    </div>
                )}
            </div>

            {/* Inventory List */}
            <div className="space-y-6">
                {categories.map((category) => {
                    const items = groupedInventory[category];
                    if (items.length === 0) return null;

                    return (
                        <section key={category} className="space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-primary/80">
                                    <CategoryIcon category={category} className="h-5 w-5" />
                                </span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    {category}
                                </h3>
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground font-mono">{items.length}</span>
                            </div>
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`
                                            flex items-center justify-between rounded-xl border p-4 transition-all duration-200 animate-slide-up
                                            ${isCheckMode && item.isChecked
                                                ? "bg-primary/10 border-primary/50 shadow-sm"
                                                : "bg-card border-border"
                                            } 
                                            ${isCheckMode ? "cursor-pointer tap-highlight" : ""}
                                        `}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => isCheckMode && toggleChecked(item.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isCheckMode ? (
                                                <div className={`flex-shrink-0 transition-colors ${item.isChecked ? "text-primary" : "text-muted-foreground"
                                                    }`}>
                                                    {item.isChecked
                                                        ? <CheckCircle2 className="h-6 w-6" />
                                                        : <Circle className="h-6 w-6" />
                                                    }
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                                                    <CategoryIcon category={item.category} className="h-5 w-5" />
                                                </div>
                                            )}

                                            <div>
                                                <p className={`font-semibold text-sm transition-all ${isCheckMode && item.isChecked
                                                    ? "line-through text-muted-foreground"
                                                    : ""
                                                    }`}>
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity}
                                                    {item.brand && ` • ${item.brand}`}
                                                </p>
                                            </div>
                                        </div>

                                        {!isCheckMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Delete this item?")) deleteItem(item.id);
                                                }}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {inventory.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex p-5 bg-secondary rounded-full mb-4">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Your locker is empty</h3>
                        <p className="text-sm text-muted-foreground px-8">
                            Add firearms, decoys, calls, and other gear to start tracking your inventory.
                        </p>
                        <Link
                            href="/inventory/add"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Plus className="h-4 w-4" />
                            Add First Item
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
