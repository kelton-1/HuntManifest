"use client";

import { useState } from "react";
import { Check, Minus, Plus, ChevronRight } from "lucide-react";
import { OnboardingScreen } from "./OnboardingScreen";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { InventoryCategory } from "@/lib/types";

interface GearItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
}

const ESSENTIAL_GEAR: Omit<GearItem, "quantity">[] = [
    { id: "1", name: "Shotgun", category: "Firearm" },
    { id: "2", name: "Waders", category: "Clothing" },
    { id: "3", name: "Decoys", category: "Decoy" },
    { id: "4", name: "Duck Call", category: "Call" },
    { id: "5", name: "Headlamp", category: "Safety" },
    { id: "6", name: "License/Stamps", category: "Other" },
];

interface GearSetupScreenProps {
    onComplete: (selectedGear: GearItem[]) => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

export function GearSetupScreen({
    onComplete,
    onSkip,
    currentStep,
    totalSteps,
}: GearSetupScreenProps) {
    // Track quantities for each gear item (0 = don't own)
    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        ESSENTIAL_GEAR.forEach((g) => (initial[g.id] = 0));
        return initial;
    });

    const updateQuantity = (id: string, delta: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, Math.min(99, (prev[id] || 0) + delta)),
        }));
    };

    const toggleItem = (id: string) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: prev[id] > 0 ? 0 : 1,
        }));
    };

    const selectedCount = Object.values(quantities).filter((q) => q > 0).length;

    const handleFinish = () => {
        const selectedGear: GearItem[] = ESSENTIAL_GEAR
            .filter((g) => quantities[g.id] > 0)
            .map((g) => ({
                ...g,
                quantity: quantities[g.id],
            }));
        onComplete(selectedGear);
    };

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={() => onComplete([])}
        >
            <div className="flex-1 flex flex-col px-6 pt-12 pb-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">
                        Build Your Locker
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Select gear you own and adjust quantities
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="mb-4">
                    <p className="text-xs text-muted-foreground text-center">
                        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
                    </p>
                </div>

                {/* Gear List */}
                <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <div className="space-y-2">
                        {ESSENTIAL_GEAR.map((item) => {
                            const qty = quantities[item.id] || 0;
                            const isSelected = qty > 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-card hover:border-muted-foreground/50"
                                        }`}
                                >
                                    {/* Checkbox/Icon */}
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-muted-foreground"
                                            }`}
                                    >
                                        {isSelected ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <CategoryIcon
                                                category={item.category}
                                                className="h-5 w-5"
                                            />
                                        )}
                                    </button>

                                    {/* Name */}
                                    <div className="flex-1" onClick={() => toggleItem(item.id)}>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.category}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    {isSelected && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-lg">
                                                {qty}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="mt-4 pt-4 border-t border-border">
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-mallard-green to-mallard-green-light text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        {selectedCount > 0 ? (
                            <>Continue with {selectedCount} Item{selectedCount !== 1 ? "s" : ""}</>
                        ) : (
                            <>Skip for Now</>
                        )}
                    </button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        You can always add more gear later
                    </p>
                </div>
            </div>
        </OnboardingScreen>
    );
}
