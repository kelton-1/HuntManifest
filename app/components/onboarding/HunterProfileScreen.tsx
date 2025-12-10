"use client";

import { useState } from "react";
import { OnboardingScreen } from "./OnboardingScreen";
import { User, MapPin, Calendar, Compass } from "lucide-react";
import { HunterExperience } from "@/lib/onboarding";

export interface HunterProfileData {
    name: string;
    dob: string;
    homeLocation: string;
    huntingStyle: string;
    experience: HunterExperience;
}

interface HunterProfileScreenProps {
    onComplete: (data: HunterProfileData) => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
    initialName?: string;
}

export function HunterProfileScreen({
    onComplete,
    initialName = "",
    currentStep,
    totalSteps,
}: HunterProfileScreenProps) {
    const [name, setName] = useState(initialName);
    const [dob, setDob] = useState("");
    const [homeLocation, setHomeLocation] = useState("");
    const [huntingStyle, setHuntingStyle] = useState("");
    const [experience, setExperience] = useState<HunterExperience | null>(null);

    // If initialName is provided (e.g. from Google Auth), it might be read-only or pre-filled
    const isNameLocked = !!initialName && initialName.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && dob && homeLocation && huntingStyle && experience) {
            onComplete({
                name,
                dob,
                homeLocation,
                huntingStyle,
                experience
            });
        }
    };

    const isFormValid = name && dob && homeLocation && huntingStyle && experience;

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={() => { }} // Profile is usually mandatory
            showSkip={false}
        >
            <div className="flex-1 flex flex-col px-6 pt-8 pb-4">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Build Your Profile</h1>
                    <p className="text-muted-foreground">
                        Tell us a bit about yourself to personalize your experience
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 overflow-y-auto pb-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                disabled={isNameLocked}
                                className={`w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${isNameLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    {/* DOB Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{ colorScheme: "dark" }} // Ensures date picker looks good in dark mode
                            />
                        </div>
                    </div>

                    {/* Home Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Home Base</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={homeLocation}
                                onChange={(e) => setHomeLocation(e.target.value)}
                                placeholder="City, State"
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Hunting Style */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Primary Hunting Style</label>
                        <div className="relative">
                            <Compass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <select
                                value={huntingStyle}
                                onChange={(e) => setHuntingStyle(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-foreground"
                            >
                                <option value="" disabled>Select Style</option>
                                <option value="Public Land">Public Land</option>
                                <option value="Private Land">Private Land</option>
                                <option value="Club / Lease">Club / Lease</option>
                                <option value="Guide / Outfitter">Guide / Outfitter</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium ml-1">Experience Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['first', 'intermediate', 'veteran'] as const).map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setExperience(level)}
                                    className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${experience === level
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-card hover:border-muted-foreground/50"
                                        }`}
                                >
                                    {level === 'first' && 'Rookie'}
                                    {level === 'intermediate' && 'Seasoned'}
                                    {level === 'veteran' && 'Veteran'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 pb-safe mt-auto">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </OnboardingScreen>
    );
}
