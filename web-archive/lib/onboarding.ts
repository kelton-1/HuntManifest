"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import * as firestoreService from "./firestore";

// Onboarding state types
export type HunterExperience = "first" | "intermediate" | "veteran";

export interface OnboardingState {
    completed: boolean;
    completedAt: string | null;
    hunterName: string;
    hunterDob?: string;
    hunterHomeLocation?: string;
    hunterStyle?: string;
    hunterBrandAffinities?: Record<string, string[]>;
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
    hunterDob: "",
    hunterHomeLocation: "",
    hunterStyle: "",
    hunterBrandAffinities: {},
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
    const { user } = useAuth();
    const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Firestore or localStorage on mount
    useEffect(() => {
        const loadOnboarding = async () => {
            if (typeof window === "undefined") return;

            if (user) {
                // Try to load from Firestore
                try {
                    const profile = await firestoreService.getUserProfile(user.uid);
                    if (profile) {
                        setState({
                            completed: profile.onboardingCompleted,
                            completedAt: profile.onboardingCompletedAt?.toDate?.()?.toISOString() || null,
                            hunterName: profile.hunterName,
                            hunterDob: profile.dob,
                            hunterHomeLocation: profile.homeLocation,
                            hunterStyle: profile.huntingStyle,
                            hunterBrandAffinities: profile.brandAffinities || {},
                            hunterExperience: profile.experience,
                            setupChecklist: {
                                profile: profile.onboardingCompleted,
                                gear: profile.onboardingCompleted,
                                firstHunt: false,
                                firstCheck: false,
                            },
                            tooltipsShown: [],
                        });
                    } else {
                        // New user, check localStorage for migration
                        const saved = localStorage.getItem(ONBOARDING_KEY);
                        if (saved) {
                            const localState = { ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) };
                            setState(localState);
                            // Migrate to Firestore
                            await firestoreService.createUserProfile(user.uid, {
                                hunterName: localState.hunterName || "Hunter",
                                dob: localState.hunterDob,
                                homeLocation: localState.hunterHomeLocation,
                                huntingStyle: localState.hunterStyle,
                                experience: localState.hunterExperience,
                                brandAffinities: localState.hunterBrandAffinities,
                                onboardingCompleted: localState.completed,
                            });
                        } else {
                            setState(DEFAULT_ONBOARDING_STATE);
                        }
                    }
                } catch (error) {
                    console.error("Error loading onboarding from Firestore:", error);
                    // Fallback to localStorage
                    const saved = localStorage.getItem(ONBOARDING_KEY);
                    if (saved) {
                        setState({ ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) });
                    }
                }
            } else {
                // No user, use localStorage
                const saved = localStorage.getItem(ONBOARDING_KEY);
                if (saved) {
                    setState({ ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) });
                }
            }
            setIsLoaded(true);
        };

        loadOnboarding();
    }, [user]);

    // Persist to localStorage and Firestore
    const updateState = async (updates: Partial<OnboardingState>) => {
        const newState = { ...state, ...updates };
        setState(newState);

        // Always save to localStorage as backup
        if (typeof window !== "undefined") {
            localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
        }

        // Sync to Firestore if logged in
        if (user) {
            try {
                await firestoreService.updateUserProfile(user.uid, {
                    hunterName: newState.hunterName,
                    dob: newState.hunterDob,
                    homeLocation: newState.hunterHomeLocation,
                    huntingStyle: newState.hunterStyle,
                    experience: newState.hunterExperience,
                    brandAffinities: newState.hunterBrandAffinities,
                    onboardingCompleted: newState.completed,
                    ...(newState.completedAt && {
                        onboardingCompletedAt: new Date(newState.completedAt) as unknown as import("firebase/firestore").Timestamp,
                    }),
                });
            } catch (error) {
                console.error("Error syncing onboarding to Firestore:", error);
            }
        }
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
    const setHunterProfile = (data: { name: string; dob: string; homeLocation: string; huntingStyle: string; experience: HunterExperience }) => {
        updateState({
            hunterName: data.name,
            hunterDob: data.dob,
            hunterHomeLocation: data.homeLocation,
            hunterStyle: data.huntingStyle,
            hunterExperience: data.experience,
        });
    };

    // Set Affinities
    const setBrandAffinities = (affinities: Record<string, string[]>) => {
        updateState({
            hunterBrandAffinities: affinities
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
        setBrandAffinities,
        markChecklistItem,
        markTooltipShown,
        wasTooltipShown,
        getChecklistProgress,
        resetOnboarding,
    };
}
