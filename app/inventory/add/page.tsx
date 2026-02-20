"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Check, RotateCcw, Minus, ChevronDown } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, ItemCondition, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { motion, AnimatePresence } from "framer-motion";

const CONDITIONS: ItemCondition[] = ["New", "Excellent", "Good", "Fair", "Poor"];

export default function AddInventoryItemPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useInventory();

    const [category, setCategory] = useState<InventoryCategory>("Other");
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [unitCost, setUnitCost] = useState("");
    const [condition, setCondition] = useState<ItemCondition>("New");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // Pre-select category from URL param
    useEffect(() => {
        const catParam = searchParams.get("category");
        if (catParam && INVENTORY_CATEGORIES.includes(catParam as InventoryCategory)) {
            setCategory(catParam as InventoryCategory);
            setDefaultQuantity(catParam as InventoryCategory);
        }
    }, [searchParams]);

    const setDefaultQuantity = (cat: InventoryCategory) => {
        if (cat === "Decoy") setQuantity(6);
        else setQuantity(1);
    };

    const totalValue = useMemo(() => {
        const cost = parseFloat(unitCost) || 0;
        return (cost * quantity).toFixed(2);
    }, [unitCost, quantity]);

    const handleCategorySelect = (cat: InventoryCategory) => {
        hapticLight();
        setCategory(cat);
        setDefaultQuantity(cat);
        setShowCategoryPicker(false);
    };

    const handleSave = async (addAnother: boolean) => {
        if (!name.trim()) return;
        setSaving(true);
        hapticMedium();

        const newItem = {
            id: crypto.randomUUID(),
            name: name.trim(),
            category,
            quantity,
            status: "READY" as const,
            condition,
            notes: notes.trim() || undefined,
            purchasePrice: parseFloat(unitCost) || undefined,
            specs: { brand: brand.trim() || undefined },
            createdAt: new Date(),
        };

        await addItem(newItem);
        setSaving(false);

        if (addAnother) {
            setIsAnimating(true);
            setTimeout(() => {
                setName("");
                setBrand("");
                setUnitCost("");
                setNotes("");
                setCondition("New");
                // Keep category + quantity for rapid similar-item entry
                setIsAnimating(false);
                nameInputRef.current?.focus();
            }, 200);
        } else {
            router.back();
        }
    };

    const quantityPresets = category === "Decoy"
        ? [{ v: 1, l: "1" }, { v: 6, l: "½ dz" }, { v: 12, l: "1 dz" }, { v: 24, l: "2 dz" }]
        : [{ v: 1, l: "1" }, { v: 2, l: "2" }, { v: 5, l: "5" }, { v: 10, l: "10" }];

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
                    <h1 className="font-bold text-lg">Add Gear</h1>
                    <div className="w-10 h-10" />
                </div>
            </header>

            <main className={`px-5 py-5 space-y-6 transition-opacity duration-200 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
                {/* Category Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                    <button
                        onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                        className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CategoryIcon category={category} className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-base flex-1 text-left">{category}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showCategoryPicker ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {showCategoryPicker && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    {INVENTORY_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategorySelect(cat)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                                                category === cat
                                                    ? "bg-primary/15 border border-primary/30 text-primary"
                                                    : "bg-secondary/50 border border-transparent hover:bg-secondary"
                                            }`}
                                        >
                                            <CategoryIcon category={cat} className="h-5 w-5" />
                                            <span className="text-[11px] font-semibold">{cat}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Name */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Name *</p>
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Mallard Floaters, 3-inch #2s"
                        className="w-full px-4 py-3.5 bg-secondary rounded-xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
                        autoFocus
                    />
                </motion.div>

                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brand</p>
                    <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. Avian-X, Federal, Sitka"
                        className="w-full px-4 py-3.5 bg-secondary rounded-xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
                    />
                </motion.div>

                {/* Quantity */}
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
                                onClick={() => { hapticLight(); setQuantity(Math.max(1, quantity - 1)); }}
                                className="w-12 h-12 rounded-xl bg-primary/12 text-primary flex items-center justify-center active:scale-92 transition-transform"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                                className="flex-1 bg-transparent text-center text-3xl font-bold font-mono outline-none"
                            />
                            <button
                                onClick={() => { hapticLight(); setQuantity(quantity + 1); }}
                                className="w-12 h-12 rounded-xl bg-primary/12 text-primary flex items-center justify-center active:scale-92 transition-transform"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex gap-2 justify-center mt-4 pt-4 border-t border-white/5">
                            {quantityPresets.map(({ v, l }) => (
                                <button
                                    key={v}
                                    onClick={() => { hapticLight(); setQuantity(v); }}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        quantity === v
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Cost & Condition Row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.13 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Value & Condition</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Unit Cost</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    value={unitCost}
                                    onChange={(e) => setUnitCost(e.target.value)}
                                    min={0}
                                    step={0.01}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3.5 bg-secondary rounded-xl text-sm font-mono border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Condition</label>
                            <div className="relative">
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value as ItemCondition)}
                                    className="w-full px-4 py-3.5 bg-secondary rounded-xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all appearance-none"
                                >
                                    {CONDITIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    {unitCost && parseFloat(unitCost) > 0 && quantity > 1 && (
                        <p className="text-xs text-muted-foreground text-right font-mono">
                            Total: <span className="text-primary font-bold">${totalValue}</span>
                        </p>
                    )}
                </motion.div>

                {/* Notes */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional details..."
                        rows={3}
                        className="w-full px-4 py-3.5 bg-secondary rounded-xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all resize-none"
                    />
                </motion.div>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border/40 pb-safe">
                <div className="px-5 py-4 max-w-md mx-auto space-y-2">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={!name.trim() || saving}
                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check className="h-5 w-5" />
                        Save Item
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={!name.trim() || saving}
                        className="w-full py-3 rounded-xl bg-secondary text-foreground font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Save & Add Another
                    </button>
                </div>
            </div>
        </div>
    );
}
