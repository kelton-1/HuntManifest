"use client";

import { useState } from "react";
import { Sprout, Target, Trophy } from "lucide-react";
import { HunterExperience } from "@/lib/onboarding";
import { OnboardingScreen } from "./OnboardingScreen";

interface HunterProfileScreenProps {
    onComplete: (name: string, experience: HunterExperience) => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

const experienceOptions: { value: HunterExperience; label: string; icon: React.ReactNode; description: string }[] = [
    {
        value: "first",
        label: "First Season",
        icon: <Sprout className="h-5 w-5" />,
        description: "Just getting started",
    },
    {
        value: "intermediate",
        label: "2-5 Years",
        icon: <Target className="h-5 w-5" />,
        description: "Know the basics",
    },
    {
        value: "veteran",
        label: "Seasoned Veteran",
        icon: <Trophy className="h-5 w-5" />,
        description: "Expert hunter",
    },
];

export function HunterProfileScreen({
    onComplete,
    onSkip,
    currentStep,
    totalSteps,
}: HunterProfileScreenProps) {
    const [name, setName] = useState("");
    const [experience, setExperience] = useState<HunterExperience | null>(null);

    const canContinue = name.trim().length > 0 && experience !== null;

    const handleContinue = () => {
        if (canContinue) {
            onComplete(name.trim(), experience);
        }
    };

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={onSkip}
        >
            <div className="flex-1 flex flex-col px-6 pt-16 pb-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">
                        What should we call you, hunter?
                    </h1>
                    <p className="text-muted-foreground">
                        Personalize your experience
                    </p>
                </div>

                {/* Name Input */}
                <div className="mb-8">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-4 text-lg bg-secondary rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
                        autoFocus
                        maxLength={30}
                    />
                </div>

                {/* Experience Selection */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">
                        How long have you been hunting?
                    </h2>
                    <div className="space-y-3">
                        {experienceOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setExperience(option.value)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${experience === option.value
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-card hover:border-muted-foreground/50"
                                    }`}
                            >
                                <div
                                    className={`p-2.5 rounded-lg ${experience === option.value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground"
                                        }`}
                                >
                                    {option.icon}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">{option.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="mt-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${canContinue
                                ? "bg-gradient-to-r from-mallard-green to-mallard-green-light text-white shadow-lg hover:shadow-xl"
                                : "bg-secondary text-muted-foreground"
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </OnboardingScreen>
    );
}
