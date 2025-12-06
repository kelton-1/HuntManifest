"use client";

import { useState, useEffect } from "react";

// Onboarding state types
export type HunterExperience = "first" | "intermediate" | "veteran";

export interface OnboardingState {
    completed: boolean;
    completedAt: string | null;
    hunterName: string;
    hunterExperience: HunterExperience | null;
    setupChecklist: {
        profile: boolean;
        gear: boolean;
        firstHunt: boolean;
        firstCheck: boolean;
    };
    tooltipsShown: string[];
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
    completed: false,
    completedAt: null,
    hunterName: "",
    hunterExperience: null,
    setupChecklist: {
        profile: false,
        gear: false,
        firstHunt: false,
        firstCheck: false,
    },
    tooltipsShown: [],
};

const ONBOARDING_KEY = "timber_onboarding";

export function useOnboarding() {
    const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const saved = localStorage.getItem(ONBOARDING_KEY);
            if (saved) {
                setState({ ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) });
            }
        } catch (error) {
            console.warn("Error reading onboarding state:", error);
        }
        setIsLoaded(true);
    }, []);

    // Persist to localStorage
    const updateState = (updates: Partial<OnboardingState>) => {
        setState((prev) => {
            const newState = { ...prev, ...updates };
            if (typeof window !== "undefined") {
                localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
            }
            return newState;
        });
    };

    // Complete onboarding
    const completeOnboarding = () => {
        updateState({
            completed: true,
            completedAt: new Date().toISOString(),
            setupChecklist: {
                ...state.setupChecklist,
                profile: true,
                gear: true,
            },
        });
    };

    // Update hunter profile
    const setHunterProfile = (name: string, experience: HunterExperience) => {
        updateState({
            hunterName: name,
            hunterExperience: experience,
        });
    };

    // Mark checklist item complete
    const markChecklistItem = (item: keyof OnboardingState["setupChecklist"]) => {
        updateState({
            setupChecklist: {
                ...state.setupChecklist,
                [item]: true,
            },
        });
    };

    // Track shown tooltips
    const markTooltipShown = (tooltipId: string) => {
        if (!state.tooltipsShown.includes(tooltipId)) {
            updateState({
                tooltipsShown: [...state.tooltipsShown, tooltipId],
            });
        }
    };

    // Check if tooltip was shown
    const wasTooltipShown = (tooltipId: string) => {
        return state.tooltipsShown.includes(tooltipId);
    };

    // Get checklist progress
    const getChecklistProgress = () => {
        const items = Object.values(state.setupChecklist);
        const completed = items.filter(Boolean).length;
        return {
            completed,
            total: items.length,
            percentage: Math.round((completed / items.length) * 100),
        };
    };

    // Reset onboarding (for testing)
    const resetOnboarding = () => {
        setState(DEFAULT_ONBOARDING_STATE);
        if (typeof window !== "undefined") {
            localStorage.removeItem(ONBOARDING_KEY);
        }
    };

    return {
        state,
        isLoaded,
        completeOnboarding,
        setHunterProfile,
        markChecklistItem,
        markTooltipShown,
        wasTooltipShown,
        getChecklistProgress,
        resetOnboarding,
    };
}
