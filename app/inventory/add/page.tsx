"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, ChevronDown, Flame } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import {
    DECOY_SPECIES,
    DECOY_TYPES,
    CALL_SPECIES,
    GEAR_SUGGESTIONS
} from "@/lib/gearSuggestions";

export default function AddInventoryItemPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useInventory();

    // Pre-select category from URL params (e.g., /inventory/add?category=Decoy)
    const preSelectedCategory = searchParams.get('category') as InventoryCategory | null;

    // Form state
    const [category, setCategory] = useState<InventoryCategory | null>(null);
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Power Specs State
    const [specs, setSpecs] = useState<Record<string, string>>({});

    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleCategorySelect = (cat: InventoryCategory) => {
        setCategory(cat);
        setSpecs({}); // Reset specs on category change
        if (cat === "Decoy") setQuantity(12);
        else setQuantity(1);
    };

    // Auto-select category from URL param on mount
    useEffect(() => {
        if (preSelectedCategory && INVENTORY_CATEGORIES.includes(preSelectedCategory)) {
            // It's safe to call this now as it's defined before usage in this scope rendering
            // However, effects run after render so declaration order in function body matters for hoisting rules in some linters
            // eslint-disable-next-line react-hooks/exhaustive-deps
            handleCategorySelect(preSelectedCategory);
        }
    }, [preSelectedCategory]);

    // Get suggestions for current category
    const suggestions = useMemo(() => {
        if (!category) return [];
        const categorySuggestions = GEAR_SUGGESTIONS[category] || [];
        if (!name) return categorySuggestions;
        return categorySuggestions.filter(s =>
            s.toLowerCase().includes(name.toLowerCase())
        );
    }, [category, name]);

    // Handle Spec Change
    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        // Auto-generate name if empty for certain categories
        let finalName = name;
        if (!finalName) {
            if (category === "Decoy" && specs.species && specs.decoyType) {
                finalName = `${specs.species} ${specs.decoyType}s`;
            } else if (category === "Call" && specs.species) {
                finalName = `${specs.species} Call`;
            }
        }

        if (!finalName) return;

        addItem({
            id: crypto.randomUUID(),
            name: finalName,
            category,
            quantity,
            status: 'READY', // Default status
            specs: { ...specs }, // Copy specs
            createdAt: new Date(),
        });

        router.back();
    };

    const isFormValid = useMemo(() => {
        if (!category) return false;

        // Category specific requirements
        if (category === "Decoy") {
            return !!specs.species && !!specs.decoyType;
        }
        if (category === "Call") {
            return !!specs.species;
        }

        return !!name;
    }, [category, name, specs]);


    // Spec Input Renderers
    const renderSpecInput = (label: string, key: string, placeholder: string, options?: readonly string[]) => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {options ? (
                <div className="relative">
                    <select
                        value={specs[key] || ""}
                        onChange={(e) => handleSpecChange(key, e.target.value)}
                        className="input appearance-none pr-8 w-full"
                    >
                        <option value="">Select...</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            ) : (
                <input
                    type="text"
                    value={specs[key] || ""}
                    onChange={(e) => handleSpecChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="input w-full"
                />
            )}
        </div>
    );

    return (
        <div className="pb-28 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex items-center gap-4 pt-4">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Item</h1>
                    <p className="text-xs text-muted-foreground font-medium">
                        {!category ? "First, select a category" : `Adding to ${category}`}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Category Selection */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {INVENTORY_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategorySelect(cat)}
                                className={`
                                    flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all tap-highlight h-24
                                    ${category === cat
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                                        : "bg-card hover:bg-secondary border-border"
                                    }
                                `}
                            >
                                <CategoryIcon category={cat} className="h-6 w-6" />
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Details */}
                {category && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="h-px bg-border/50" />

                        {/* Name Input */}
                        {category !== "Decoy" && category !== "Call" && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground">Item Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder={`e.g., ${GEAR_SUGGESTIONS[category]?.[0] || "Item Name"}`}
                                        className="input w-full text-lg"
                                        autoComplete="off"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {suggestions.slice(0, 5).map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onMouseDown={() => {
                                                        setName(s);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Power Specs Container */}
                        <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Flame className="h-3 w-3" />
                                {category} Specs
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* FIREARM SPECS */}
                                {category === "Firearm" && (
                                    <>
                                        {renderSpecInput("Gauge / Caliber", "gauge", "12ga", ["12ga", "20ga", "28ga", ".410"])}
                                        {renderSpecInput("Action", "action", "Semi-Auto", ["Semi-Auto", "Pump", "Over/Under", "Side-by-Side"])}
                                    </>
                                )}

                                {/* AMMO SPECS */}
                                {category === "Ammo" && (
                                    <>
                                        {renderSpecInput("Gauge", "gauge", "12ga", ["12ga", "20ga", "28ga"])}
                                        {renderSpecInput("Shot Size", "shotSize", "#2", ["BB", "#1", "#2", "#3", "#4", "#6"])}
                                        {renderSpecInput("Shell Length", "shellLength", "3in", ["2 3/4in", "3in", "3 1/2in"])}
                                        {renderSpecInput("Material", "shotMaterial", "Steel", ["Steel", "Bismuth", "Tungsten", "Lead"])}
                                    </>
                                )}

                                {/* DECOY SPECS */}
                                {category === "Decoy" && (
                                    <>
                                        {renderSpecInput("Species", "species", "Mallard", DECOY_SPECIES)}
                                        {renderSpecInput("Type", "decoyType", "Floater", DECOY_TYPES)}
                                    </>
                                )}

                                {/* CALL SPECS */}
                                {category === "Call" && (
                                    <>
                                        {renderSpecInput("Species", "species", "Mallard", CALL_SPECIES)}
                                        {renderSpecInput("Type", "callType", "Single Reed", ["Single Reed", "Double Reed", "Cutdown", "Whistle", "Flute"])}
                                    </>
                                )}

                                {/* WADERS SPECS */}
                                {category === "Waders" && (
                                    <>
                                        {renderSpecInput("Insulation", "insulation", "1600g", ["Uninsulated", "600g", "1000g", "1200g", "1600g"])}
                                        {renderSpecInput("Pattern", "camoPattern", "Timber", ["Timber", "Marsh", "Solid"])}
                                    </>
                                )}

                                {/* COMMON SPECS */}
                                <div className="col-span-2">
                                    {renderSpecInput("Brand / Model", "brand", "e.g., Sitka, Benelli")}
                                </div>
                                <div className="col-span-2">
                                    {renderSpecInput("Notes", "notes", "Optional details...")}
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary font-bold text-lg"
                                >
                                    -
                                </button>
                                <div className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center font-bold text-xl">
                                    {quantity}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary font-bold text-lg"
                                >
                                    +
                                </button>
                            </div>
                            {category === "Decoy" && (
                                <div className="flex gap-2 justify-center mt-2">
                                    <button type="button" onClick={() => setQuantity(6)} className="text-xs px-3 py-1 bg-secondary rounded-full">6 (½ dz)</button>
                                    <button type="button" onClick={() => setQuantity(12)} className="text-xs px-3 py-1 bg-secondary rounded-full">12 (1 dz)</button>
                                    <button type="button" onClick={() => setQuantity(24)} className="text-xs px-3 py-1 bg-secondary rounded-full">24 (2 dz)</button>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            Save Item
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
