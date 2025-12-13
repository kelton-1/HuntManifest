"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, MapPin, Loader2, Navigation, Package, Check, History } from "lucide-react";
import { useHuntLogs, useHuntPlans } from "@/lib/storage";
import { Harvest, WATERFOWL_SPECIES, WeatherConditions } from "@/lib/types";
import { useGeolocation, reverseGeocode } from "@/lib/geolocation";
import { fetchWeather } from "@/lib/weatherApi";
import { Thermometer, Wind, Cloud, Bird, ChevronDown, ChevronUp } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";

function NewHuntLogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");

    const { addLog } = useHuntLogs();
    const { plans, updatePlan } = useHuntPlans();
    const { getCurrentPosition } = useGeolocation();
    const { profile, addSavedLocation } = useUserProfile();

    // Location suggestions visibility
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [locationName, setLocationName] = useState("");
    const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [notes, setNotes] = useState("");
    const [autoFillLoading, setAutoFillLoading] = useState(false);

    // Weather State
    const [weather, setWeather] = useState<WeatherConditions>({
        temperature: 40,
        windSpeed: 5,
        windDirection: "N",
        skyCondition: "Partly Cloudy",
    });

    // Harvest State
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState(WATERFOWL_SPECIES[0]);

    // Gear State
    const [gearUsed, setGearUsed] = useState<{ id: string; name: string }[]>([]);

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

    // Real Auto-Fill with GPS + Weather
    const handleAutoFill = async () => {
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
            if (placeName && !locationName) {
                setLocationName(placeName);
            }
        }

        setAutoFillLoading(false);
    };

    const addHarvest = () => {
        setHarvests(prev => {
            const existing = prev.find(h => h.species === selectedSpecies);
            if (existing) {
                return prev.map(h => h.species === selectedSpecies ? { ...h, count: h.count + 1 } : h);
            }
            return [...prev, { species: selectedSpecies, count: 1 }];
        });
    };

    const removeHarvest = (species: string) => {
        setHarvests(prev => {
            return prev.map(h => {
                if (h.species === species) {
                    return { ...h, count: Math.max(0, h.count - 1) };
                }
                return h;
            }).filter(h => h.count > 0);
        });
    };

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
                {/* Auto-Fill Button */}
                <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={autoFillLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-3.5 font-semibold border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                    {autoFillLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Getting Location & Weather...
                        </>
                    ) : (
                        <>
                            <Navigation className="h-5 w-5" />
                            Auto-Fill with GPS & Weather
                        </>
                    )}
                </button>

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
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Location Name (or use Auto-Fill)"
                                value={locationName}
                                onChange={e => setLocationName(e.target.value)}
                                onFocus={() => setShowLocationSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm pl-11 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
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
                                                setLocationName(loc);
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
                                value={weather.temperature}
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
                                value={weather.windSpeed}
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
                    </div>
                </section>

                {/* Gear Section */}
                <section className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">3</span>
                        Gear Used
                        <span className="ml-auto px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs font-bold">
                            {gearUsed.length} items
                        </span>
                    </h3>

                    {gearUsed.length > 0 ? (
                        <div className="bg-card border border-border rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                            {gearUsed.map((g, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{g.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic px-4">
                            No gear selected.
                            {planId ? " (This plan had no gear)" : ""}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground px-1">
                        * Gear editing in logs coming soon. For now, use Plans to track gear usage properly.
                    </p>
                </section>

                {/* Harvest Section */}
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

                    <div className="flex gap-2">
                        <select
                            value={selectedSpecies}
                            onChange={e => setSelectedSpecies(e.target.value)}
                            className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {WATERFOWL_SPECIES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={addHarvest}
                            className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                            + Add
                        </button>
                    </div>

                    <div className="space-y-2">
                        {harvests.map(h => (
                            <div key={h.species} className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <Bird className="h-5 w-5 text-mallard-yellow" />
                                    <span className="font-medium">{h.species}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => removeHarvest(h.species)}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center font-mono">{h.count}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHarvests(prev => prev.map(item =>
                                                item.species === h.species ? { ...item, count: item.count + 1 } : item
                                            ));
                                        }}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {harvests.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6 italic">
                                No birds logged yet
                            </p>
                        )}
                    </div>
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
