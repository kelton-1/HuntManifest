"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingScreenProps {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
    onSkip?: () => void;
    showSkip?: boolean;
    className?: string;
}

export function OnboardingScreen({
    children,
    currentStep,
    totalSteps,
    onSkip,
    showSkip = true,
    className = "",
}: OnboardingScreenProps) {
    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-background ${className}`}>
            {/* Skip button */}
            {showSkip && onSkip && (
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
                    >
                        Skip
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col">
                {children}
            </div>

            {/* Progress Dots */}
            <div className="pb-8">
                <ProgressDots current={currentStep} total={totalSteps} />
            </div>
        </div>
    );
}

interface ProgressDotsProps {
    current: number;
    total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
    return (
        <div className="flex justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < current
                        ? "bg-mallard-green dark:bg-mallard-yellow scale-100"
                        : i === current
                            ? "bg-mallard-green dark:bg-mallard-yellow scale-125"
                            : "bg-border scale-100"
                        }`}
                />
            ))}
        </div>
    );
}

// Animation variants for page transitions
export const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

export const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};
