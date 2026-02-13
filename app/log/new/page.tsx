"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Navigation, Check, X, Plus, Droplets, Gauge, ChevronDown, ChevronUp } from "lucide-react";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import { useHuntLogs, useHuntPlans, useInventory } from "@/lib/storage";
import { Harvest, WATERFOWL_SPECIES, WeatherConditions } from "@/lib/types";
import { useGeolocation, reverseGeocode } from "@/lib/geolocation";
import { fetchWeather } from "@/lib/weatherApi";
import { Thermometer, Wind, Cloud, Bird, Sunrise, Sunset } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { SmartInput } from "@/app/components/inventory/SmartInput";
import { ParsedProduct } from "@/lib/services/ProductIntelligenceEngine";
import { SpeciesTapGrid } from "@/app/components/log/SpeciesTapGrid";
import { StarRating } from "@/app/components/log/StarRating";
import { QuickTags } from "@/app/components/log/QuickTags";

function NewHuntLogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");

    const { addLog } = useHuntLogs();
    const { plans, updatePlan } = useHuntPlans();
    const { inventory, addItem } = useInventory();
    const { getCurrentPosition } = useGeolocation();
    const { profile, addSavedLocation } = useUserProfile();


    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [locationName, setLocationName] = useState("");
    const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [notes, setNotes] = useState("");
    const [autoFillLoading, setAutoFillLoading] = useState(true);
    const [autoFillDone, setAutoFillDone] = useState(false);

    // Weather State — starts empty, auto-fills on page load
    const [weather, setWeather] = useState<WeatherConditions>({
        temperature: 0,
        windSpeed: 0,
        windDirection: "N",
        skyCondition: "Partly Cloudy",
    });

    // Harvest State
    const [harvests, setHarvests] = useState<Harvest[]>([]);

    // Rating & Tags
    const [rating, setRating] = useState<number>(0);
    const [tags, setTags] = useState<string[]>([]);

    // Gear State
    const [gearUsed, setGearUsed] = useState<{ id: string; name: string }[]>([]);
    const [showGearAdd, setShowGearAdd] = useState(false);
    const [gearExpanded, setGearExpanded] = useState(false);

    // Remove gear from list
    const removeGear = (id: string) => {
        setGearUsed(prev => prev.filter(g => g.id !== id));
    };

    // Add gear from SmartInput
    const handleGearAddResult = useCallback((result: ParsedProduct) => {
        const newItem = {
            id: crypto.randomUUID(),
            name: result.name,
            category: result.category,
            quantity: 1,
            status: 'READY' as const,
            specs: {
                brand: result.brand,
                model: result.model,
                ...(result.attributes as Record<string, string>),
            },
            createdAt: new Date(),
        };

        // Add to inventory
        addItem(newItem);

        // Add to gear used list
        setGearUsed(prev => [...prev, { id: newItem.id, name: newItem.name }]);
        setShowGearAdd(false);
    }, [addItem]);

    // Pre-fill from Plan
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (planId && plans.length > 0) {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                // Batch updates to avoid multiple renders/cascading updates
                if (plan.date) setDate(prev => prev === new Date().toISOString().split("T")[0] ? new Date(plan.date).toISOString().split("T")[0] : prev);
                if (plan.location?.name) setLocationName(prev => !prev ? plan.location.name : prev);

                // For weather, we need to be careful not to create a loop or impure render
                // Just set it once if we have plan weather data
                if (plan.weather) {
                    setWeather(prev => ({
                        ...prev,
                        ...plan.weather!
                    }));
                }

                if (plan.gear) {
                    setGearUsed(prev => prev.length === 0 ? plan.gear.map(g => ({ id: g.id, name: g.name })) : prev);
                }

                // Append note
                if (plan.title) {
                    setNotes(prev => {
                        if (prev.includes(`Plan: ${plan.title}`)) return prev;
                        return prev ? `${prev}\n\nPlan: ${plan.title}` : `Executed Plan: ${plan.title}`;
                    });
                }
            }
        }
    }, [planId, plans]);

    // Auto-fill GPS + Weather on page load — zero taps required
    const runAutoFill = useCallback(async () => {
        setAutoFillLoading(true);

        const position = await getCurrentPosition();

        if (position) {
            setLocationCoords({ lat: position.latitude, lng: position.longitude });

            // Fetch real weather
            const weatherResult = await fetchWeather(position.latitude, position.longitude);
            if (weatherResult.success) {
                setWeather(weatherResult.data);
            }

            // Reverse geocode for location name
            const placeName = await reverseGeocode(position.latitude, position.longitude);
            if (placeName) {
                setLocationName(prev => prev || placeName);
            }

            setAutoFillDone(true);
        }

        setAutoFillLoading(false);
    }, [getCurrentPosition]);

    // Run auto-fill on mount (unless pre-filling from a plan with weather)
    useEffect(() => {
        runAutoFill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationName) {
            alert("Please enter a location");
            return;
        }

        const newLogId = crypto.randomUUID();

        // 1. Create the Log
        await addLog({
            id: newLogId,
            date,
            location: { name: locationName },
            weather,
            harvests,
            gear: gearUsed,
            notes,
            rating: rating > 0 ? rating : undefined,
            tags: tags.length > 0 ? tags : undefined,
            planId: planId || undefined
        });

        // 2. If imported from a Plan, update that Plan
        if (planId) {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                await updatePlan({
                    ...plan,
                    status: 'COMPLETED',
                    resultLogId: newLogId
                });
            }
        }

        router.replace("/log"); // Go to log list

        // 3. Save location to user profile for future quick access
        if (locationName) {
            await addSavedLocation(locationName);
        }
    };

    const totalBirds = harvests.reduce((sum, h) => sum + h.count, 0);

    return (
        <div className="pb-28 animate-fade-in">
            {/* Header */}
            <header className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">New Hunt Log</h1>
                    <p className="text-xs text-muted-foreground">
                        {planId ? "Imported from Plan" : "Record your hunt details"}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Auto-Fill Status */}
                {autoFillLoading ? (
                    <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-3.5 font-semibold border border-primary/20">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Getting Location & Weather...
                    </div>
                ) : autoFillDone ? (
                    <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 py-3 text-sm font-medium border border-green-500/20">
                        <Check className="h-4 w-4" />
                        Location & weather auto-filled
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={runAutoFill}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-3.5 font-semibold border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                        <Navigation className="h-5 w-5" />
                        Auto-Fill with GPS & Weather
                    </button>
                )}

                {/* Date & Location Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
                        General Info
                    </h3>
                    <div className="space-y-3">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <LocationAutocomplete
                            value={locationName}
                            onChange={setLocationName}
                            onPlaceSelect={async (place) => {
                                setLocationName(place.name);
                                if (place.lat && place.lng) {
                                    setLocationCoords({ lat: place.lat, lng: place.lng });
                                    const weatherResult = await fetchWeather(place.lat, place.lng);
                                    if (weatherResult.success) {
                                        setWeather(weatherResult.data);
                                    }
                                }
                            }}
                            placeholder="Search for a location..."
                            savedLocations={profile.savedLocations}
                        />
                        {locationCoords && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                GPS: {locationCoords.lat.toFixed(4)}°, {locationCoords.lng.toFixed(4)}°
                            </p>
                        )}
                    </div>
                </section>

                {/* Weather Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                        Conditions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Thermometer className="h-3 w-3" /> Temp (°F)
                            </label>
                            <input
                                type="number"
                                value={weather.temperature || ''}
                                onChange={e => setWeather({ ...weather, temperature: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Wind className="h-3 w-3" /> Wind (mph)
                            </label>
                            <input
                                type="number"
                                value={weather.windSpeed || ''}
                                onChange={e => setWeather({ ...weather, windSpeed: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Direction</label>
                            <select
                                value={weather.windDirection}
                                onChange={e => setWeather({ ...weather, windDirection: e.target.value })}
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Cloud className="h-3 w-3" /> Sky
                            </label>
                            <select
                                value={weather.skyCondition}
                                onChange={e => setWeather({ ...weather, skyCondition: e.target.value as WeatherConditions['skyCondition'] })}
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {['Clear', 'Partly Cloudy', 'Overcast', 'Rain', 'Snow', 'Fog'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Droplets className="h-3 w-3" /> Humidity (%)
                            </label>
                            <input
                                type="number"
                                value={weather.humidity ?? ''}
                                onChange={e => setWeather({ ...weather, humidity: parseInt(e.target.value) || undefined })}
                                placeholder="Auto"
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Gauge className="h-3 w-3" /> Pressure (inHg)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={weather.barometricPressure ?? ''}
                                onChange={e => setWeather({ ...weather, barometricPressure: parseFloat(e.target.value) || undefined })}
                                placeholder="Auto"
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    {/* Sunrise / Sunset — read-only, auto-filled */}
                    {(weather.sunrise || weather.sunset) && (
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            {weather.sunrise && (
                                <span className="flex items-center gap-1">
                                    <Sunrise className="h-3 w-3" /> {weather.sunrise}
                                </span>
                            )}
                            {weather.sunset && (
                                <span className="flex items-center gap-1">
                                    <Sunset className="h-3 w-3" /> {weather.sunset}
                                </span>
                            )}
                        </div>
                    )}
                </section>

                {/* Gear Section — Collapsible */}
                <section className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setGearExpanded(!gearExpanded)}
                        className="w-full font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2"
                    >
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">3</span>
                        Gear Used
                        <span className="ml-auto flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs font-bold">
                                {gearUsed.length} items
                            </span>
                            {gearExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                    </button>

                    {gearExpanded && (
                        <div className="space-y-4">
                            {gearUsed.length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                                    {gearUsed.map((g) => (
                                        <div key={g.id} className="flex items-center justify-between gap-2 text-sm py-1">
                                            <div className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span>{g.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeGear(g.id)}
                                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Inline Add */}
                            {showGearAdd ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Add gear</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowGearAdd(false)}
                                            className="text-xs text-muted-foreground hover:text-primary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <SmartInput
                                        onResult={handleGearAddResult}
                                        compact={true}
                                        placeholder="Scan, paste, or type..."
                                    />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowGearAdd(true)}
                                    className="w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add gear
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Harvest Section — Tap Grid */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">4</span>
                        Harvest
                        {totalBirds > 0 && (
                            <span className="ml-auto px-2 py-0.5 bg-mallard-yellow/20 text-mallard-yellow rounded-full text-xs font-bold">
                                {totalBirds} {totalBirds === 1 ? 'bird' : 'birds'}
                            </span>
                        )}
                    </h3>

                    <SpeciesTapGrid harvests={harvests} onUpdate={setHarvests} />
                </section>

                {/* Notes Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">5</span>
                        Notes
                    </h3>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="How was the spread? Did they finish committed?"
                    />
                </section>

                {/* Rating Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">6</span>
                        Rating
                    </h3>
                    <StarRating value={rating} onChange={setRating} />
                </section>

                {/* Quick Tags Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">7</span>
                        Quick Tags
                    </h3>
                    <QuickTags selected={tags} onChange={setTags} />
                </section>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="fixed bottom-24 right-4 left-4 max-w-md mx-auto h-14 rounded-xl bg-gradient-to-r from-mallard-green to-mallard-green-light text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all md:static md:w-full"
                >
                    <Save className="h-5 w-5" />
                    Save Hunt Log
                </button>
            </form>
        </div >
    );
}

export default function NewHuntLogPage() {
    return (
        <Suspense fallback={<div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>}>
            <NewHuntLogContent />
        </Suspense>
    );
}
