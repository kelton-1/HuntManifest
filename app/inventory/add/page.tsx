"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import {
    DECOY_SPECIES,
    DECOY_TYPES,
    DECOY_QUANTITY_PRESETS,
    CALL_SPECIES,
    GEAR_SUGGESTIONS
} from "@/lib/gearSuggestions";

export default function AddInventoryItemPage() {
    const router = useRouter();
    const { addItem } = useInventory();

    // Form state
    const [category, setCategory] = useState<InventoryCategory | null>(null);
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Category-specific state
    const [species, setSpecies] = useState("");
    const [decoyType, setDecoyType] = useState("");

    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    // Get suggestions for current category
    const suggestions = useMemo(() => {
        if (!category) return [];
        const categorySuggestions = GEAR_SUGGESTIONS[category] || [];
        if (!name) return categorySuggestions;
        return categorySuggestions.filter(s =>
            s.toLowerCase().includes(name.toLowerCase())
        );
    }, [category, name]);

    const handleCategorySelect = (cat: InventoryCategory) => {
        setCategory(cat);
        // Reset category-specific fields
        setSpecies("");
        setDecoyType("");
        // Set default quantity based on category
        if (cat === "Decoy") {
            setQuantity(12); // Default to 1 dozen
        } else {
            setQuantity(1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !category) return;

        addItem({
            id: crypto.randomUUID(),
            name,
            category,
            brand: brand || undefined,
            quantity,
            species: species || undefined,
            decoyType: decoyType || undefined,
            isChecked: false,
        });

        router.back();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setName(suggestion);
        setShowSuggestions(false);
    };

    const handleQuantityPreset = (value: number) => {
        setQuantity(value);
    };

    return (
        <div className="pb-28 animate-fade-in">
            {/* Header */}
            <header className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">Add New Gear</h1>
                    <p className="text-xs text-muted-foreground">
                        {!category ? "Choose a category" : `Adding ${category}`}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Category Selection (always visible) */}
                <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                        Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategorySelect(cat)}
                                className={`
                                    flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all tap-highlight
                                    ${category === cat
                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                        : "bg-card hover:bg-secondary border-border"
                                    }
                                `}
                            >
                                <span className="text-base">
                                    <CategoryIcon category={cat} className="h-5 w-5" />
                                </span>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Item Details (shown after category selected) */}
                {category && (
                    <>
                        {/* Item Name with Suggestions */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                                Item Name <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder={`e.g., ${GEAR_SUGGESTIONS[category]?.[0] || "Item name"}`}
                                    required
                                    className="input"
                                    autoComplete="off"
                                />
                                {/* Autocomplete Suggestions */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {suggestions.slice(0, 6).map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Fields for Decoy */}
                        {category === "Decoy" && (
                            <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Decoy Details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Species */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="species" className="text-xs font-medium text-muted-foreground">Species</label>
                                        <div className="relative">
                                            <select
                                                id="species"
                                                value={species}
                                                onChange={(e) => setSpecies(e.target.value)}
                                                className="input appearance-none pr-8"
                                            >
                                                <option value="">Select...</option>
                                                {DECOY_SPECIES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    {/* Type */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="decoyType" className="text-xs font-medium text-muted-foreground">Type</label>
                                        <div className="relative">
                                            <select
                                                id="decoyType"
                                                value={decoyType}
                                                onChange={(e) => setDecoyType(e.target.value)}
                                                className="input appearance-none pr-8"
                                            >
                                                <option value="">Select...</option>
                                                {DECOY_TYPES.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Fields for Call */}
                        {category === "Call" && (
                            <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call Details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Species */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="callSpecies" className="text-xs font-medium text-muted-foreground">Species</label>
                                        <div className="relative">
                                            <select
                                                id="callSpecies"
                                                value={species}
                                                onChange={(e) => setSpecies(e.target.value)}
                                                className="input appearance-none pr-8"
                                            >
                                                <option value="">Select...</option>
                                                {CALL_SPECIES.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    {/* Brand */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="callBrand" className="text-xs font-medium text-muted-foreground">Brand</label>
                                        <input
                                            id="callBrand"
                                            type="text"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            placeholder="e.g., RNT"
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Brand & Quantity (for non-Call categories, Call has brand in dynamic section) */}
                        <div className={`grid gap-4 ${category === "Call" ? "grid-cols-1" : "grid-cols-2"}`}>
                            {category !== "Call" && (
                                <div className="space-y-2">
                                    <label htmlFor="brand" className="text-sm font-medium">
                                        Brand (Optional)
                                    </label>
                                    <input
                                        id="brand"
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="e.g., Avian-X"
                                        className="input"
                                    />
                                </div>
                            )}

                            <div className={`space-y-2 ${category === "Call" ? "max-w-xs" : ""}`}>
                                <label htmlFor="quantity" className="text-sm font-medium">
                                    Quantity
                                </label>
                                <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 hover:bg-secondary transition-colors font-bold text-lg"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        id="quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full text-center bg-transparent border-none focus:ring-0 p-0 font-bold text-lg"
                                        min="1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-3 hover:bg-secondary transition-colors font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Quick Presets for Decoys */}
                                {category === "Decoy" && (
                                    <div className="flex gap-2 mt-2">
                                        {DECOY_QUANTITY_PRESETS.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => handleQuantityPreset(preset.value)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${quantity === preset.value
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Card */}
                        {name && (
                            <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                                        <CategoryIcon category={category} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty: {quantity}
                                            {brand && ` • ${brand}`}
                                            {species && ` • ${species}`}
                                            {decoyType && ` ${decoyType}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!name || !category}
                    className="fixed bottom-24 right-4 left-4 max-w-md mx-auto h-14 rounded-xl bg-gradient-to-r from-mallard-green to-mallard-green-light text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all tap-highlight disabled:opacity-50 disabled:cursor-not-allowed md:static md:w-full"
                >
                    <Save className="h-5 w-5" />
                    Save Item
                </button>
            </form>
        </div>
    );
}
