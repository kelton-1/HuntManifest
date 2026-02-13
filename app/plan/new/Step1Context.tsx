"use client";

import { useState, useEffect } from "react";
import { Calendar, Cloud, Check } from "lucide-react";
import { useGeolocation, reverseGeocode } from "@/lib/geolocation";
import { fetchWeather } from "@/lib/weatherApi";
import { useUserProfile } from "@/lib/useUserProfile";
import { WeatherConditions, WATERFOWL_SPECIES } from "@/lib/types";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import { MapPickerModal } from "@/app/components/MapPickerModal";
import { getHuntingSuitability } from "@/lib/huntingSuitability";

export interface PlanContextData {
    title: string;
    date: string;
    locationName: string;
    weather: WeatherConditions | null;
    species: string[];
}

interface Step1Props {
    data: PlanContextData;
    setData: (data: Partial<PlanContextData>) => void;
    onNext: () => void;
}

export function Step1Context({ data, setData, onNext }: Step1Props) {
    const { getCurrentPosition } = useGeolocation();
    const { profile } = useUserProfile();
    const [mapOpen, setMapOpen] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Initialize date if empty
    useEffect(() => {
        if (!data.date) {
            setData({ date: new Date().toISOString().split("T")[0] });
        }
    }, []);

    // Auto-resolve GPS location on mount (if no location set yet)
    useEffect(() => {
        if (data.locationName && data.locationName !== "Current Location") return;

        const autoResolve = async () => {
            const position = await getCurrentPosition();
            if (position) {
                setCoords({ lat: position.latitude, lng: position.longitude });
                const placeName = await reverseGeocode(position.latitude, position.longitude);
                if (placeName) {
                    setData({ locationName: placeName });
                }
                const weatherRes = await fetchWeather(position.latitude, position.longitude);
                if (weatherRes.success) {
                    setData({ weather: weatherRes.data });
                }
            }
        };

        autoResolve();
    }, []);

    const handleMapConfirm = async (result: { name: string; lat: number; lng: number }) => {
        setCoords({ lat: result.lat, lng: result.lng });
        setData({ locationName: result.name });
        const weatherRes = await fetchWeather(result.lat, result.lng);
        if (weatherRes.success) {
            setData({ weather: weatherRes.data });
        }
    };

    const toggleSpecies = (sp: string) => {
        const current = data.species || [];
        if (current.includes(sp)) {
            setData({ species: current.filter((s) => s !== sp) });
        } else {
            setData({ species: [...current, sp] });
        }
    };

    const suitability = data.weather ? getHuntingSuitability(data.weather) : null;

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">
                        Plan Title{" "}
                        <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
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
                            value={data.date ? data.date.split("T")[0] : ""}
                            onChange={(e) => setData({ date: e.target.value })}
                            className="input w-full pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Location</label>
                    <LocationAutocomplete
                        value={data.locationName}
                        onChange={(value) => setData({ locationName: value })}
                        onPlaceSelect={async (place) => {
                            setData({ locationName: place.name });
                            if (place.lat && place.lng) {
                                setCoords({ lat: place.lat, lng: place.lng });
                                const weatherRes = await fetchWeather(place.lat, place.lng);
                                if (weatherRes.success) {
                                    setData({ weather: weatherRes.data });
                                }
                            }
                        }}
                        onOpenMap={() => setMapOpen(true)}
                        placeholder="Search for a location..."
                        savedLocations={profile.savedLocations}
                    />
                </div>

                {/* Species Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">
                        Target Species{" "}
                        <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {WATERFOWL_SPECIES.map((sp) => {
                            const selected = (data.species || []).includes(sp);
                            return (
                                <button
                                    key={sp}
                                    type="button"
                                    onClick={() => toggleSpecies(sp)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                                        selected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {selected && <Check className="h-3 w-3" />}
                                    {sp}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Weather Preview */}
            {data.weather && (
                <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Cloud className="h-8 w-8 text-sky-500" />
                        <div>
                            <div className="font-bold">
                                {data.weather.temperature}°F &middot; {data.weather.skyCondition}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Wind: {data.weather.windSpeed}mph {data.weather.windDirection}
                            </div>
                        </div>
                    </div>
                    {suitability && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${suitability.bgClass} ${suitability.textClass}`}
                        >
                            {suitability.level}
                        </span>
                    )}
                </div>
            )}

            <button
                onClick={onNext}
                disabled={!data.date}
                className="w-full py-4 mt-8 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next: Select Gear
            </button>

            {/* Map Picker Modal */}
            <MapPickerModal
                open={mapOpen}
                onClose={() => setMapOpen(false)}
                onConfirm={handleMapConfirm}
                initialLat={coords?.lat}
                initialLng={coords?.lng}
            />
        </div>
    );
}
