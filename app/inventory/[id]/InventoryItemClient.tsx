"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Pencil, Copy, Trash2, Check } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { motion } from "framer-motion";

export default function InventoryItemDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { inventory, updateItem, deleteItem, addItem } = useInventory();

    const id = params.id as string;
    const item = inventory.find((i) => i.id === id);

    const [quantity, setQuantity] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const currentQty = quantity ?? item?.quantity ?? 0;
    const hasQtyChanged = quantity !== null && item && quantity !== item.quantity;

    const handleSaveQuantity = useCallback(async () => {
        if (!item || quantity === null) return;
        setSaving(true);
        hapticMedium();
        await updateItem({ ...item, quantity, updatedAt: new Date() });
        setQuantity(null);
        setSaving(false);
    }, [item, quantity, updateItem]);

    const handleDuplicate = useCallback(async () => {
        if (!item) return;
        hapticLight();
        const dup = {
            ...item,
            id: crypto.randomUUID(),
            name: `${item.name} (copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await addItem(dup);
        router.push(`/inventory/${dup.id}`);
    }, [item, addItem, router]);

    const handleDelete = useCallback(() => {
        if (!item) return;
        if (confirm(`Permanently delete ${item.name}? This cannot be undone.`)) {
            hapticMedium();
            deleteItem(item.id);
            router.replace("/inventory");
        }
    }, [item, deleteItem, router]);

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
                <p>Item not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    const totalValue = (item.purchasePrice || 0) * currentQty;
    const costPerUnit = item.purchasePrice || 0;
    const createdDate = item.createdAt
        ? new Date(item.createdAt instanceof Date ? item.createdAt : item.createdAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;
    const updatedDate = item.updatedAt
        ? new Date(item.updatedAt instanceof Date ? item.updatedAt : item.updatedAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-background pb-32 animate-fade-in">
            {/* Header */}
            <header className="pt-2 px-5 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <button
                        onClick={() => router.back()}
                        className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-lg truncate">{item.name}</h1>
                        <p className="text-xs text-muted-foreground">{item.specs?.brand || item.category}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CategoryIcon category={item.category} className="h-5 w-5 text-primary" />
                    </div>
                </motion.div>
            </header>

            <main className="px-5 pb-8 space-y-6">
                {/* Info Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Category</p>
                        <div className="flex items-center gap-2">
                            <CategoryIcon category={item.category} className="h-4 w-4 text-primary" />
                            <p className="font-bold text-sm">{item.category}</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Total Value</p>
                        <p className="font-bold font-mono text-sm text-primary">
                            {totalValue > 0 ? `$${totalValue.toFixed(2)}` : "—"}
                        </p>
                    </div>
                </motion.div>

                {/* Quantity Stepper */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</p>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => { hapticLight(); setQuantity(Math.max(0, currentQty - 1)); }}
                                className="w-[52px] h-[52px] rounded-[0.875rem] bg-primary/12 text-primary flex items-center justify-center font-bold active:scale-92 transition-transform"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <div className="flex-1 text-center">
                                <input
                                    type="number"
                                    value={currentQty}
                                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                    min={0}
                                    className="w-full bg-transparent text-center text-4xl font-bold font-mono outline-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">units</p>
                            </div>
                            <button
                                onClick={() => { hapticLight(); setQuantity(currentQty + 1); }}
                                className="w-[52px] h-[52px] rounded-[0.875rem] bg-primary/12 text-primary flex items-center justify-center font-bold active:scale-92 transition-transform"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-4 pt-4 border-t border-white/5">
                            Tap +/− or type to update quantity
                        </p>
                    </div>
                </motion.div>

                {/* Item Details */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Details</p>
                    <div className="glass-card rounded-2xl divide-y divide-white/5">
                        {item.specs?.brand && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Brand</span>
                                <span className="text-sm font-medium">{item.specs.brand}</span>
                            </div>
                        )}
                        {costPerUnit > 0 && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Cost per unit</span>
                                <span className="text-sm font-medium font-mono">${costPerUnit.toFixed(2)}</span>
                            </div>
                        )}
                        {item.condition && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Condition</span>
                                <span className="text-sm font-medium">{item.condition}</span>
                            </div>
                        )}
                        {createdDate && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Date added</span>
                                <span className="text-sm font-medium">{createdDate}</span>
                            </div>
                        )}
                        {updatedDate && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Last updated</span>
                                <span className="text-sm font-medium">{updatedDate}</span>
                            </div>
                        )}
                        {item.notes && (
                            <div className="p-4">
                                <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                                <p className="text-sm leading-relaxed">{item.notes}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href={`/inventory/edit/${item.id}`}
                            className="py-3.5 rounded-xl bg-secondary text-foreground font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={handleDuplicate}
                            className="py-3.5 rounded-xl bg-secondary text-foreground font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </button>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Item
                    </button>
                </motion.div>
            </main>

            {/* Fixed Bottom Save Button */}
            {hasQtyChanged && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border/40 pb-safe"
                >
                    <div className="px-5 py-4 max-w-md mx-auto">
                        <button
                            onClick={handleSaveQuantity}
                            disabled={saving}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Check className="h-5 w-5" />
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
