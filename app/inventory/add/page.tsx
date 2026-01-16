"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown, Plus, Minus } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { SmartInput } from "@/app/components/inventory/SmartInput";
import { ParsedProduct } from "@/lib/services/ProductIntelligenceEngine";
import { CATEGORY_SCHEMAS } from "@/lib/schemas/categoryAttributes";

export default function AddInventoryItemPage() {
    const router = useRouter();
    const { addItem } = useInventory();

    // Form state - populated by SmartInput
    const [parsedProduct, setParsedProduct] = useState<ParsedProduct | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [editableSpecs, setEditableSpecs] = useState<Record<string, string>>({});
    const [showManualEntry, setShowManualEntry] = useState(false);

    // Manual entry fallback state
    const [manualName, setManualName] = useState("");
    const [manualCategory, setManualCategory] = useState<InventoryCategory | null>(null);

    // Handle SmartInput result
    const handleProductResult = useCallback((result: ParsedProduct) => {
        setParsedProduct(result);
        setEditableSpecs(result.attributes as Record<string, string>);

        // Set quantity defaults by category
        if (result.category === 'Decoy') {
            setQuantity(12);
        } else if (result.category === 'Ammo') {
            setQuantity(1); // boxes
        } else {
            setQuantity(1);
        }
    }, []);

    // Handle partial result for preview
    const handlePartialResult = useCallback((result: Partial<ParsedProduct>) => {
        // Could show preview card here
    }, []);

    // Handle spec change
    const handleSpecChange = (key: string, value: string) => {
        setEditableSpecs(prev => ({ ...prev, [key]: value }));
    };

    // Handle form submission
    const handleSubmit = () => {
        const name = parsedProduct?.name || manualName;
        const category = parsedProduct?.category || manualCategory;

        if (!name || !category) {
            return;
        }

        addItem({
            id: crypto.randomUUID(),
            name,
            category,
            quantity,
            status: 'READY',
            specs: {
                brand: parsedProduct?.brand,
                model: parsedProduct?.model,
                ...editableSpecs,
            },
            createdAt: new Date(),
        });

        router.back();
    };

    // Get optional fields for current category
    const getOptionalFields = (category: InventoryCategory | null) => {
        if (!category) return [];
        return CATEGORY_SCHEMAS[category]?.optionalFields || [];
    };

    // Render spec input field
    const renderSpecField = (key: string, options?: string[]) => {
        const value = editableSpecs[key] || '';

        return (
            <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {options ? (
                    <div className="relative">
                        <select
                            value={value}
                            onChange={(e) => handleSpecChange(key, e.target.value)}
                            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary pr-8"
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
                        value={value}
                        onChange={(e) => handleSpecChange(key, e.target.value)}
                        className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={`Enter ${key}`}
                    />
                )}
            </div>
        );
    };

    const isFormValid = parsedProduct?.name || (manualName && manualCategory);

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
                    <h1 className="text-2xl font-bold tracking-tight">Add</h1>
                    <p className="text-xs text-muted-foreground font-medium">
                        {parsedProduct?.category ? `Adding ${parsedProduct.category}` : 'Scan, paste, or type'}
                    </p>
                </div>
            </header>

            {/* Smart Input - Primary interface */}
            {!parsedProduct && !showManualEntry && (
                <div className="space-y-6">
                    <SmartInput
                        onResult={handleProductResult}
                        onPartialResult={handlePartialResult}
                        onClear={() => setParsedProduct(null)}
                        placeholder="What are you adding?"
                    />

                    {/* Manual entry fallback */}
                    <button
                        type="button"
                        onClick={() => setShowManualEntry(true)}
                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                        Enter manually instead →
                    </button>
                </div>
            )}

            {/* Manual Entry Mode */}
            {showManualEntry && !parsedProduct && (
                <div className="space-y-6 animate-slide-up">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">Category</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {INVENTORY_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setManualCategory(cat)}
                                    className={`
                                        flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all
                                        ${manualCategory === cat
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                            : "bg-card hover:bg-secondary border-border"
                                        }
                                    `}
                                >
                                    <CategoryIcon category={cat} className="h-5 w-5" />
                                    <span>{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Input */}
                    {manualCategory && (
                        <div className="space-y-2 animate-slide-up">
                            <label className="text-sm font-bold text-foreground">Item Name</label>
                            <input
                                type="text"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="Enter item name"
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowManualEntry(false)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to smart input
                    </button>
                </div>
            )}

            {/* Result Form - After SmartInput finds a product */}
            {parsedProduct && (
                <div className="space-y-6 animate-slide-up">
                    {/* Product Header Card */}
                    <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CategoryIcon category={parsedProduct.category} className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-lg">{parsedProduct.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {parsedProduct.brand && `${parsedProduct.brand} • `}{parsedProduct.category}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setParsedProduct(null)}
                                className="text-xs text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg hover:bg-secondary"
                            >
                                Change
                            </button>
                        </div>
                    </div>

                    {/* Auto-Extracted Specs */}
                    {Object.keys(parsedProduct.attributes).length > 0 && (
                        <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Detected Specs
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(parsedProduct.attributes).map(([key, value]) => (
                                    <div key={key} className="bg-card rounded-xl px-3 py-2.5 border border-border/50">
                                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                        <p className="text-sm font-medium">{String(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Specs Form */}
                    {getOptionalFields(parsedProduct.category).filter(f => !(parsedProduct.attributes as Record<string, unknown>)[f]).length > 0 && (
                        <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Additional Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {getOptionalFields(parsedProduct.category)
                                    .filter(f => !(parsedProduct.attributes as Record<string, unknown>)[f])
                                    .map(field => renderSpecField(field))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Quantity</label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary font-bold text-lg"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center font-bold text-xl">
                                {quantity}
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary font-bold text-lg"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        {parsedProduct.category === "Decoy" && (
                            <div className="flex gap-2 justify-center mt-2">
                                <button type="button" onClick={() => setQuantity(6)} className="text-xs px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80">6 (½ dz)</button>
                                <button type="button" onClick={() => setQuantity(12)} className="text-xs px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80">12 (1 dz)</button>
                                <button type="button" onClick={() => setQuantity(24)} className="text-xs px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80">24 (2 dz)</button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        Add to Inventory
                    </button>
                </div>
            )}

            {/* Manual Entry Submit */}
            {showManualEntry && manualName && manualCategory && (
                <div className="mt-6 space-y-4 animate-slide-up">
                    {/* Quantity for manual */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Quantity</label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center font-bold text-xl">
                                {quantity}
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all text-lg flex items-center justify-center gap-2"
                    >
                        <Save className="h-5 w-5" />
                        Add to Inventory
                    </button>
                </div>
            )}
        </div>
    );
}
