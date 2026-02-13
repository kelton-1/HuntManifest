"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Check, RotateCcw, Package } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";

export default function AddInventoryItemPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useInventory();

    // State
    const [step, setStep] = useState<"category" | "details">("category");
    const [category, setCategory] = useState<InventoryCategory | null>(null);
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    // Check for pre-selected category in URL
    useEffect(() => {
        const catParam = searchParams.get("category");
        if (catParam && INVENTORY_CATEGORIES.includes(catParam as InventoryCategory)) {
            setCategory(catParam as InventoryCategory);
            setDefaultQuantity(catParam as InventoryCategory);
            setStep("details");
        }
    }, [searchParams]);

    // Refs for focus management
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Helpers
    const setDefaultQuantity = (cat: InventoryCategory) => {
        if (cat === "Decoy") setQuantity(6);
        else if (cat === "Ammo") setQuantity(1); // 1 box
        else setQuantity(1);
    };

    const handleCategorySelect = (cat: InventoryCategory) => {
        setCategory(cat);
        setDefaultQuantity(cat);
        setStep("details");
        // Focus usually needs a slight tick to allow render
        setTimeout(() => nameInputRef.current?.focus(), 100);
    };

    const handleSave = (addAnother: boolean) => {
        if (!name.trim() || !category) return;

        const newItem = {
            id: crypto.randomUUID(),
            name: name.trim(),
            category: category,
            quantity: quantity,
            status: "READY" as const,
            specs: {}, // Can start empty, edit later if needed
            createdAt: new Date(),
        };

        addItem(newItem);

        if (addAnother) {
            // Reset for next entry
            setIsAnimating(true);
            setTimeout(() => {
                setName("");
                // Keep category and quantity logic? Or reset?
                // Usually better to keep category for rapid entry of similar items
                setIsAnimating(false);
                nameInputRef.current?.focus();
            }, 300);
        } else {
            router.back();
        }
    };

    // Render Logic
    return (
        <div className="min-h-screen bg-background pb-safe animate-fade-in max-w-lg mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => step === "details" ? setStep("category") : router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold leading-none">Add Gear</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {step === "category" ? "Select Category" : `Adding to ${category}`}
                    </p>
                </div>
            </header>

            <main className="p-4">
                {/* STEP 1: CATEGORY SELECTION */}
                {step === "category" && (
                    <div className="grid grid-cols-2 gap-3 animate-slide-up">
                        {INVENTORY_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/50 transition-all group"
                            >
                                <div className="p-3 rounded-full bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <CategoryIcon category={cat} className="h-6 w-6" />
                                </div>
                                <span className="font-semibold text-sm">{cat}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 2: DETAILS */}
                {step === "details" && category && (
                    <div className={`space-y-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Item Name
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Mallard Floaters / 3-inch #2s"
                                className="w-full bg-transparent text-2xl font-bold placeholder:text-muted-foreground/30 focus:outline-none border-b-2 border-border focus:border-primary py-2 transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Quantity
                            </label>

                            {/* Number Stepper */}
                            <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-2 border border-border/50">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm hover:scale-95 transition-transform"
                                >
                                    <span className="text-2xl font-medium">-</span>
                                </button>
                                <div className="flex-1 text-center font-bold text-3xl tabular-nums">
                                    {quantity}
                                </div>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-12 w-12 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm hover:scale-95 transition-transform"
                                >
                                    <Plus className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Smart Presets */}
                            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                                {category === "Decoy" ? (
                                    <>
                                        {[1, 6, 12, 24].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setQuantity(q)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${quantity === q ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                                            >
                                                {q} {q === 6 ? '(½ dz)' : q === 12 ? '(1 dz)' : q === 24 ? '(2 dz)' : ''}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[1, 2, 5, 10].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setQuantity(q)}
                                                className={`w-10 h-8 rounded-full text-xs font-bold transition-colors ${quantity === q ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-6">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={!name}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Check className="h-5 w-5" />
                                    <span>Save Item</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSave(true)}
                                disabled={!name}
                                className="w-full py-3 bg-secondary text-foreground rounded-2xl font-bold text-sm hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    <span>Save & Add Another</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
