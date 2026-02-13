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
            <div className="flex items-center justify-between mb-3 px-1">
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
            <div className="relative -mx-4 group/carousel">
                <div
                    className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {logs.slice(0, 6).map((log, index) => {
                        const harvestCount = log.harvests.reduce((sum, h) => sum + h.count, 0);

                        return (
                            <Link
                                key={log.id}
                                href={`/log/${log.id}`}
                                className="flex-shrink-0 snap-start group/card relative"
                            >
                                <div
                                    className={`relative z-10 w-52 h-36 rounded-2xl overflow-hidden glass-card shadow-lg bg-gradient-to-br ${getCardGradient(harvestCount, index)} group-hover/card:scale-[1.02] transition-transform duration-300`}
                                >
                                    {/* Gradient Scrim for readability */}
                                    <div className="absolute inset-0 card-gradient-overlay opacity-60 group-hover/card:opacity-50 transition-opacity" />

                                    {/* Overlay pattern */}
                                    <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <pattern id={`pattern-${log.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                                <circle cx="15" cy="15" r="1" fill="white" />
                                            </pattern>
                                            <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${log.id})`} />
                                        </svg>
                                    </div>

                                    {/* Content Layout */}
                                    <div className="absolute inset-0 flex flex-col justify-between p-0">
                                        {/* Top: Date & Temp */}
                                        <div className="p-3 flex justify-between items-start">
                                            <div className="text-[10px] font-bold text-white/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 shadow-sm">
                                                {new Date(log.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-[10px] font-medium text-white/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                                                {formatTemperature(log.weather.temperature, temperatureUnit)}
                                            </div>
                                        </div>

                                        {/* Bottom: Glass HUD Bar */}
                                        <div className="glass-subtle backdrop-blur-md p-3 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <MapPin className="h-3.5 w-3.5 text-white/90 flex-shrink-0" />
                                                <span className="text-xs font-bold text-white truncate drop-shadow-sm leading-tight">
                                                    {log.location.name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full border border-white/5 flex-shrink-0">
                                                <Bird className="h-3 w-3 text-mallard-yellow" />
                                                <span className="text-xs font-bold text-white tabular-nums">{harvestCount}</span>
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
                        <div className="w-24 h-36 rounded-2xl glass-card flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-primary/50 transition-all group/add">
                            <div className="p-3 rounded-full bg-primary/10 group-hover/add:bg-primary/20 transition-colors shadow-inner">
                                <Plus className="h-5 w-5 text-primary group-hover/add:scale-110 transition-transform" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground text-center px-2">
                                New<br />Hunt
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-4 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-4 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>
        </section>
    );
}
