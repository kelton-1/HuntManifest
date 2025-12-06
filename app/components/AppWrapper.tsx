"use client";

import { ReactNode } from "react";
import { OnboardingFlow } from "./onboarding";
import { useOnboarding } from "@/lib/onboarding";

interface AppWrapperProps {
    children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
    const { state, isLoaded } = useOnboarding();

    // Show loading state while checking onboarding status
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center animate-pulse">
                    <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
                </div>
            </div>
        );
    }

    // Show onboarding if not completed
    if (!state.completed) {
        return <OnboardingFlow />;
    }

    // Show main app content
    return <>{children}</>;
}
