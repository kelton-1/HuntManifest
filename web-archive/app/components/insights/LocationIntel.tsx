"use client";

import { MapPin } from "lucide-react";
import { SPECIES_DATA } from "@/lib/species-data";
import { LocationIntelData } from "@/lib/useInsights";
import { InsightCard } from "./InsightCard";

interface LocationIntelProps {
    data: LocationIntelData;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LocationIntel({ data }: LocationIntelProps) {
    return (
        <InsightCard title="Location Intel" icon={MapPin}>
            {/* Horizontal scroll of location cards */}
            <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-2 hide-scrollbar">
                {data.locations.map((loc, idx) => (
                    <div
                        key={loc.name}
                        className="shrink-0 w-44 glass-subtle rounded-xl p-3.5 space-y-2"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-bold leading-tight line-clamp-2">{loc.name}</span>
                            {idx === 0 && data.locations.length > 1 && (
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                                    #1
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div>
                                <span className="text-muted-foreground">Visits</span>
                                <p className="font-bold">{loc.visits}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Avg Bag</span>
                                <p className="font-bold">{loc.avgHarvest}</p>
                            </div>
                        </div>
                        {/* Top Species dots */}
                        {loc.topSpecies.length > 0 && (
                            <div className="flex gap-1">
                                {loc.topSpecies.map(sp => {
                                    const info = SPECIES_DATA.find(s => s.name === sp);
                                    return (
                                        <div
                                            key={sp}
                                            className="w-4 h-4 rounded-full border border-white/20"
                                            style={{ backgroundColor: info?.colors[0] || '#0B3D2E' }}
                                            title={sp}
                                        />
                                    );
                                })}
                            </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                            Last: {formatDate(loc.lastVisited)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Ranked Comparison */}
            {data.locations.length > 1 && (
                <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] text-muted-foreground font-medium">Ranked by Avg Harvest</span>
                    {data.locations.map((loc, idx) => (
                        <div key={loc.name} className="flex items-center gap-2 text-sm">
                            <span className="text-[11px] text-muted-foreground w-5 text-right font-bold">
                                {idx + 1}.
                            </span>
                            <span className="font-medium flex-1 truncate">{loc.name}</span>
                            <span className="text-xs font-bold tabular-nums">{loc.avgHarvest}</span>
                            <span className="text-[10px] text-muted-foreground">avg</span>
                        </div>
                    ))}
                </div>
            )}
        </InsightCard>
    );
}
