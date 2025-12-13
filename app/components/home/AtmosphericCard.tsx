"use client";

import { Thermometer, Droplets, ChevronRight } from "lucide-react";
import { WindRose } from "./WindRose";
import { WeatherConditions, SkyCondition } from "@/lib/types";

interface AtmosphericCardProps {
    weather: WeatherConditions | null;
    loading: boolean;
    formatTemperature: (temp: number, unit: "F" | "C") => string;
    formatWindSpeed: (speed: number, unit: "mph" | "kph") => string;
    temperatureUnit: "F" | "C";
    windSpeedUnit: "mph" | "kph";
    onClick?: () => void;
}

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
                                    animationDuration: `${0.8 + Math.random() * 0.4}s`,
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
                                    animationDuration: `${2 + Math.random()}s`,
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
    onClick,
}: AtmosphericCardProps) {
    if (loading) {
        return (
            <div
                onClick={onClick}
                className="relative overflow-hidden bg-gradient-to-br from-sky-dawn via-sky-morning to-water-blue rounded-2xl p-5 text-white shadow-lg cursor-pointer"
            >
                <div className="flex items-center justify-center h-24">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!weather) {
        return (
            <div
                onClick={onClick}
                className="relative overflow-hidden bg-gradient-to-br from-sky-dawn/60 via-sky-morning/60 to-water-blue/60 rounded-2xl p-5 text-white/70 shadow-lg backdrop-blur-sm border border-white/10 cursor-pointer card-hover group"
            >
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <p className="text-sm font-medium">Weather unavailable</p>
                        <p className="text-xs opacity-70 mt-1">Enable location access</p>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="relative overflow-hidden bg-gradient-to-br from-sky-dawn via-sky-morning to-water-blue rounded-2xl p-4 text-white shadow-lg cursor-pointer card-hover group"
        >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />

            {/* Animated weather background */}
            <WeatherBackground condition={weather.skyCondition} />

            <div className="relative flex items-center gap-4">
                {/* Wind Rose */}
                <div className="w-20 h-20 flex-shrink-0">
                    <WindRose
                        direction={weather.windDirection}
                        speed={weather.windSpeed}
                        className="w-full h-full"
                    />
                </div>

                {/* Weather stats */}
                <div className="flex-1 space-y-2">
                    {/* Temperature row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-mallard-yellow" />
                            <span className="text-2xl font-bold">
                                {formatTemperature(weather.temperature, temperatureUnit)}
                            </span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {weather.skyCondition === "Partly Cloudy" ? "P. Cloudy" : weather.skyCondition}
                        </span>
                    </div>

                    {/* Wind info */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white/70">Wind</span>
                            <span className="font-bold">
                                {weather.windDirection} {formatWindSpeed(weather.windSpeed, windSpeedUnit)}
                            </span>
                        </div>
                        {weather.humidity && (
                            <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3 text-water-blue" />
                                <span className="text-white/70">{weather.humidity}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chevron indicator */}
                <ChevronRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
        </div>
    );
}
