import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./auth";
import * as firestoreService from "./firestore";

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

  useEffect(() => {
    const loadOnboarding = async () => {
      if (user) {
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
            const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
            if (saved) {
              const localState = { ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) };
              setState(localState);
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
          const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
          if (saved) {
            setState({ ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) });
          }
        }
      } else {
        const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (saved) {
          setState({ ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(saved) });
        }
      }
      setIsLoaded(true);
    };
    loadOnboarding();
  }, [user]);

  const updateState = async (updates: Partial<OnboardingState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
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

  const completeOnboarding = () => {
    updateState({
      completed: true,
      completedAt: new Date().toISOString(),
      setupChecklist: { ...state.setupChecklist, profile: true, gear: true },
    });
  };

  const setHunterProfile = (data: { name: string; dob: string; homeLocation: string; huntingStyle: string; experience: HunterExperience }) => {
    updateState({
      hunterName: data.name,
      hunterDob: data.dob,
      hunterHomeLocation: data.homeLocation,
      hunterStyle: data.huntingStyle,
      hunterExperience: data.experience,
    });
  };

  const setBrandAffinities = (affinities: Record<string, string[]>) => {
    updateState({ hunterBrandAffinities: affinities });
  };

  const markChecklistItem = (item: keyof OnboardingState["setupChecklist"]) => {
    updateState({ setupChecklist: { ...state.setupChecklist, [item]: true } });
  };

  const markTooltipShown = (tooltipId: string) => {
    if (!state.tooltipsShown.includes(tooltipId)) {
      updateState({ tooltipsShown: [...state.tooltipsShown, tooltipId] });
    }
  };

  const wasTooltipShown = (tooltipId: string) => state.tooltipsShown.includes(tooltipId);

  const getChecklistProgress = () => {
    const items = Object.values(state.setupChecklist);
    const completed = items.filter(Boolean).length;
    return { completed, total: items.length, percentage: Math.round((completed / items.length) * 100) };
  };

  const resetOnboarding = async () => {
    setState(DEFAULT_ONBOARDING_STATE);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  };

  return {
    state, isLoaded, completeOnboarding, setHunterProfile, setBrandAffinities,
    markChecklistItem, markTooltipShown, wasTooltipShown, getChecklistProgress, resetOnboarding,
  };
}
