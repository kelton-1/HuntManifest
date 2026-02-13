"use client";

import { CloudSun, Zap, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { smooth } from "@/lib/motion";
import { WeatherPatternsData, WeatherBucket } from "@/lib/useInsights";
import { InsightCard } from "./InsightCard";

interface WeatherPatternsProps {
    data: WeatherPatternsData;
}

function MiniBarChart({ buckets, label }: { buckets: WeatherBucket[]; label: string }) {
    const maxAvg = Math.max(...buckets.map(b => b.avgHarvest), 0.1);

    return (
        <div className="space-y-2">
            <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
            <div className="space-y-1.5">
                {buckets.map(bucket => (
                    <div key={bucket.label} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-24 shrink-0 truncate">
                            {bucket.label}
                        </span>
                        <div className="flex-1 h-5 bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(bucket.avgHarvest / maxAvg) * 100}%` }}
                                transition={{ ...smooth, delay: 0.2 }}
                                className="h-full bg-primary/70 rounded-full"
                            />
                        </div>
                        <span className="text-[11px] font-bold tabular-nums w-8 text-right">
                            {bucket.avgHarvest}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function WeatherPatterns({ data }: WeatherPatternsProps) {
    return (
        <InsightCard title="Weather Patterns" icon={CloudSun}>
            {/* Sweet Spot Highlight */}
            {data.sweetSpot && (
                <div className="bg-primary/10 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Sweet Spot</span>
                    </div>
                    <p className="text-sm font-medium">
                        {data.sweetSpot.temp}, {data.sweetSpot.wind} wind, {data.sweetSpot.sky}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Avg {data.sweetSpot.avgHarvest} birds/hunt in these conditions
                    </p>
                </div>
            )}

            {/* Temperature Bars */}
            {data.temperatureBuckets.length > 0 && (
                <MiniBarChart buckets={data.temperatureBuckets} label="By Temperature" />
            )}

            {/* Wind Bars */}
            {data.windBuckets.length > 0 && (
                <MiniBarChart buckets={data.windBuckets} label="By Wind Speed" />
            )}

            {/* Sky Condition Bars */}
            {data.skyBuckets.length > 0 && (
                <MiniBarChart buckets={data.skyBuckets} label="By Sky Condition" />
            )}

            {/* Moon Phase */}
            {data.moonPhaseBuckets.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Moon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground font-medium">Moon Phase</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {data.moonPhaseBuckets.map(bucket => (
                            <div
                                key={bucket.label}
                                className="px-2.5 py-1 rounded-full bg-secondary/50 text-[11px]"
                            >
                                <span className="font-medium">{bucket.label}</span>
                                <span className="text-muted-foreground ml-1">{bucket.avgHarvest} avg</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pressure Insight */}
            {data.pressureInsight && (
                <div className="text-xs text-muted-foreground bg-secondary/30 rounded-xl p-3 italic">
                    {data.pressureInsight}
                </div>
            )}
        </InsightCard>
    );
}
