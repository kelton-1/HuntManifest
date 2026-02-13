"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Navigation, Check, X, Plus, Droplets, Gauge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import { useHuntLogs, useHuntPlans, useInventory } from "@/lib/storage";
import { Harvest, WeatherConditions } from "@/lib/types";
import { useGeolocation, reverseGeocode } from "@/lib/geolocation";
import { fetchWeather } from "@/lib/weatherApi";
import { Thermometer, Wind, Cloud, Sunrise, Sunset } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { SmartInput } from "@/app/components/inventory/SmartInput";
import { ParsedProduct } from "@/lib/services/ProductIntelligenceEngine";
import { HarvestEntry } from "@/app/components/log/HarvestEntry";
import { StarRating } from "@/app/components/log/StarRating";
import { QuickTags } from "@/app/components/log/QuickTags";
import { staggerContainer, staggerChild, smooth, gentle, snappy } from "@/lib/motion";
import { hapticMedium, hapticLight } from "@/lib/haptics";

/** Counting-up animation for temperature display */
function CountUp({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let current = 0;
        const duration = 600;
        const step = Math.max(1, Math.ceil(Math.abs(value) / (duration / 16)));
        const dir = value >= 0 ? 1 : -1;
        const timer = setInterval(() => {
            current += step;
            if (current >= Math.abs(value)) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(current * dir);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <>{display}</>;
}

/** Glass section card wrapper with stagger animation */
function GlassSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.section
            variants={staggerChild}
            className={`glass-section rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
        >
            {children}
        </motion.section>
    );
}

function NewHuntLogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");

    const { logs, addLog } = useHuntLogs();
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

    // Weather State
    const [weather, setWeather] = useState<WeatherConditions>({
        temperature: 0,
        windSpeed: 0,
        windDirection: "N",
        skyCondition: "Partly Cloudy",
    });
    const [weatherEditing, setWeatherEditing] = useState(false);

    // Harvest State
    const [harvests, setHarvests] = useState<Harvest[]>([]);

    // Rating & Tags
    const [rating, setRating] = useState<number>(0);
    const [tags, setTags] = useState<string[]>([]);

    // Gear State
    const [gearUsed, setGearUsed] = useState<{ id: string; name: string }[]>([]);
    const [showGearAdd, setShowGearAdd] = useState(false);

    // Recent gear from inventory for quick-select chips
    const recentGear = useMemo(() => {
        return inventory
            .filter(item => item.status === 'READY' || item.status === 'PACKED')
            .slice(0, 12);
    }, [inventory]);

    const removeGear = (id: string) => {
        setGearUsed(prev => prev.filter(g => g.id !== id));
    };

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
        addItem(newItem);
        setGearUsed(prev => [...prev, { id: newItem.id, name: newItem.name }]);
        setShowGearAdd(false);
    }, [addItem]);

    // Pre-fill from Plan
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (planId && plans.length > 0) {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                if (plan.date) setDate(prev => prev === new Date().toISOString().split("T")[0] ? new Date(plan.date).toISOString().split("T")[0] : prev);
                if (plan.location?.name) setLocationName(prev => !prev ? plan.location.name : prev);
                if (plan.weather) {
                    setWeather(prev => ({ ...prev, ...plan.weather! }));
                }
                if (plan.gear) {
                    setGearUsed(prev => prev.length === 0 ? plan.gear.map(g => ({ id: g.id, name: g.name })) : prev);
                }
                if (plan.title) {
                    setNotes(prev => {
                        if (prev.includes(`Plan: ${plan.title}`)) return prev;
                        return prev ? `${prev}\n\nPlan: ${plan.title}` : `Executed Plan: ${plan.title}`;
                    });
                }
            }
        }
    }, [planId, plans]);

    // Auto-fill GPS + Weather
    const runAutoFill = useCallback(async () => {
        setAutoFillLoading(true);
        const position = await getCurrentPosition();
        if (position) {
            setLocationCoords({ lat: position.latitude, lng: position.longitude });
            const weatherResult = await fetchWeather(position.latitude, position.longitude);
            if (weatherResult.success) {
                setWeather(weatherResult.data);
            }
            const placeName = await reverseGeocode(position.latitude, position.longitude);
            if (placeName) {
                setLocationName(prev => prev || placeName);
            }
            setAutoFillDone(true);
        }
        setAutoFillLoading(false);
    }, [getCurrentPosition]);

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

        router.replace("/log");

        if (locationName) {
            await addSavedLocation(locationName);
        }
    };

    const totalBirds = harvests.reduce((sum, h) => sum + h.count, 0);

    return (
        <div className="pb-28">
            {/* Header */}
            <header className="mb-6 flex items-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    transition={snappy}
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </motion.button>
                <div>
                    <h1 className="text-xl font-bold">New Hunt Log</h1>
                    <p className="text-xs text-muted-foreground">
                        {planId ? "Imported from Plan" : "Record your hunt details"}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                >
                    {/* Auto-Fill Status */}
                    <AnimatePresence mode="wait">
                        {autoFillLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={smooth}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-3.5 font-semibold border border-primary/20"
                            >
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Getting Location & Weather...
                            </motion.div>
                        ) : !autoFillDone ? (
                            <motion.button
                                key="retry"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={smooth}
                                type="button"
                                onClick={runAutoFill}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-3.5 font-semibold border border-primary/20 hover:bg-primary/20 transition-all"
                            >
                                <Navigation className="h-5 w-5" />
                                Auto-Fill with GPS & Weather
                            </motion.button>
                        ) : null}
                    </AnimatePresence>

                    {/* Section 1: General Info */}
                    <GlassSection>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">General Info</h3>
                        <div className="space-y-3">
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
                    </GlassSection>

                    {/* Section 2: Weather Confirmation / Edit */}
                    <GlassSection>
                        {autoFillDone && !weatherEditing ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={gentle}
                                className="space-y-4"
                            >
                                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Conditions</h3>
                                <p className="text-sm leading-relaxed">
                                    {locationName ? (
                                        <>Looks like you hunted at <strong>{locationName}</strong> today, </>
                                    ) : (
                                        <>Today&apos;s conditions: </>
                                    )}
                                    <span className="text-mallard-yellow font-bold">
                                        <CountUp value={weather.temperature} />°F
                                    </span>
                                    , {weather.windDirection} wind{' '}
                                    <span className="font-semibold">{weather.windSpeed}mph</span>,{' '}
                                    {weather.skyCondition.toLowerCase()}.
                                    {weather.humidity != null && (
                                        <> Humidity <span className="font-semibold">{weather.humidity}%</span>.</>
                                    )}
                                    {weather.barometricPressure != null && (
                                        <> Pressure <span className="font-semibold">{weather.barometricPressure}&quot; Hg</span>.</>
                                    )}
                                </p>

                                {(weather.sunrise || weather.sunset) && (
                                    <div className="flex gap-4 text-xs text-muted-foreground">
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

                                <div className="flex gap-3">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        transition={snappy}
                                        onClick={() => hapticMedium()}
                                        className="flex-1 py-3 rounded-xl bg-mallard-green text-white font-semibold flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check className="h-4 w-4" />
                                        Looks Right
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        transition={snappy}
                                        onClick={() => setWeatherEditing(true)}
                                        className="px-5 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                                    >
                                        Edit
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Conditions</h3>
                                    {weatherEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setWeatherEditing(false)}
                                            className="text-xs text-primary font-medium"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Thermometer className="h-3 w-3" /> Temp (°F)
                                        </label>
                                        <input
                                            type="number"
                                            value={weather.temperature || ''}
                                            onChange={e => setWeather({ ...weather, temperature: parseInt(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Wind className="h-3 w-3" /> Wind (mph)
                                        </label>
                                        <input
                                            type="number"
                                            value={weather.windSpeed || ''}
                                            onChange={e => setWeather({ ...weather, windSpeed: parseInt(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground">Direction</label>
                                        <select
                                            value={weather.windDirection}
                                            onChange={e => setWeather({ ...weather, windDirection: e.target.value })}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Cloud className="h-3 w-3" /> Sky
                                        </label>
                                        <select
                                            value={weather.skyCondition}
                                            onChange={e => setWeather({ ...weather, skyCondition: e.target.value as WeatherConditions['skyCondition'] })}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {['Clear', 'Partly Cloudy', 'Overcast', 'Rain', 'Snow', 'Fog'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Droplets className="h-3 w-3" /> Humidity (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={weather.humidity ?? ''}
                                            onChange={e => setWeather({ ...weather, humidity: parseInt(e.target.value) || undefined })}
                                            placeholder="Auto"
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                                            <Gauge className="h-3 w-3" /> Pressure (inHg)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={weather.barometricPressure ?? ''}
                                            onChange={e => setWeather({ ...weather, barometricPressure: parseFloat(e.target.value) || undefined })}
                                            placeholder="Auto"
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>
                                {(weather.sunrise || weather.sunset) && (
                                    <div className="flex gap-4 text-xs text-muted-foreground">
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
                            </div>
                        )}
                    </GlassSection>

                    {/* Section 3: Harvest — Tap Grid */}
                    <GlassSection>
                        <div className="flex items-center justify-between">
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Harvest</h3>
                            {totalBirds > 0 && (
                                <motion.span
                                    key={totalBirds}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={snappy}
                                    className="px-2.5 py-1 bg-mallard-yellow/20 text-mallard-yellow rounded-full text-xs font-bold tabular-nums"
                                >
                                    {totalBirds} {totalBirds === 1 ? 'bird' : 'birds'}
                                </motion.span>
                            )}
                        </div>
                        <HarvestEntry harvests={harvests} onUpdate={setHarvests} />
                    </GlassSection>

                    {/* Section 4: Notes */}
                    <GlassSection>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Notes</h3>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="How was the spread? Did they finish committed?"
                        />
                    </GlassSection>

                    {/* Section 5: Rating */}
                    <GlassSection>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Rating</h3>
                        <StarRating value={rating} onChange={setRating} />
                    </GlassSection>

                    {/* Section 6: Quick Tags */}
                    <GlassSection>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Quick Tags</h3>
                        <QuickTags selected={tags} onChange={setTags} />
                    </GlassSection>

                    {/* Section 7: Gear — Quick-Select Chips */}
                    <GlassSection>
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">Gear Used</h3>

                        {recentGear.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {recentGear.map(item => {
                                    const isSelected = gearUsed.some(g => g.id === item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            type="button"
                                            whileTap={{ scale: 0.93 }}
                                            transition={snappy}
                                            onClick={() => {
                                                hapticLight();
                                                if (isSelected) {
                                                    removeGear(item.id);
                                                } else {
                                                    setGearUsed(prev => [...prev, { id: item.id, name: item.name }]);
                                                }
                                            }}
                                            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${isSelected
                                                ? 'bg-mallard-green text-white shadow-sm'
                                                : 'bg-transparent text-muted-foreground border border-border hover:border-mallard-green/50'
                                                }`}
                                        >
                                            {isSelected && <Check className="h-3.5 w-3.5" />}
                                            {item.name}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No gear in inventory yet</p>
                        )}

                        {/* Add new gear */}
                        {showGearAdd ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] text-muted-foreground">Add new gear</span>
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
                                className="w-full py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-mallard-green hover:text-mallard-green transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add new gear
                            </button>
                        )}
                    </GlassSection>

                    {/* Submit Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        transition={snappy}
                        type="submit"
                        className="fixed bottom-24 right-4 left-4 max-w-md mx-auto h-14 rounded-xl bg-gradient-to-r from-mallard-green to-mallard-green-light text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-shadow md:static md:w-full"
                    >
                        <Save className="h-5 w-5" />
                        Save Hunt Log
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}

export default function NewHuntLogPage() {
    return (
        <Suspense fallback={<div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>}>
            <NewHuntLogContent />
        </Suspense>
    );
}
