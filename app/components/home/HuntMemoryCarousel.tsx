"use client";

import Link from "next/link";
import { MapPin, Bird, ChevronRight, Plus } from "lucide-react";
import { HuntLog } from "@/lib/types";

interface HuntMemoryCarouselProps {
    logs: HuntLog[];
    formatTemperature: (temp: number, unit: "F" | "C") => string;
    temperatureUnit: "F" | "C";
}

// Generate a gradient based on harvest count
function getCardGradient(harvestCount: number, index: number): string {
    const gradients = [
        "from-mallard-green/90 to-mallard-green-light/80",
        "from-sky-dawn/90 to-water-blue/80",
        "from-earth-brown/90 to-cattail-tan/80",
        "from-mallard-green-light/90 to-water-blue/80",
    ];

    // Use harvest success to influence color
    if (harvestCount >= 5) return "from-mallard-yellow/80 to-mallard-green/90"; // Gold for great hunts
    return gradients[index % gradients.length];
}

export function HuntMemoryCarousel({ logs, formatTemperature, temperatureUnit }: HuntMemoryCarouselProps) {
    if (logs.length === 0) {
        return (
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hunt Memories</h2>
                </div>
                <div className="bg-card/50 p-6 rounded-2xl border-2 border-dashed border-border text-center">
                    <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    </div>
                    <p className="font-medium text-sm text-foreground">No hunt memories yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tap + to record your first hunt</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hunt Memories</h2>
                <Link
                    href="/log"
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                    View All
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Horizontal scroll container */}
            <div className="relative -mx-4">
                <div
                    className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {logs.slice(0, 6).map((log, index) => {
                        const harvestCount = log.harvests.reduce((sum, h) => sum + h.count, 0);

                        return (
                            <Link
                                key={log.id}
                                href={`/log/${log.id}`}
                                className="flex-shrink-0 snap-start group"
                            >
                                <div
                                    className={`relative w-44 h-28 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br ${getCardGradient(harvestCount, index)} group-hover:scale-[1.02] transition-transform`}
                                >
                                    {/* Overlay pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <pattern id={`pattern-${log.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                                <circle cx="15" cy="15" r="1" fill="white" />
                                            </pattern>
                                            <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${log.id})`} />
                                        </svg>
                                    </div>

                                    {/* Content overlay */}
                                    <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                                        {/* Top: Date */}
                                        <div className="text-[10px] font-medium opacity-80">
                                            {new Date(log.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>

                                        {/* Bottom: Location + Harvest */}
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                <span className="text-xs font-semibold truncate">{log.location.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] opacity-70">
                                                    {formatTemperature(log.weather.temperature, temperatureUnit)}
                                                </span>
                                                <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full">
                                                    <Bird className="h-3 w-3 text-mallard-yellow" />
                                                    <span className="text-sm font-bold">{harvestCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* "Add new" card at end */}
                    <Link
                        href="/log/new"
                        className="flex-shrink-0 snap-start"
                    >
                        <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-2 hover:bg-card hover:border-primary/50 transition-colors">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">New Hunt</span>
                        </div>
                    </Link>
                </div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
        </section>
    );
}
