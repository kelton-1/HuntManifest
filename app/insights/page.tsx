"use client";

import { motion } from "framer-motion";
import { BarChart3, NotebookPen, CloudSun, Bird, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useHuntLogs } from "@/lib/storage";
import { useInsights, InsightsTier } from "@/lib/useInsights";
import { InsightsSummary } from "@/lib/gemini";
import { staggerContainer, staggerChild, snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";

import { SeasonPulse } from "@/app/components/insights/SeasonPulse";
import { WeatherPatterns } from "@/app/components/insights/WeatherPatterns";
import { SpeciesBreakdown } from "@/app/components/insights/SpeciesBreakdown";
import { LocationIntel } from "@/app/components/insights/LocationIntel";
import { AICoach } from "@/app/components/insights/AICoach";
import { InsightCard } from "@/app/components/insights/InsightCard";

// Tier config
const TIER_LABELS: Record<InsightsTier, { label: string; color: string }> = {
    none: { label: "", color: "" },
    starter: { label: "Scout", color: "bg-secondary text-foreground" },
    growing: { label: "Tracker", color: "bg-primary/20 text-primary" },
    full: { label: "Analyst", color: "bg-mallard-yellow/20 text-mallard-yellow" },
};

export default function InsightsPage() {
    const { logs, loading } = useHuntLogs();
    const insights = useInsights(logs);

    const tierInfo = TIER_LABELS[insights.tier];
    const isGrowing = insights.tier === 'growing' || insights.tier === 'full';
    const isFull = insights.tier === 'full';

    // Build AI summary from insights data
    const aiSummary: InsightsSummary = {
        totalHunts: insights.seasonPulse.totalHunts,
        successRate: insights.seasonPulse.successRate,
        totalHarvest: insights.seasonPulse.totalHarvest,
        topSpecies: insights.seasonPulse.topSpecies,
        favoriteLocation: insights.seasonPulse.favoriteLocation,
        sweetSpot: insights.weatherPatterns.sweetSpot,
        uniqueLocations: insights.seasonPulse.uniqueLocations,
        avgRating: insights.seasonPulse.avgRating,
        shootingEfficiency: insights.timeAnalysis.shootingEfficiency,
        perHunterAvg: insights.timeAnalysis.perHunterAvg,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    // Empty state — no hunts
    if (insights.tier === 'none') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
                <div className="p-6 bg-primary/10 rounded-full mb-6">
                    <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Insights</h1>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    Log your first hunt to start seeing season stats, weather patterns, and species trends.
                </p>
                <Link
                    href="/log/new"
                    onClick={() => hapticLight()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2"
                >
                    <NotebookPen className="h-4 w-4" />
                    Log Your First Hunt
                </Link>
            </div>
        );
    }

    const huntsNeededForGrowing = Math.max(0, 3 - logs.length);
    const huntsNeededForFull = Math.max(0, 5 - logs.length);

    return (
        <div className="pb-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold">Insights</h1>
                    <p className="text-xs text-muted-foreground">
                        {logs.length} {logs.length === 1 ? 'hunt' : 'hunts'} analyzed
                    </p>
                </div>
                {tierInfo.label && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierInfo.color}`}>
                        {tierInfo.label}
                    </span>
                )}
            </div>

            {/* Sections */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {/* Season Pulse — always visible with 1+ hunts */}
                <SeasonPulse data={insights.seasonPulse} />

                {/* Weather Patterns — unlocks at 3 hunts */}
                {isGrowing ? (
                    <WeatherPatterns data={insights.weatherPatterns} />
                ) : (
                    <InsightCard
                        title="Weather Patterns"
                        icon={CloudSun}
                        locked
                        lockMessage={`Log ${huntsNeededForGrowing} more hunt${huntsNeededForGrowing !== 1 ? 's' : ''} to unlock weather analysis.`}
                    >
                        <div />
                    </InsightCard>
                )}

                {/* Species Breakdown — unlocks at 3 hunts with harvests */}
                {isGrowing && insights.speciesBreakdown.species.length > 0 ? (
                    <SpeciesBreakdown data={insights.speciesBreakdown} />
                ) : !isGrowing ? (
                    <InsightCard
                        title="Species Breakdown"
                        icon={Bird}
                        locked
                        lockMessage={`Log ${huntsNeededForGrowing} more hunt${huntsNeededForGrowing !== 1 ? 's' : ''} to unlock species analysis.`}
                    >
                        <div />
                    </InsightCard>
                ) : null}

                {/* Location Intel — unlocks at 3 hunts */}
                {isGrowing && insights.locationIntel.locations.length > 0 ? (
                    <LocationIntel data={insights.locationIntel} />
                ) : !isGrowing ? (
                    <InsightCard
                        title="Location Intel"
                        icon={MapPin}
                        locked
                        lockMessage={`Log ${huntsNeededForGrowing} more hunt${huntsNeededForGrowing !== 1 ? 's' : ''} to unlock location analysis.`}
                    >
                        <div />
                    </InsightCard>
                ) : null}

                {/* AI Guide — unlocks at 5 hunts */}
                {isFull ? (
                    <AICoach summary={aiSummary} logCount={logs.length} />
                ) : (
                    <InsightCard
                        title="AI Guide"
                        icon={Sparkles}
                        locked
                        lockMessage={`Log ${huntsNeededForFull} more hunt${huntsNeededForFull !== 1 ? 's' : ''} to unlock AI-powered guidance.`}
                    >
                        <div />
                    </InsightCard>
                )}

                {/* Time & Efficiency Stats — bonus section, visible at growing+ */}
                {isGrowing && (insights.timeAnalysis.avgDuration || insights.timeAnalysis.shootingEfficiency || insights.timeAnalysis.perHunterAvg) && (
                    <motion.section variants={staggerChild} className="glass-card rounded-2xl p-5 space-y-3">
                        <h3 className="text-lg font-bold">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {insights.timeAnalysis.avgDuration && (
                                <div className="stat-tile">
                                    <span className="text-xl font-bold tabular-nums">
                                        {Math.floor(insights.timeAnalysis.avgDuration / 60)}h {insights.timeAnalysis.avgDuration % 60}m
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">Avg Duration</span>
                                </div>
                            )}
                            {insights.timeAnalysis.shootingEfficiency && (
                                <div className="stat-tile">
                                    <span className="text-xl font-bold tabular-nums">
                                        {insights.timeAnalysis.shootingEfficiency}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">Birds/Shot</span>
                                </div>
                            )}
                            {insights.timeAnalysis.perHunterAvg && (
                                <div className="stat-tile">
                                    <span className="text-xl font-bold tabular-nums">
                                        {insights.timeAnalysis.perHunterAvg}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">Per Hunter Avg</span>
                                </div>
                            )}
                            {insights.timeAnalysis.peakStartHour !== null && (
                                <div className="stat-tile">
                                    <span className="text-xl font-bold tabular-nums">
                                        {insights.timeAnalysis.peakStartHour > 12
                                            ? `${insights.timeAnalysis.peakStartHour - 12}pm`
                                            : insights.timeAnalysis.peakStartHour === 0
                                                ? '12am'
                                                : `${insights.timeAnalysis.peakStartHour}am`}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">Peak Start</span>
                                </div>
                            )}
                        </div>

                        {/* Day of Week Distribution */}
                        {insights.timeAnalysis.dayOfWeek.some(d => d.hunts > 0) && (
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium">Hunts by Day</span>
                                <div className="flex gap-1.5 items-end h-12">
                                    {insights.timeAnalysis.dayOfWeek.map(d => {
                                        const maxHunts = Math.max(...insights.timeAnalysis.dayOfWeek.map(dd => dd.hunts), 1);
                                        const height = d.hunts > 0 ? Math.max(20, (d.hunts / maxHunts) * 100) : 8;
                                        return (
                                            <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.3 }}
                                                    className={`w-full rounded-sm ${d.hunts > 0 ? 'bg-primary/60' : 'bg-secondary/30'}`}
                                                />
                                                <span className="text-[9px] text-muted-foreground">{d.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}
            </motion.div>
        </div>
    );
}
