"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "./WelcomeScreen";
import { AuthScreen } from "./AuthScreen";
import { HunterProfileScreen, HunterProfileData } from "./HunterProfileScreen";
import { LocationPermissionScreen } from "./LocationPermissionScreen";
import { BrandSelectionScreen } from "./BrandSelectionScreen";
import { useOnboarding } from "@/lib/onboarding";
import { useInventory } from "@/lib/storage";

type OnboardingStep = "welcome" | "auth" | "profile" | "location" | "brands";

export function OnboardingFlow() {
    const router = useRouter();
    const { state, isLoaded, setHunterProfile, setBrandAffinities, completeOnboarding } = useOnboarding();
    const { addItem } = useInventory(); // Removed inventory from destructuring as it wasn't used
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");

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

    const handleProfileComplete = (data: HunterProfileData) => {
        setHunterProfile(data);

        // Also sync name to preferences so it shows in profile page
        if (typeof window !== "undefined") {
            const prefsKey = "talkin_timber_preferences";
            const existing = localStorage.getItem(prefsKey);
            const prefs = existing ? JSON.parse(existing) : {};
            prefs.hunterName = data.name;
            localStorage.setItem(prefsKey, JSON.stringify(prefs));
        }

        setCurrentStep("location");
    };

    const handleLocationComplete = () => {
        setCurrentStep("brands");
    };

    const handleBrandsComplete = (affinities: Record<string, string[]>) => {
        // Save affinities to user profile (firestore + local)
        setBrandAffinities(affinities);

        // Complete onboarding
        completeOnboarding();
        router.push("/");
    };

    const handleSkip = () => {
        completeOnboarding();
        router.push("/");
    };

    // Calculate total steps
    const TOTAL_STEPS = 5;
    const getStepNumber = (step: OnboardingStep): number => {
        switch (step) {
            case "welcome": return 0;
            case "auth": return 1;
            case "profile": return 2;
            case "location": return 3;
            case "brands": return 4;
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
                    onSkip={handleSkip} // Actually disabled inside component
                    initialName={state.hunterName} // Pass pre-filled name if any (e.g. from Auth)
                    currentStep={getStepNumber("profile")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
            {currentStep === "location" && (
                <LocationPermissionScreen
                    onComplete={handleLocationComplete}
                    onSkip={handleLocationComplete} // Can skip location
                    currentStep={getStepNumber("location")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
            {currentStep === "brands" && (
                <BrandSelectionScreen
                    onComplete={handleBrandsComplete}
                    onSkip={handleSkip}
                    currentStep={getStepNumber("brands")}
                    totalSteps={TOTAL_STEPS}
                />
            )}
        </>
    );
}
