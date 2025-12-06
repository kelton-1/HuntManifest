"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { OnboardingScreen } from "./OnboardingScreen";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { InventoryItem } from "@/lib/types";

interface AhaMomentScreenProps {
    gearItems: InventoryItem[];
    onComplete: () => void;
    currentStep: number;
    totalSteps: number;
}

export function AhaMomentScreen({
    gearItems,
    onComplete,
    currentStep,
    totalSteps,
}: AhaMomentScreenProps) {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [showCelebration, setShowCelebration] = useState(false);

    const displayItems = gearItems.slice(0, 6); // Show max 6 items
    const checkedCount = checkedItems.size;
    const progress = displayItems.length > 0 ? (checkedCount / displayItems.length) * 100 : 0;
    const allChecked = checkedCount === displayItems.length && displayItems.length > 0;

    const toggleItem = (id: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(id)) {
            newChecked.delete(id);
        } else {
            newChecked.add(id);
            // Celebration on first check
            if (checkedItems.size === 0) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 600);
            }
        }
        setCheckedItems(newChecked);
    };

    // Determine button state
    const hasEnoughChecks = checkedCount >= 2 || displayItems.length === 0;

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            showSkip={false}
        >
            <div className="flex-1 flex flex-col px-6 pt-12 pb-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mallard-yellow/20 rounded-full text-mallard-yellow mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-semibold">Try It Out!</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">
                        Your locker is ready! 🎉
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {displayItems.length > 0
                            ? "Tap items to check them off — never forget gear again!"
                            : "Start tracking your gear and hunts"}
                    </p>
                </div>

                {/* Gear Check Demo */}
                {displayItems.length > 0 && (
                    <div className="flex-1 mb-6">
                        {/* Card */}
                        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">Pre-Hunt Check</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {checkedCount} of {displayItems.length} packed
                                </span>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-border">
                                {displayItems.map((item, index) => {
                                    const isChecked = checkedItems.has(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`w-full flex items-center gap-3 p-4 text-left transition-all tap-highlight ${isChecked ? "bg-primary/5" : "hover:bg-secondary/50"
                                                }`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className={`transition-colors ${isChecked ? "text-primary" : "text-muted-foreground"}`}>
                                                {isChecked ? (
                                                    <CheckCircle2 className="h-6 w-6" />
                                                ) : (
                                                    <Circle className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`font-medium transition-all ${isChecked ? "line-through text-muted-foreground" : ""
                                                    }`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                                <CategoryIcon category={item.category} className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Progress Bar */}
                            <div className="p-4 bg-secondary/30">
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out rounded-full ${allChecked
                                                ? "bg-mallard-green"
                                                : "bg-gradient-to-r from-mallard-green to-mallard-green-light"
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    {allChecked
                                        ? "✓ All gear packed! Ready to hunt!"
                                        : `${Math.round(progress)}% complete`}
                                </p>
                            </div>
                        </div>

                        {/* Hint */}
                        {checkedCount === 0 && (
                            <p className="text-center text-sm text-muted-foreground mt-4 animate-pulse">
                                👆 Tap an item to try checking it off
                            </p>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {displayItems.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground mb-2">
                            Add gear from your locker to use Pre-Hunt Check
                        </p>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={onComplete}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${hasEnoughChecks
                            ? "bg-gradient-to-r from-mallard-green to-mallard-green-light text-white shadow-lg hover:shadow-xl"
                            : "bg-secondary text-muted-foreground"
                        }`}
                >
                    Start Hunting
                </button>

                {/* Celebration Effect */}
                {showCelebration && (
                    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
                        <div className="text-6xl animate-bounce">✓</div>
                    </div>
                )}
            </div>
        </OnboardingScreen>
    );
}
