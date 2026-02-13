"use client";

import { TrendingUp, MapPin } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";
import { SeasonPulseData } from "@/lib/useInsights";
import { SPECIES_DATA } from "@/lib/species-data";
import { InsightCard } from "./InsightCard";

interface SeasonPulseProps {
    data: SeasonPulseData;
}

function StatTile({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    const animated = useCountUp(value);
    return (
        <div className="stat-tile">
            <span className="text-2xl font-bold tabular-nums">
                {animated}{suffix}
            </span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
    );
}

export function SeasonPulse({ data }: SeasonPulseProps) {
    return (
        <InsightCard title="Season Pulse" icon={TrendingUp}>
            {/* 2x2 Stat Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatTile label="Total Hunts" value={data.totalHunts} />
                <StatTile label="Total Harvest" value={data.totalHarvest} />
                <StatTile label="Success Rate" value={data.successRate} suffix="%" />
                <StatTile label="Locations" value={data.uniqueLocations} />
            </div>

            {/* Top Species Strip */}
            {data.topSpecies.length > 0 && (
                <div className="space-y-2">
                    <span className="text-[11px] text-muted-foreground font-medium">Top Species</span>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                        {data.topSpecies.map(sp => {
                            const speciesInfo = SPECIES_DATA.find(s => s.name === sp.name);
                            const color = speciesInfo?.colors[0] || '#0B3D2E';
                            return (
                                <div
                                    key={sp.name}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/50 shrink-0"
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs font-medium whitespace-nowrap">{sp.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold">{sp.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Favorite Location */}
            {data.favoriteLocation && (
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">Favorite:</span>
                    <span className="font-medium truncate">{data.favoriteLocation}</span>
                </div>
            )}
        </InsightCard>
    );
}
