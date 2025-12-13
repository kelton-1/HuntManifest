"use client";

import { useState } from "react";
import { OnboardingScreen } from "./OnboardingScreen";
import { InventoryCategory } from "@/lib/types";
import { BRAND_DATA } from "@/lib/brands";

interface BrandSelectionScreenProps {
    onComplete: (affinities: Record<string, string[]>) => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

// Order of categories to show
const CATEGORY_ORDER: InventoryCategory[] = [
    'Firearm', 'Ammo', 'Waders', 'Clothing', 'Decoy', 'Call', 'Blind', 'Safety', 'Dog', 'Vehicle', 'Other'
];

export function BrandSelectionScreen({
    onComplete,
    onSkip,
    currentStep,
    totalSteps,
}: BrandSelectionScreenProps) {
    // Category -> [Brand1, Brand2]
    const [affinities, setAffinities] = useState<Record<string, string[]>>({});

    const toggleBrand = (category: string, brand: string) => {
        setAffinities(prev => {
            const currentBrands = prev[category] || [];
            if (currentBrands.includes(brand)) {
                // Remove
                return {
                    ...prev,
                    [category]: currentBrands.filter(b => b !== brand)
                };
            } else {
                // Add
                return {
                    ...prev,
                    [category]: [...currentBrands, brand]
                };
            }
        });
    };

    const handleFinish = () => {
        // Filter out empty categories
        const cleanedAffinities: Record<string, string[]> = {};
        Object.entries(affinities).forEach(([cat, brands]) => {
            if (brands.length > 0) {
                cleanedAffinities[cat] = brands;
            }
        });
        onComplete(cleanedAffinities);
    };

    const countSelections = () => {
        return Object.values(affinities).reduce((acc, brands) => acc + brands.length, 0);
    };

    // --- Render Helpers ---

    const renderBrandPills = (category: InventoryCategory) => {
        const data = BRAND_DATA[category];
        if (!data) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {data.brands.map(brand => {
                    const isSelected = (affinities[category] || []).includes(brand);

                    return (
                        <button
                            key={brand}
                            onClick={() => toggleBrand(category, brand)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card border-border hover:border-primary/50"
                                }`}
                        >
                            {brand}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={onSkip}
        >
            <div className="flex-1 flex flex-col px-6 pt-8 pb-4 relative h-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Build Your Locker</h1>
                    <p className="text-muted-foreground">
                        Tap the brands you own. We&apos;ll prioritize them when you add gear later.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-8 pb-24 scrollbar-hide">
                    {CATEGORY_ORDER.map(category => (
                        <div key={category}>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-1">
                                {category}
                            </h3>
                            {renderBrandPills(category)}
                            {/* Visual separator except for last item */}
                            {category !== 'Other' && <div className="mt-6 border-b border-border/40" />}
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 left-6 right-6 bg-gradient-to-t from-background via-background to-transparent pt-6">
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Continue {countSelections() > 0 ? `(${countSelections()})` : ''}
                    </button>
                </div>
            </div>
        </OnboardingScreen>
    );
}
