"use client";

import { useState } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { OnboardingScreen } from "./OnboardingScreen";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { InventoryCategory } from "@/lib/types";

interface GearItem {
    id: string;
    name: string;
    category: InventoryCategory;
}

const ESSENTIAL_GEAR: GearItem[] = [
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
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [selectedGear, setSelectedGear] = useState<GearItem[]>([]);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

    const currentCard = ESSENTIAL_GEAR[currentCardIndex];
    const isLastCard = currentCardIndex >= ESSENTIAL_GEAR.length;
    const progress = (currentCardIndex / ESSENTIAL_GEAR.length) * 100;

    const handleSwipe = (selected: boolean) => {
        setSwipeDirection(selected ? "right" : "left");

        if (selected && currentCard) {
            setSelectedGear((prev) => [...prev, currentCard]);
        }

        setTimeout(() => {
            setSwipeDirection(null);
            setCurrentCardIndex((prev) => prev + 1);
        }, 200);
    };

    const handleFinish = () => {
        onComplete(selectedGear);
    };

    if (isLastCard) {
        // Summary screen
        return (
            <OnboardingScreen
                currentStep={currentStep}
                totalSteps={totalSteps}
                showSkip={false}
            >
                <div className="flex-1 flex flex-col px-6 pt-16 pb-4">
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center mb-6">
                            <Check className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">
                            Perfect!
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            {selectedGear.length === 0
                                ? "You can add gear later in your locker"
                                : `${selectedGear.length} item${selectedGear.length !== 1 ? "s" : ""} added to your locker`}
                        </p>

                        {selectedGear.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {selectedGear.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm"
                                    >
                                        <CategoryIcon category={item.category} className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-mallard-green to-mallard-green-light text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        Continue
                    </button>
                </div>
            </OnboardingScreen>
        );
    }

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={() => onComplete(selectedGear)}
        >
            <div className="flex-1 flex flex-col px-6 pt-12 pb-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">
                        Building your locker...
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Quick! Which essentials do you own?
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-mallard-green to-mallard-green-light transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        {currentCardIndex + 1} of {ESSENTIAL_GEAR.length}
                    </p>
                </div>

                {/* Card */}
                <div className="flex-1 flex items-center justify-center mb-8">
                    <div
                        className={`relative w-full max-w-sm transition-all duration-200 ${swipeDirection === "left"
                                ? "-translate-x-full opacity-0 rotate-[-10deg]"
                                : swipeDirection === "right"
                                    ? "translate-x-full opacity-0 rotate-[10deg]"
                                    : ""
                            }`}
                    >
                        <div className="bg-card rounded-3xl border-2 border-border shadow-xl p-8">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mallard-green/10 to-mallard-green/20 flex items-center justify-center">
                                    <CategoryIcon
                                        category={currentCard.category}
                                        className="h-12 w-12 text-mallard-green"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <h2 className="text-2xl font-bold text-center mb-2">
                                {currentCard.name}
                            </h2>
                            <p className="text-center text-muted-foreground mb-8">
                                Do you own one?
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleSwipe(false)}
                                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                    <X className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm font-medium">No</span>
                                </button>
                                <button
                                    onClick={() => handleSwipe(true)}
                                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-mallard-green text-white hover:bg-mallard-green/90 transition-colors"
                                >
                                    <Check className="h-6 w-6" />
                                    <span className="text-sm font-medium">Yes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Item Preview */}
                {currentCardIndex < ESSENTIAL_GEAR.length - 1 && (
                    <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
                        Next: {ESSENTIAL_GEAR[currentCardIndex + 1].name}
                        <ChevronRight className="h-4 w-4" />
                    </div>
                )}
            </div>
        </OnboardingScreen>
    );
}
