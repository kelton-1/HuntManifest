"use client";

import Link from "next/link";
import { Plus, MapPin, Calendar, Bird, ChevronRight, CloudSun, Wind } from "lucide-react";
import { useHuntLogs } from "@/lib/storage";
import { useUserProfile } from "@/lib/useUserProfile";
import { formatTemperature, formatWindSpeed } from "@/lib/formatting";

export default function HuntLogPage() {
    const { logs } = useHuntLogs();
    const { profile } = useUserProfile();

    const totalBirds = logs.reduce((acc, log) =>
        acc + log.harvests.reduce((sum, h) => sum + h.count, 0), 0
    );

    return (
        <div className="pb-8 animate-fade-in">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light bg-clip-text text-transparent">
                        Hunt Journal
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {logs.length} {logs.length === 1 ? 'hunt' : 'hunts'} logged
                        {totalBirds > 0 && ` • ${totalBirds} harvested`}
                    </p>
                </div>
                <Link
                    href="/log/new"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-mallard-green to-mallard-green-light text-white shadow-lg transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Record Hunt</span>
                </Link>
            </header>

            {/* Hunt List */}
            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="inline-flex p-5 bg-primary/10 rounded-2xl mb-4">
                            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
                        </div>
                        <p className="font-semibold text-lg">No hunts logged yet</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Start recording your hunts to track conditions and improve your success rate
                        </p>
                        <Link
                            href="/log/new"
                            className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-gradient-to-br from-mallard-green to-mallard-green-light text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Record Your First Hunt
                        </Link>
                    </div>
                ) : (
                    logs.map((log, index) => {
                        const bagCount = log.harvests.reduce((sum, h) => sum + h.count, 0);
                        const speciesList = log.harvests.map(h => h.species).join(', ');

                        return (
                            <Link
                                href={`/log/${log.id}`}
                                key={log.id}
                                className="block group bg-card rounded-2xl border border-border shadow-sm overflow-hidden card-hover animate-slide-up"
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                {/* Main Content */}
                                <div className="p-4">
                                    {/* Date & Actions */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <time className="font-medium">
                                                {new Date(log.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </time>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <h3 className="font-semibold text-lg leading-tight">
                                            {log.location?.name || "Unknown Location"}
                                        </h3>
                                    </div>

                                    {/* Weather Badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg text-xs text-secondary-foreground">
                                            <CloudSun className="h-3 w-3" />
                                            {formatTemperature(log.weather.temperature, profile.temperatureUnit)}
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg text-xs text-secondary-foreground">
                                            <Wind className="h-3 w-3" />
                                            {log.weather.windDirection} {formatWindSpeed(log.weather.windSpeed, profile.windSpeedUnit)}
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-lg text-xs text-secondary-foreground">
                                            {log.weather.skyCondition}
                                        </div>
                                    </div>

                                    {/* Species if any */}
                                    {speciesList && (
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                                            {speciesList}
                                        </p>
                                    )}
                                </div>

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <Bird className="h-4 w-4 text-mallard-yellow" />
                                        <span className="font-mono text-xl font-bold text-mallard-yellow">
                                            {bagCount}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {bagCount === 1 ? 'harvested' : 'harvested'}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
