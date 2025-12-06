"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "./WelcomeScreen";
import { HunterProfileScreen } from "./HunterProfileScreen";
import { GearSetupScreen } from "./GearSetupScreen";
import { AhaMomentScreen } from "./AhaMomentScreen";
import { useOnboarding, HunterExperience } from "@/lib/onboarding";
import { useInventory } from "@/lib/storage";
import { InventoryItem, InventoryCategory } from "@/lib/types";

type OnboardingStep = "welcome" | "profile" | "gear" | "aha";

interface SelectedGear {
    id: string;
    name: string;
    category: InventoryCategory;
}

export function OnboardingFlow() {
    const router = useRouter();
    const { state, isLoaded, setHunterProfile, completeOnboarding } = useOnboarding();
    const { inventory, addItem } = useInventory();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
    const [selectedGear, setSelectedGear] = useState<SelectedGear[]>([]);
    const [addedItems, setAddedItems] = useState<InventoryItem[]>([]);

    // If not loaded yet, show nothing
    if (!isLoaded) {
        return null;
    }

    // If onboarding is complete, don't show
    if (state.completed) {
        return null;
    }

    const handleWelcomeComplete = () => {
        setCurrentStep("profile");
    };

    const handleProfileComplete = (name: string, experience: HunterExperience) => {
        setHunterProfile(name, experience);
        setCurrentStep("gear");
    };

    const handleGearComplete = (gear: SelectedGear[]) => {
        setSelectedGear(gear);

        // Add selected gear to inventory
        const newItems: InventoryItem[] = gear.map((g) => ({
            id: `onboard_${g.id}_${Date.now()}`,
            name: g.name,
            category: g.category,
            quantity: 1,
            isChecked: false,
        }));

        // Clear existing seed data and add new items
        newItems.forEach((item) => addItem(item));
        setAddedItems(newItems);

        setCurrentStep("aha");
    };

    const handleAhaComplete = () => {
        completeOnboarding();
        router.push("/");
    };

    const handleSkip = () => {
        completeOnboarding();
        router.push("/");
    };

    // Calculate total steps excluding welcome (which auto-advances)
    const TOTAL_STEPS = 4;
    const getStepNumber = (step: OnboardingStep): number => {
        switch (step) {
            case "welcome": return 0;
            case "profile": return 1;
            case "gear": return 2;
            case "aha": return 3;
            default: return 0;
        }
    };

    return (
        <>
            {currentStep === "welcome" && (
                <WelcomeScreen onComplete={handleWelcomeComplete} />
            )}
            {currentStep === "profile" && (
                <HunterProfileScreen
                    onComplete={handleProfileComplete}
                    onSkip={handleSkip}
                    currentStep={getStepNumber("profile")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
            {currentStep === "gear" && (
                <GearSetupScreen
                    onComplete={handleGearComplete}
                    onSkip={handleSkip}
                    currentStep={getStepNumber("gear")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
            {currentStep === "aha" && (
                <AhaMomentScreen
                    gearItems={addedItems.length > 0 ? addedItems : inventory}
                    onComplete={handleAhaComplete}
                    currentStep={getStepNumber("aha")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
        </>
    );
}
