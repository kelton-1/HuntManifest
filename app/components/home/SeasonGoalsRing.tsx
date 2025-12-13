"use client";

import { useState } from "react";
import { Trophy, Bird, TrendingUp } from "lucide-react";

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
                };
            case "harvest":
                return {
                    value: totalHarvest,
                    goal: seasonGoals.harvest,
                    label: "Harvest",
                    sublabel: `of ${seasonGoals.harvest} goal`,
                    progress: Math.min((totalHarvest / seasonGoals.harvest) * 100, 100),
                    icon: Trophy,
                };
            case "average":
                return {
                    value: avgPerHunt,
                    goal: 5,
                    label: "Avg/Hunt",
                    sublabel: "birds per outing",
                    progress: Math.min((parseFloat(avgPerHunt) / 5) * 100, 100),
                    icon: TrendingUp,
                };
        }
    };

    const metric = getMetricData();
    const Icon = metric.icon;

    // SVG circle dimensions
    const size = 140;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (metric.progress / 100) * circumference;

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-mallard-green via-mallard-green to-mallard-green-light rounded-2xl p-5 text-white shadow-lg">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <pattern id="feathers-ring" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M10 0C10 5.5 5.5 10 0 10C5.5 10 10 14.5 10 20C10 14.5 14.5 10 20 10C14.5 10 10 5.5 10 0Z" fill="currentColor" />
                    </pattern>
                    <rect x="0" y="0" width="100" height="100" fill="url(#feathers-ring)" />
                </svg>
            </div>

            <div className="relative flex items-center gap-5">
                {/* Radial Progress Ring */}
                <div className="relative flex-shrink-0">
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background track */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress arc */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700 ease-out"
                        />
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FFD700" />
                                <stop offset="100%" stopColor="#90EE90" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Icon className="h-4 w-4 text-mallard-yellow mb-1" />
                        <span className="text-3xl font-bold tracking-tight">{metric.value}</span>
                        <span className="text-[10px] text-white/70 uppercase tracking-wide">{metric.label}</span>
                    </div>
                </div>

                {/* Right side content */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold tracking-tight mb-0.5 truncate">
                        Welcome, {hunterName}
                    </h1>
                    <p className="text-white/70 text-xs mb-3">
                        {metric.sublabel}
                    </p>

                    {/* Metric toggle pills */}
                    <div className="flex gap-1.5">
                        {(["hunts", "harvest", "average"] as MetricType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveMetric(type)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${activeMetric === type
                                        ? "bg-white/25 text-white"
                                        : "bg-white/10 text-white/60 hover:bg-white/15"
                                    }`}
                            >
                                {type === "average" ? "Avg" : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
