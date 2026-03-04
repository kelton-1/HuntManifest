"use client";

import { useState } from "react";
import { Trophy, Bird, TrendingUp } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";

interface SeasonGoalsRingProps {
    totalHunts: number;
    totalHarvest: number;
    hunterName: string;
}

type MetricType = "hunts" | "harvest" | "average";

export function SeasonGoalsRing({ totalHunts, totalHarvest, hunterName }: SeasonGoalsRingProps) {
    const [activeMetric, setActiveMetric] = useState<MetricType>("hunts");

    // Season goals (could be user-configurable later)
    const seasonGoals = {
        hunts: 20,
        harvest: 50,
    };

    // Calculate metrics
    const avgPerHunt = totalHunts > 0 ? (totalHarvest / totalHunts).toFixed(1) : "0";

    // Get current values based on active metric
    const getMetricData = () => {
        switch (activeMetric) {
            case "hunts":
                return {
                    value: totalHunts,
                    goal: seasonGoals.hunts,
                    label: "Hunts",
                    sublabel: `of ${seasonGoals.hunts} goal`,
                    progress: Math.min((totalHunts / seasonGoals.hunts) * 100, 100),
                    icon: Bird,
                    color: "text-mallard-green dark:text-mallard-green-light",
                    gradientId: "grad-hunts"
                };
            case "harvest":
                return {
                    value: totalHarvest,
                    goal: seasonGoals.harvest,
                    label: "Harvest",
                    sublabel: `of ${seasonGoals.harvest} goal`,
                    progress: Math.min((totalHarvest / seasonGoals.harvest) * 100, 100),
                    icon: Trophy,
                    color: "text-mallard-yellow",
                    gradientId: "grad-harvest"
                };
            case "average":
                return {
                    value: avgPerHunt,
                    goal: 5,
                    label: "Avg/Hunt",
                    sublabel: "birds per outing",
                    progress: Math.min((parseFloat(avgPerHunt) / 5) * 100, 100),
                    icon: TrendingUp,
                    color: "text-sky-500",
                    gradientId: "grad-avg"
                };
        }
    };

    const metric = getMetricData();
    const Icon = metric.icon;
    const animatedValue = useCountUp(typeof metric.value === 'number' ? metric.value : parseFloat(metric.value as string));
    const displayValue = activeMetric === 'average'
        ? (animatedValue / 10).toFixed(1)
        : animatedValue;

    // SVG circle dimensions
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (metric.progress / 100) * circumference;

    return (
        <section className="relative overflow-hidden glass-card rounded-2xl p-0 shadow-lg group">
            {/* Ambient Background Gradient (Behind Glass) */}
            <div className={`absolute inset-0 opacity-10 dark:opacity-20 transition-colors duration-500 bg-gradient-to-br ${activeMetric === 'hunts' ? 'from-mallard-green via-mallard-green-light to-transparent' :
                    activeMetric === 'harvest' ? 'from-mallard-yellow via-orange-400 to-transparent' :
                        'from-sky-500 via-blue-600 to-transparent'
                }`} />

            <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Ring Section */}
                <div className="relative flex-shrink-0">
                    <div className="relative">
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background track */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-muted-foreground/10"
                            />
                            {/* Progress arc */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={`url(#${metric.gradientId})`}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-700 ease-out"
                            />

                            {/* Gradients */}
                            <defs>
                                <linearGradient id="grad-hunts" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#166653" />
                                    <stop offset="100%" stopColor="#2DD4BF" />
                                </linearGradient>
                                <linearGradient id="grad-harvest" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#F5B800" />
                                    <stop offset="100%" stopColor="#FB923C" />
                                </linearGradient>
                                <linearGradient id="grad-avg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0EA5E9" />
                                    <stop offset="100%" stopColor="#6366F1" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Icon className={`h-5 w-5 mb-1 transition-colors duration-300 ${metric.color}`} />
                            <span className="text-4xl font-bold tracking-tight tabular-nums transition-all">{displayValue}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{metric.label}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                    <div>
                        <h1 className="text-lg font-bold tracking-tight mb-0.5 truncate">
                            Welcome, {hunterName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            You're {Math.round(metric.progress)}% of the way to your {metric.label.toLowerCase()} goal.
                        </p>
                    </div>

                    {/* Metric Selection Pills */}
                    <div className="flex p-1 bg-secondary/50 rounded-xl backdrop-blur-sm self-start">
                        {(["hunts", "harvest", "average"] as MetricType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveMetric(type)}
                                className={`relative px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${activeMetric === type
                                    ? "text-primary shadow-sm bg-background"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                {activeMetric === type && (
                                    <div className="absolute inset-0 rounded-lg ring-1 ring-black/5 dark:ring-white/10" />
                                )}
                                {type === "average" ? "Avg" : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Stat Micro-Grid */}
            <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/40 bg-secondary/30">
                <div className="p-3 text-center hover:bg-white/5 transition-colors">
                    <span className="block text-lg font-bold tabular-nums text-foreground">{totalHunts}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Hunts</span>
                </div>
                <div className="p-3 text-center hover:bg-white/5 transition-colors">
                    <span className="block text-lg font-bold tabular-nums text-mallard-yellow">{totalHarvest}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Harvest</span>
                </div>
                <div className="p-3 text-center hover:bg-white/5 transition-colors">
                    <span className="block text-lg font-bold tabular-nums text-sky-500">{avgPerHunt}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Avg/Hunt</span>
                </div>
            </div>
        </section>
    );
}
