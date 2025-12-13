"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Cloud, History } from "lucide-react";
import { useGeolocation } from "@/lib/geolocation";
import { fetchWeather } from "@/lib/weatherApi";
import { useUserProfile } from "@/lib/useUserProfile";
import { WeatherConditions } from "@/lib/types";

// Context data type for plan creation flow
export interface PlanContextData {
    title: string;
    date: string;
    locationName: string;
    weather: WeatherConditions | null;
}

interface Step1Props {
    data: PlanContextData;
    setData: (data: Partial<PlanContextData>) => void;
    onNext: () => void;
}

export function Step1Context({ data, setData, onNext }: Step1Props) {
    const { getCurrentPosition } = useGeolocation();
    const { profile } = useUserProfile();
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    // Initialize date if empty
    useEffect(() => {
        if (!data.date) {
            setData({ date: new Date().toISOString().split('T')[0] });
        }
    }, []);

    const handleUseCurrentLocation = async () => {
        setLoadingLocation(true);
        const position = await getCurrentPosition();
        if (position) {
            setData({ locationName: "Current Location" }); // Ideally reverse geocode here
            const weatherRes = await fetchWeather(position.latitude, position.longitude);
            if (weatherRes.success) {
                setData({ weather: weatherRes.data });
            }
        }
        setLoadingLocation(false);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Plan Title <span className="text-muted-foreground font-normal">(Optional)</span></label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData({ title: e.target.value })}
                        placeholder="e.g. Late Season Goose Field"
                        className="input w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={data.date ? data.date.split('T')[0] : ""}
                            onChange={(e) => setData({ date: e.target.value })}
                            className="input w-full pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Location</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={data.locationName}
                                onChange={(e) => setData({ locationName: e.target.value })}
                                onFocus={() => setShowLocationSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                placeholder="Enter location..."
                                className="input w-full pl-10"
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            {/* Saved Location Suggestions */}
                            {showLocationSuggestions && profile.savedLocations.length > 0 && (
                                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                                    <div className="px-3 py-2 text-xs text-muted-foreground font-medium flex items-center gap-1.5 border-b border-border">
                                        <History className="h-3 w-3" />
                                        Recent Locations
                                    </div>
                                    {profile.savedLocations.slice(0, 5).map((loc, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setData({ locationName: loc });
                                                setShowLocationSuggestions(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary flex items-center gap-2 transition-colors"
                                        >
                                            <MapPin className="h-3.5 w-3.5 text-primary" />
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleUseCurrentLocation}
                            disabled={loadingLocation}
                            className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                        >
                            <MapPin className={`h-5 w-5 ${loadingLocation ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Weather Preview */}
            {data.weather && (
                <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800 rounded-2xl p-4 flex items-center gap-4">
                    <Cloud className="h-8 w-8 text-sky-500" />
                    <div>
                        <div className="font-bold">{data.weather.temperature}°F • {data.weather.skyCondition}</div>
                        <div className="text-xs text-muted-foreground">Wind: {data.weather.windSpeed}mph {data.weather.windDirection}</div>
                    </div>
                </div>
            )}

            <button
                onClick={onNext}
                disabled={!data.date}
                className="w-full py-4 mt-8 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next: Select Gear
            </button>
        </div>
    );
}
