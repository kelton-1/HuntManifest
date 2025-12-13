"use client";

import Link from "next/link";
import { ArrowLeft, Wind, Cloud, Thermometer, Droplets, Sun, Calendar } from "lucide-react";
import { useGeolocation } from "@/lib/geolocation";
import { useEffect, useState } from "react";
import { fetchWeather } from "@/lib/weatherApi";
import { WeatherConditions } from "@/lib/types";

export default function ConditionsPage() {
    const { getCurrentPosition } = useGeolocation();
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const pos = await getCurrentPosition();
            if (pos) {
                const res = await fetchWeather(pos.latitude, pos.longitude);
                if (res.success) setWeather(res.data);
            }
            setLoading(false);
        }
        load();
    }, []);

    // Mock hourly forecast for UI demo (since API might not provide it yet)
    const hourly = [
        { time: "Now", temp: weather?.temperature || "--", icon: Cloud, wind: weather?.windSpeed || "10" },
        { time: "1h", temp: (weather?.temperature || 0) + 1, icon: Sun, wind: "12" },
        { time: "2h", temp: (weather?.temperature || 0) + 2, icon: Sun, wind: "14" },
        { time: "3h", temp: (weather?.temperature || 0) + 1, icon: Cloud, wind: "11" },
        { time: "4h", temp: (weather?.temperature || 0) - 1, icon: Wind, wind: "15" },
    ];

    return (
        <div className="pb-20 animate-fade-in relative min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-border/50">
                <Link href="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold">Conditions</h1>
            </header>

            <div className="p-4 space-y-6">
                {/* Current Main Card */}
                <section className="bg-gradient-to-br from-sky-dawn via-sky-morning to-water-blue rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-sm font-medium opacity-80 mb-1">Current Conditions</h2>
                                <div className="text-5xl font-bold mb-2">{weather?.temperature ?? "--"}°</div>
                                <div className="text-lg font-medium opacity-90">{weather?.skyCondition ?? "Loading..."}</div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Wind className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2 opacity-70 mb-1">
                                    <Wind className="h-3 w-3" />
                                    <span className="text-xs uppercase tracking-wider">Wind</span>
                                </div>
                                <div className="text-lg font-semibold">{weather?.windSpeed ?? "--"} <span className="text-xs font-normal">mph</span></div>
                                <div className="text-xs opacity-70">from {weather?.windDirection ?? "--"}</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2 opacity-70 mb-1">
                                    <Droplets className="h-3 w-3" />
                                    <span className="text-xs uppercase tracking-wider">Humidity</span>
                                </div>
                                <div className="text-lg font-semibold">{weather?.humidity ?? "--"}%</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hourly Forecast */}
                <section>
                    <h3 className="font-bold text-lg mb-4">Hourly Forecast</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {hourly.map((h, i) => (
                            <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center p-3 rounded-2xl bg-card border border-border">
                                <span className="text-xs text-muted-foreground mb-2">{h.time}</span>
                                <h.icon className="h-6 w-6 mb-2 text-primary" />
                                <span className="font-bold">{h.temp}°</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{h.wind} mph</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Hunt Quality Indicator (Placeholder for future AI) */}
                <section className="bg-secondary/30 rounded-2xl p-5 border border-secondary">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <h3 className="font-semibold text-sm uppercase tracking-wide">Outlook</h3>
                    </div>
                    <p className="font-bold text-lg">Fair Conditions</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Wind is favorable for localized movement. Standard decoy spread recommended.
                    </p>
                </section>

                {/* Plan Action */}
                <Link
                    href="/plan"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg"
                >
                    <Calendar className="h-5 w-5" />
                    Plan Hunt for These Conditions
                </Link>
            </div>
        </div>
    );
}
