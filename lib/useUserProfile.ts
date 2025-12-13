"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth";
import * as firestoreService from "./firestore";

// ============================================
// UNIFIED USER PROFILE
// ============================================

export interface UnifiedUserProfile {
    hunterName: string;
    homeLocation: string;
    temperatureUnit: 'F' | 'C';
    windSpeedUnit: 'mph' | 'kph';
    notificationsEnabled: boolean;
    savedLocations: string[]; // Frequently used locations
    // Onboarding data
    hunterExperience?: 'first' | 'intermediate' | 'veteran' | null;
    hunterStyle?: string;
    brandAffinities?: Record<string, string[]>;
}

const DEFAULT_PROFILE: UnifiedUserProfile = {
    hunterName: "Hunter",
    homeLocation: "",
    temperatureUnit: 'F',
    windSpeedUnit: 'mph',
    notificationsEnabled: true,
    savedLocations: [],
    hunterExperience: null,
    hunterStyle: "",
    brandAffinities: {},
};

const PROFILE_KEY = "timber_user_profile";

/**
 * Unified hook for user profile data.
 * - Syncs with Firestore when authenticated
 * - Falls back to localStorage when offline/unauthenticated
 * - Single source of truth for all user preferences
 */
export function useUserProfile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UnifiedUserProfile>(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Load profile on mount and auth change
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);

            // First, load from localStorage for instant display
            const localData = loadLocalProfile();
            if (localData) {
                setProfile(localData);
            }

            // If authenticated, sync with Firestore
            if (user) {
                try {
                    const firestoreData = await firestoreService.getUserProfile(user.uid);
                    if (firestoreData) {
                        // Merge Firestore data with defaults
                        const merged: UnifiedUserProfile = {
                            ...DEFAULT_PROFILE,
                            hunterName: firestoreData.hunterName || DEFAULT_PROFILE.hunterName,
                            homeLocation: firestoreData.homeLocation || DEFAULT_PROFILE.homeLocation,
                            temperatureUnit: firestoreData.temperatureUnit || DEFAULT_PROFILE.temperatureUnit,
                            windSpeedUnit: firestoreData.windSpeedUnit || DEFAULT_PROFILE.windSpeedUnit,
                            notificationsEnabled: firestoreData.notificationsEnabled ?? DEFAULT_PROFILE.notificationsEnabled,
                            savedLocations: (localData?.savedLocations || []), // Keep local saved locations
                            hunterExperience: firestoreData.experience || DEFAULT_PROFILE.hunterExperience,
                            hunterStyle: firestoreData.huntingStyle || DEFAULT_PROFILE.hunterStyle,
                            brandAffinities: firestoreData.brandAffinities || DEFAULT_PROFILE.brandAffinities,
                        };
                        setProfile(merged);
                        saveLocalProfile(merged); // Keep local in sync
                    } else {
                        // No Firestore profile, create one from local/defaults
                        const toCreate = localData || DEFAULT_PROFILE;
                        await firestoreService.createUserProfile(user.uid, {
                            hunterName: toCreate.hunterName,
                            homeLocation: toCreate.homeLocation,
                            temperatureUnit: toCreate.temperatureUnit,
                            windSpeedUnit: toCreate.windSpeedUnit,
                            notificationsEnabled: toCreate.notificationsEnabled,
                            experience: toCreate.hunterExperience,
                            huntingStyle: toCreate.hunterStyle,
                            brandAffinities: toCreate.brandAffinities,
                        });
                        setProfile(toCreate);
                    }
                } catch (error) {
                    console.error("Error loading profile from Firestore:", error);
                    // Keep using local data on error
                }
            }

            setLoading(false);
            setInitialized(true);
        };

        if (!authLoading) {
            loadProfile();
        }
    }, [user, authLoading]);

    // Update profile
    const updateProfile = useCallback(async (updates: Partial<UnifiedUserProfile>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        saveLocalProfile(newProfile);

        // Sync to Firestore if authenticated
        if (user) {
            try {
                await firestoreService.updateUserProfile(user.uid, {
                    hunterName: updates.hunterName,
                    homeLocation: updates.homeLocation,
                    temperatureUnit: updates.temperatureUnit,
                    windSpeedUnit: updates.windSpeedUnit,
                    notificationsEnabled: updates.notificationsEnabled,
                    experience: updates.hunterExperience,
                    huntingStyle: updates.hunterStyle,
                    brandAffinities: updates.brandAffinities,
                });
            } catch (error) {
                console.error("Error updating profile in Firestore:", error);
            }
        }
    }, [profile, user]);

    // Add a saved location
    const addSavedLocation = useCallback(async (location: string) => {
        if (!location || profile.savedLocations.includes(location)) return;

        const newLocations = [location, ...profile.savedLocations].slice(0, 10); // Keep max 10
        await updateProfile({ savedLocations: newLocations });
    }, [profile.savedLocations, updateProfile]);

    // Remove a saved location
    const removeSavedLocation = useCallback(async (location: string) => {
        const newLocations = profile.savedLocations.filter(l => l !== location);
        await updateProfile({ savedLocations: newLocations });
    }, [profile.savedLocations, updateProfile]);

    return {
        profile,
        loading: loading || authLoading,
        initialized,
        updateProfile,
        addSavedLocation,
        removeSavedLocation,
    };
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function loadLocalProfile(): UnifiedUserProfile | null {
    if (typeof window === "undefined") return null;

    try {
        // Try new unified key first
        const unified = localStorage.getItem(PROFILE_KEY);
        if (unified) {
            return { ...DEFAULT_PROFILE, ...JSON.parse(unified) };
        }

        // Migrate from old keys if they exist
        const oldPrefs = localStorage.getItem("talkin_timber_preferences");
        const oldOnboarding = localStorage.getItem("timber_onboarding");

        let migrated: Partial<UnifiedUserProfile> = {};

        if (oldPrefs) {
            const prefs = JSON.parse(oldPrefs);
            migrated = {
                hunterName: prefs.hunterName,
                homeLocation: prefs.homeLocation,
                temperatureUnit: prefs.temperatureUnit,
                windSpeedUnit: prefs.windSpeedUnit,
                notificationsEnabled: prefs.notificationsEnabled,
            };
        }

        if (oldOnboarding) {
            const onboarding = JSON.parse(oldOnboarding);
            migrated = {
                ...migrated,
                hunterName: onboarding.hunterName || migrated.hunterName,
                hunterExperience: onboarding.hunterExperience,
                hunterStyle: onboarding.hunterStyle,
                brandAffinities: onboarding.hunterBrandAffinities,
            };
        }

        if (Object.keys(migrated).length > 0) {
            const mergedProfile = { ...DEFAULT_PROFILE, ...migrated };
            saveLocalProfile(mergedProfile);
            return mergedProfile;
        }

        return null;
    } catch (error) {
        console.warn("Error loading local profile:", error);
        return null;
    }
}

function saveLocalProfile(profile: UnifiedUserProfile): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.warn("Error saving local profile:", error);
    }
}
