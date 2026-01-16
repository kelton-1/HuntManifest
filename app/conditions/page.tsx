"use client";

import Link from "next/link";
import { ArrowLeft, Wind, Cloud, Droplets, Calendar, Sparkles, RefreshCw, Sun, CloudRain, Snowflake, CloudFog } from "lucide-react";
import { useGeolocation } from "@/lib/geolocation";
import { useEffect, useState } from "react";
import { fetchWeather, fetchHourlyForecast, HourlyForecast } from "@/lib/weatherApi";
import { WeatherConditions, SkyCondition } from "@/lib/types";
import { generateHuntingTips } from "@/lib/gemini";

// Map sky condition to icon
function getWeatherIcon(condition: SkyCondition) {
    switch (condition) {
        case 'Clear': return Sun;
        case 'Partly Cloudy': return Cloud;
        case 'Overcast': return Cloud;
        case 'Rain': return CloudRain;
        case 'Snow': return Snowflake;
        case 'Fog': return CloudFog;
        default: return Cloud;
    }
}

export default function ConditionsPage() {
    const { getCurrentPosition } = useGeolocation();
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiTips, setAiTips] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        async function load() {
            const pos = await getCurrentPosition();
            if (pos) {
                // Fetch current weather and hourly forecast in parallel
                const [weatherRes, hourlyRes] = await Promise.all([
                    fetchWeather(pos.latitude, pos.longitude),
                    fetchHourlyForecast(pos.latitude, pos.longitude, 6)
                ]);

                if (weatherRes.success) setWeather(weatherRes.data);
                if (hourlyRes.success) setHourlyForecast(hourlyRes.data);
            }
            setLoading(false);
        }
        load();
    }, []);

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
                    {loading ? (
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center p-3 rounded-2xl bg-card border border-border animate-pulse">
                                    <div className="h-3 w-8 bg-muted rounded mb-2" />
                                    <div className="h-6 w-6 bg-muted rounded-full mb-2" />
                                    <div className="h-4 w-10 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    ) : hourlyForecast.length > 0 ? (
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {hourlyForecast.map((h, i) => {
                                const Icon = getWeatherIcon(h.skyCondition);
                                return (
                                    <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center p-3 rounded-2xl bg-card border border-border">
                                        <span className="text-xs text-muted-foreground mb-2">{h.time}</span>
                                        <Icon className="h-6 w-6 mb-2 text-primary" />
                                        <span className="font-bold">{h.temperature}°</span>
                                        <span className="text-[10px] text-muted-foreground mt-1">{h.windSpeed} mph</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Unable to load hourly forecast. Please allow location access.
                        </p>
                    )}
                </section>

                {/* AI Hunting Tips */}
                <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm uppercase tracking-wide">AI Hunting Tips</h3>
                        </div>
                        <button
                            onClick={async () => {
                                if (!weather) return;
                                setAiLoading(true);
                                try {
                                    const tips = await generateHuntingTips({
                                        temperature: weather.temperature,
                                        windSpeed: weather.windSpeed,
                                        windDirection: weather.windDirection,
                                        skyCondition: weather.skyCondition
                                    });
                                    setAiTips(tips);
                                } catch (e) {
                                    console.error("AI error:", e);
                                    const error = e as Error;
                                    if (error.message === 'RATE_LIMIT') {
                                        setAiTips("Rate limit reached. The free tier has limited requests per minute. Please wait a moment and try again.");
                                    } else {
                                        setAiTips("Unable to generate tips. Please try again.");
                                    }
                                }
                                setAiLoading(false);
                            }}
                            disabled={aiLoading || !weather}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 text-primary ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    {aiLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Analyzing conditions...
                        </div>
                    ) : aiTips ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiTips}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Tap the refresh button to get AI-powered hunting tips based on current conditions.
                        </p>
                    )}
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

