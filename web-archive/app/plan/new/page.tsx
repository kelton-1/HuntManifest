"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHuntPlans } from "@/lib/storage";
import { PlanGearItem, WeatherConditions } from "@/lib/types";
import { smooth } from "@/lib/motion";
import { Step1Context, PlanContextData } from "./Step1Context";
import { Step2Gear } from "./Step2Gear";
import { Step3Review } from "./Step3Review";

const STEP_LABELS = ["Context", "Gear", "Review"];

export default function NewPlanPage() {
    const router = useRouter();
    const { plans, addPlan } = useHuntPlans();

    // Step State
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

    // Data State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [locationName, setLocationName] = useState("");
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [species, setSpecies] = useState<string[]>([]);
    const [selectedGear, setSelectedGear] = useState<PlanGearItem[]>([]);
    const [notes, setNotes] = useState("");

    // Pre-fill location from most recent plan
    useEffect(() => {
        if (plans.length > 0 && !locationName) {
            const sorted = [...plans].sort((a, b) => {
                const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.date).getTime();
                const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.date).getTime();
                return bTime - aTime;
            });
            const recent = sorted[0];
            if (recent.location?.name) {
                setLocationName(recent.location.name);
            }
        }
    }, [plans]);

    const contextData: PlanContextData = { title, date, locationName, weather, species };
    const setContextData = (data: Partial<PlanContextData>) => {
        if (data.title !== undefined) setTitle(data.title);
        if (data.date !== undefined) setDate(data.date);
        if (data.locationName !== undefined) setLocationName(data.locationName);
        if (data.weather !== undefined) setWeather(data.weather);
        if (data.species !== undefined) setSpecies(data.species);
    };

    const goToStep = (target: number) => {
        if (target < step) {
            setDirection(-1);
            setStep(target);
        }
        // Don't allow jumping forward past current step
    };

    const handleNext = () => {
        setDirection(1);
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step === 1) router.back();
        else {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const handleSave = async () => {
        await addPlan({
            id: crypto.randomUUID(),
            userId: "",
            title: title || `${locationName} Hunt`,
            date: date || new Date().toISOString(),
            location: { name: locationName },
            weather: weather || undefined,
            gear: selectedGear,
            species: species.length > 0 ? species : undefined,
            status: "ACTIVE",
            notes: notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        router.replace("/plan");
    };

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
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
                    {/* Tappable Step Indicator */}
                    <div className="flex gap-3 mt-2">
                        {STEP_LABELS.map((label, i) => {
                            const stepNum = i + 1;
                            const isActive = step === stepNum;
                            const isCompleted = step > stepNum;
                            const isTappable = stepNum < step;
                            return (
                                <button
                                    key={label}
                                    onClick={() => isTappable && goToStep(stepNum)}
                                    disabled={!isTappable}
                                    className={`flex items-center gap-1.5 transition-all ${
                                        isTappable ? "cursor-pointer" : "cursor-default"
                                    }`}
                                >
                                    <div
                                        className={`h-2 w-2 rounded-full transition-colors ${
                                            isActive
                                                ? "bg-primary"
                                                : isCompleted
                                                ? "bg-primary/50"
                                                : "bg-muted"
                                        }`}
                                    />
                                    <span
                                        className={`text-[10px] font-medium transition-colors ${
                                            isActive
                                                ? "text-primary"
                                                : isCompleted
                                                ? "text-primary/50"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="w-9" />
            </header>

            {/* Content with animated transitions */}
            <main className="flex-1 p-4">
                <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={smooth}
                        >
                            <Step1Context
                                data={contextData}
                                setData={setContextData}
                                onNext={handleNext}
                            />
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={smooth}
                        >
                            <Step2Gear
                                selectedGear={selectedGear}
                                setSelectedGear={setSelectedGear}
                                onNext={handleNext}
                            />
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={smooth}
                        >
                            <Step3Review
                                data={contextData}
                                gear={selectedGear}
                                notes={notes}
                                setNotes={setNotes}
                                onSave={handleSave}
                                onBackToGear={() => goToStep(2)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
