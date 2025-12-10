"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "./WelcomeScreen";
import { AuthScreen } from "./AuthScreen";
import { HunterProfileScreen } from "./HunterProfileScreen";
import { GearSetupScreen } from "./GearSetupScreen";
import { useOnboarding, HunterExperience } from "@/lib/onboarding";
import { useInventory } from "@/lib/storage";
import { InventoryItem, InventoryCategory } from "@/lib/types";

type OnboardingStep = "welcome" | "auth" | "profile" | "gear";

interface SelectedGear {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
}

export function OnboardingFlow() {
    const router = useRouter();
    const { state, isLoaded, setHunterProfile, completeOnboarding } = useOnboarding();
    const { inventory, addItem } = useInventory();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
    const [selectedGear, setSelectedGear] = useState<SelectedGear[]>([]);

    // If not loaded yet, show nothing
    if (!isLoaded) {
        return null;
    }

    // If onboarding is complete, don't show
    if (state.completed) {
        return null;
    }

    const handleWelcomeComplete = () => {
        setCurrentStep("auth");
    };

    const handleAuthComplete = () => {
        setCurrentStep("profile");
    };

    const handleProfileComplete = (name: string, experience: HunterExperience) => {
        setHunterProfile(name, experience);

        // Also sync name to preferences so it shows in profile page
        if (typeof window !== "undefined") {
            const prefsKey = "talkin_timber_preferences";
            const existing = localStorage.getItem(prefsKey);
            const prefs = existing ? JSON.parse(existing) : {};
            prefs.hunterName = name;
            localStorage.setItem(prefsKey, JSON.stringify(prefs));
        }

        setCurrentStep("gear");
    };

    const handleGearComplete = (gear: SelectedGear[]) => {
        setSelectedGear(gear);

        // Add selected gear to inventory
        const newItems: InventoryItem[] = gear.map((g) => ({
            id: `onboard_${g.id}_${Date.now()}`,
            name: g.name,
            category: g.category,
            quantity: g.quantity || 1,
            isChecked: false,
        }));

        // Add items to inventory
        newItems.forEach((item) => addItem(item));

        // Complete onboarding
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
            case "auth": return 1;
            case "profile": return 2;
            case "gear": return 3;
            default: return 0;
        }
    };

    return (
        <>
            {currentStep === "welcome" && (
                <WelcomeScreen onComplete={handleWelcomeComplete} />
            )}
            {currentStep === "auth" && (
                <AuthScreen
                    onComplete={handleAuthComplete}
                    onSkip={handleSkip}
                    currentStep={getStepNumber("auth")}
                    totalSteps={TOTAL_STEPS}
                />
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
        </>
    );
}
