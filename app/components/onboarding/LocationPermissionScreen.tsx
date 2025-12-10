"use client";

import { useState } from "react";
import { OnboardingScreen } from "./OnboardingScreen";
import { requestLocationPermission } from "@/lib/geolocation";
import { motion } from "framer-motion";
import { MapPin, CloudSun, Navigation } from "lucide-react";

interface LocationPermissionScreenProps {
    onComplete: () => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

export function LocationPermissionScreen({
    onComplete,
    onSkip,
    currentStep,
    totalSteps,
}: LocationPermissionScreenProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEnableLocation = async () => {
        setLoading(true);
        setError("");
        try {
            await requestLocationPermission();
            onComplete();
        } catch (err: unknown) {
            console.error("Location permission error:", err);
            // Even if failed/denied, we proceed, just maybe log it or show a soft error
            // ideally we still move forward in onboarding
            onComplete();
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={onSkip}
        >
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-32 h-32 bg-mallard-green/10 rounded-full flex items-center justify-center mb-8"
                >
                    <MapPin className="h-16 w-16 text-mallard-green" />
                </motion.div>

                <h1 className="text-2xl font-bold mb-4">Enable Location Services</h1>
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    We use your location to provide real-time weather data, sun phases, and accurate hunt logging.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
                    <div className="bg-card p-4 rounded-xl border border-border flex flex-col items-center gap-2">
                        <CloudSun className="h-6 w-6 text-primary" />
                        <span className="text-xs font-medium">Local Weather</span>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border flex flex-col items-center gap-2">
                        <Navigation className="h-6 w-6 text-primary" />
                        <span className="text-xs font-medium">Hunt Logging</span>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={handleEnableLocation}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Requesting..." : "Enable Location"}
                    </button>
                    <button
                        onClick={onComplete}
                        className="w-full py-4 text-muted-foreground font-medium hover:text-foreground transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </OnboardingScreen>
    );
}
