"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2, Check } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, ItemCondition, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { motion } from "framer-motion";

const CONDITIONS: ItemCondition[] = ["New", "Excellent", "Good", "Fair", "Poor"];

export default function EditItemClient() {
    const params = useParams();
    const router = useRouter();
    const { inventory, updateItem, deleteItem } = useInventory();

    const id = params.id as string;
    const item = inventory.find((i) => i.id === id);

    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState<InventoryCategory>("Other");
    const [quantity, setQuantity] = useState(1);
    const [unitCost, setUnitCost] = useState("");
    const [condition, setCondition] = useState<ItemCondition>("Good");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setBrand(item.specs?.brand || "");
            setCategory(item.category);
            setQuantity(item.quantity);
            setUnitCost(item.purchasePrice ? String(item.purchasePrice) : "");
            setCondition(item.condition || "Good");
            setNotes(item.notes || "");
        }
    }, [item]);

    const totalValue = useMemo(() => {
        const cost = parseFloat(unitCost) || 0;
        return (cost * quantity).toFixed(2);
    }, [unitCost, quantity]);

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

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        hapticMedium();

        const updated = {
            ...item,
            name: name.trim(),
            category,
            quantity,
            condition,
            notes: notes.trim() || undefined,
            purchasePrice: parseFloat(unitCost) || undefined,
            specs: { ...item.specs, brand: brand.trim() || undefined },
            updatedAt: new Date(),
        };

        await updateItem(updated);
        router.push(`/inventory/${id}`);
    };

    const handleDelete = () => {
        if (confirm(`Permanently delete ${item.name}? This cannot be undone.`)) {
            hapticMedium();
            deleteItem(item.id);
            router.replace("/inventory");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/40">
                <div className="flex items-center justify-between px-5 py-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 -ml-2 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-bold text-lg">Edit Item</h1>
                    <div className="w-10 h-10" />
                </div>
            </header>

            <main className="px-5 py-5 space-y-6">
                {/* Item Preview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-4 flex items-center gap-4"
                >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CategoryIcon category={category} className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate">{name || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{brand || "No brand"} &middot; {category}</p>
                    </div>
                </motion.div>

                {/* Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-4"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Basic Information</p>

                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Item Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="Item name"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Brand</label>
                        <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="input-field"
                            placeholder="Brand name"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Category *</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                            className="input-field appearance-none bg-secondary"
                        >
                            {INVENTORY_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
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
                                onClick={() => { hapticLight(); setQuantity(Math.max(0, quantity - 1)); }}
                                className="w-12 h-12 rounded-xl bg-primary/12 text-primary flex items-center justify-center text-xl font-bold active:scale-92 transition-transform"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                min={0}
                                className="flex-1 bg-transparent text-center text-3xl font-bold font-mono outline-none"
                            />
                            <button
                                onClick={() => { hapticLight(); setQuantity(quantity + 1); }}
                                className="w-12 h-12 rounded-xl bg-primary/12 text-primary flex items-center justify-center text-xl font-bold active:scale-92 transition-transform"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-3">Tap +/− or type to update</p>
                    </div>
                </motion.div>

                {/* Value & Cost */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-4"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Value & Cost</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Unit Cost</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                <input
                                    type="number"
                                    value={unitCost}
                                    onChange={(e) => setUnitCost(e.target.value)}
                                    min={0}
                                    step={0.01}
                                    className="input-field pl-8 font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Total Value</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 font-bold">$</span>
                                <input
                                    type="text"
                                    value={totalValue}
                                    disabled
                                    className="input-field pl-8 font-mono bg-white/3 text-muted-foreground"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Notes & Details */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes & Details</p>

                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Condition</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as ItemCondition)}
                            className="input-field appearance-none bg-secondary"
                        >
                            {CONDITIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes..."
                            className="input-field resize-none h-24"
                        />
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/80">Danger Zone</p>
                    <button
                        onClick={handleDelete}
                        className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 border border-red-500/20"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Item
                    </button>
                </motion.div>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border/40 pb-safe">
                <div className="px-5 py-4 flex gap-3 max-w-md mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground font-bold text-sm active:scale-[0.98] transition-transform"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || saving}
                        className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
