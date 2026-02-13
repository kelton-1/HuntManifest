"use client";

import { useMemo } from "react";
import { Thermometer, Droplets, CloudSun } from "lucide-react";
import { WindRose } from "./WindRose";
import { WeatherConditions, SkyCondition } from "@/lib/types";
import { getHuntingSuitability } from "@/lib/huntingSuitability";

interface AtmosphericCardProps {
    weather: WeatherConditions | null;
    loading: boolean;
    formatTemperature: (temp: number, unit: "F" | "C") => string;
    formatWindSpeed: (speed: number, unit: "mph" | "kph") => string;
    temperatureUnit: "F" | "C";
    windSpeedUnit: "mph" | "kph";
}

// Pre-computed random durations to avoid recalculating on every render
const RAIN_DURATIONS = Array.from({ length: 12 }, () => 0.8 + Math.random() * 0.4);
const SNOW_DURATIONS = Array.from({ length: 10 }, () => 2 + Math.random());

// Animated weather background based on conditions
function WeatherBackground({ condition }: { condition?: SkyCondition }) {
    const getAnimation = () => {
        switch (condition) {
            case "Rain":
                return (
                    <>
                        {/* Rain drops */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-3 bg-white/20 rounded-full animate-rain"
                                style={{
                                    left: `${8 + i * 8}%`,
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: `${RAIN_DURATIONS[i]}s`,
                                }}
                            />
                        ))}
                    </>
                );
            case "Snow":
                return (
                    <>
                        {/* Snowflakes */}
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-snow"
                                style={{
                                    left: `${5 + i * 10}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: `${SNOW_DURATIONS[i]}s`,
                                }}
                            />
                        ))}
                    </>
                );
            case "Fog":
                return (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/15 to-white/5 animate-fog" />
                );
            case "Overcast":
            case "Partly Cloudy":
                return (
                    <>
                        {/* Drifting clouds */}
                        <div className="absolute top-2 -left-10 w-20 h-8 bg-white/10 rounded-full blur-md animate-cloud-drift" />
                        <div
                            className="absolute top-8 -left-16 w-24 h-10 bg-white/5 rounded-full blur-lg animate-cloud-drift"
                            style={{ animationDelay: "2s" }}
                        />
                    </>
                );
            default: // Clear
                return (
                    <>
                        {/* Subtle stars for dawn */}
                        <div className="absolute top-3 right-10 w-1 h-1 bg-white/30 rounded-full animate-pulse-soft" />
                        <div className="absolute top-6 right-20 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
                        <div className="absolute top-2 right-4 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }} />
                    </>
                );
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {getAnimation()}
        </div>
    );
}

export function AtmosphericCard({
    weather,
    loading,
    formatTemperature,
    formatWindSpeed,
    temperatureUnit,
    windSpeedUnit,
}: AtmosphericCardProps) {
    // Loading State - Shimmer Skeletons
    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl glass-card p-4 space-y-4">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="h-6 w-32 rounded-lg bg-white/5 animate-shimmer" />
                    <div className="h-6 w-16 rounded-lg bg-white/5 animate-shimmer" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-32 rounded-xl bg-white/5 animate-shimmer col-span-2" /> {/* Wind Rose spot */}
                    <div className="h-24 rounded-xl bg-white/5 animate-shimmer" />
                    <div className="h-24 rounded-xl bg-white/5 animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!weather) {
        return (
            <div className="relative overflow-hidden glass-card rounded-2xl p-6 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-white/5 mb-2">
                    <CloudSun className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-foreground">Weather Unavailable</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Enable location access to compare conditions with your past hunts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group">
            {/* Ambient Background - tied to conditions */}
            <div className="absolute -inset-4 rounded-[2rem] opacity-20 blur-2xl transition-colors duration-700"
                style={{
                    background: weather.skyCondition === 'Clear' ? 'radial-gradient(circle, #0EA5E9 0%, transparent 70%)' :
                        weather.skyCondition === 'Rain' ? 'radial-gradient(circle, #64748B 0%, transparent 70%)' :
                            weather.skyCondition === 'Overcast' ? 'radial-gradient(circle, #94A3B8 0%, transparent 70%)' :
                                'radial-gradient(circle, #0EA5E9 0%, transparent 70%)'
                }}
            />

            {/* Animated Particles Container (Behind cards) */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                <WeatherBackground condition={weather.skyCondition} />
            </div>

            {/* Suitability Badge */}
            {(() => {
                const suit = getHuntingSuitability(weather);
                return (
                    <div className={`absolute top-3 right-3 z-20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${suit.bgClass} ${suit.textClass}`}>
                        {suit.level}
                    </div>
                );
            })()}

            {/* Content Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-3">

                {/* 1. Wind Rose (Full Width) */}
                <div className="col-span-2 glass-card rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Wind Direction</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold tabular-nums text-foreground">{weather.windDirection}</span>
                            <span className="text-sm font-medium text-muted-foreground">{formatWindSpeed(weather.windSpeed, windSpeedUnit)}</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 -my-2">
                        <WindRose
                            direction={weather.windDirection}
                            speed={weather.windSpeed}
                            className="w-full h-full opacity-90"
                        />
                    </div>
                </div>

                {/* 2. Temperature Tile */}
                <div className="glass-card rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group/tile">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover/tile:opacity-100 transition-opacity">
                        <Thermometer className="h-6 w-6 text-mallard-yellow" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Temp</span>
                    <span className="text-2xl font-bold tabular-nums text-foreground mt-1">
                        {formatTemperature(weather.temperature, temperatureUnit)}
                    </span>
                </div>

                {/* 3. Sky Condition Tile */}
                <div className="glass-card rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group/tile">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover/tile:opacity-100 transition-opacity">
                        <CloudSun className="h-6 w-6 text-sky-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sky</span>
                    <span className="text-sm font-bold leading-tight mt-2 line-clamp-2">
                        {weather.skyCondition}
                    </span>
                </div>

                {/* 4. Humidity (Full Width or Split if we have more data) */}
                {weather.humidity && (
                    <div className="col-span-2 glass-card rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-medium">Humidity</span>
                        </div>
                        <span className="font-bold tabular-nums">{weather.humidity}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
