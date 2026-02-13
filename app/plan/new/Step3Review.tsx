"use client";

import { PlanGearItem, InventoryCategory } from "@/lib/types";
import { Check, Calendar, MapPin, Package, Cloud, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { PlanContextData } from "./Step1Context";
import { getHuntingSuitability } from "@/lib/huntingSuitability";
import { CategoryIcon } from "@/app/components/CategoryIcon";

interface Step3Props {
    data: PlanContextData;
    gear: PlanGearItem[];
    notes: string;
    setNotes: (notes: string) => void;
    onSave: () => void;
    onBackToGear: () => void;
}

export function Step3Review({ data, gear, notes, setNotes, onSave, onBackToGear }: Step3Props) {
    const [saving, setSaving] = useState(false);

    const handleSaveClick = async () => {
        setSaving(true);
        await onSave();
    };

    // Group gear by category
    const gearByCategory = gear.reduce<Record<string, PlanGearItem[]>>((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const suitability = data.weather ? getHuntingSuitability(data.weather) : null;
    const hasAmmo = gear.some((g) => g.category === "Ammo");

    return (
        <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold">Review Plan</h2>

            {/* Summary Card */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                {data.title && (
                    <h3 className="font-bold text-lg">{data.title}</h3>
                )}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-bold uppercase">Date</div>
                        <div className="font-semibold">
                            {data.date ? new Date(data.date).toLocaleDateString() : "Not set"}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-bold uppercase">Location</div>
                        <div className="font-semibold">{data.locationName || "Current Location"}</div>
                    </div>
                </div>

                {/* Weather Preview */}
                {data.weather && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-sky-500/10 rounded-full flex items-center justify-center">
                                <Cloud className="h-5 w-5 text-sky-500" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">
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

                {/* Species */}
                {data.species && data.species.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground font-bold uppercase mb-2">Target Species</div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.species.map((sp) => (
                                <span key={sp} className="px-2 py-0.5 bg-secondary rounded-full text-xs font-medium">
                                    {sp}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Gear List grouped by category */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground font-bold uppercase">Gear List</div>
                        <div className="font-semibold">{gear.length} Items Selected</div>
                    </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {Object.entries(gearByCategory).map(([category, items]) => (
                        <div key={category}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <CategoryIcon category={category as InventoryCategory} className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">
                                    {category}
                                </span>
                            </div>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm py-1.5 pl-6 border-b border-border/30 last:border-0"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                    {gear.length === 0 && (
                        <p className="text-muted-foreground text-sm italic">No gear selected</p>
                    )}
                </div>

                {/* Ammo suggestion */}
                {!hasAmmo && gear.length > 0 && (
                    <button
                        onClick={onBackToGear}
                        className="mt-3 flex items-center gap-2 text-amber-500 text-xs font-medium hover:underline"
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Most plans include ammo — add some?
                    </button>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-sm font-bold ml-1">
                    Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Blind setup instructions, meetup time, etc."
                    rows={3}
                    className="input w-full resize-none"
                />
            </div>

            <button
                onClick={handleSaveClick}
                disabled={saving}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
                {saving ? "Creating Plan..." : "Confirm & Create Plan"}
                {!saving && <Check className="h-5 w-5" />}
            </button>
        </div>
    );
}
