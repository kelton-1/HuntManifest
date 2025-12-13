"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useHuntPlans } from "@/lib/storage";
import { PlanGearItem, WeatherConditions } from "@/lib/types";
import { Step1Context, PlanContextData } from "./Step1Context";
import { Step2Gear } from "./Step2Gear";
import { Step3Review } from "./Step3Review";

export default function NewPlanPage() {
    const router = useRouter();
    const { addPlan } = useHuntPlans();

    // Step State
    const [step, setStep] = useState(1);

    // Data State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [locationName, setLocationName] = useState("");
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [selectedGear, setSelectedGear] = useState<PlanGearItem[]>([]);

    const contextData: PlanContextData = { title, date, locationName, weather };
    const setContextData = (data: Partial<PlanContextData>) => {
        if (data.title !== undefined) setTitle(data.title);
        if (data.date !== undefined) setDate(data.date);
        if (data.locationName !== undefined) setLocationName(data.locationName);
        if (data.weather !== undefined) setWeather(data.weather);
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => {
        if (step === 1) router.back();
        else setStep(step - 1);
    };

    const handleSave = async () => {
        await addPlan({
            id: crypto.randomUUID(),
            userId: "", // Handled by hook
            title: title || `${locationName} Hunt`,
            date: date || new Date().toISOString(),
            location: { name: locationName },
            weather: weather || undefined,
            gear: selectedGear,
            status: 'ACTIVE',
            notes: "",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        router.replace("/plan");
    };

    return (
        <div className="pb-20 animate-fade-in relative min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-border/50">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-lg">New Plan</h1>
                    <div className="flex gap-1.5 mt-1">
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 3 ? "bg-primary" : "bg-border"}`} />
                    </div>
                </div>
                <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Content */}
            <main className="flex-1 p-4">
                {step === 1 && (
                    <Step1Context
                        data={contextData}
                        setData={setContextData}
                        onNext={handleNext}
                    />
                )}
                {step === 2 && (
                    <Step2Gear
                        selectedGear={selectedGear}
                        setSelectedGear={setSelectedGear}
                        onNext={handleNext}
                    />
                )}
                {step === 3 && (
                    <Step3Review
                        data={contextData}
                        gear={selectedGear}
                        onSave={handleSave}
                    />
                )}
            </main>
        </div>
    );
}
