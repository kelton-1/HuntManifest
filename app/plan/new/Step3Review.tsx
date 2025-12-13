"use client";

import { PlanGearItem } from "@/lib/types";
import { Check, Calendar, MapPin, Package } from "lucide-react";
import { useState } from "react";
import { PlanContextData } from "./Step1Context";

interface Step3Props {
    data: PlanContextData;
    gear: PlanGearItem[];
    onSave: () => void;
}

export function Step3Review({ data, gear, onSave }: Step3Props) {
    const [saving, setSaving] = useState(false);

    const handleSaveClick = async () => {
        setSaving(true);
        await onSave(); // Parent handles redirect
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold">Review Plan</h2>

            <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-bold uppercase">Date</div>
                            <div className="font-semibold">{data.date ? new Date(data.date).toLocaleDateString() : 'Not set'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-bold uppercase">Location</div>
                            <div className="font-semibold">{data.locationName || 'Current Location'}</div>
                        </div>
                    </div>
                </div>

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

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {gear.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                                <span>{item.name}</span>
                                <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                            </div>
                        ))}
                        {gear.length === 0 && <p className="text-muted-foreground text-sm italic">No gear selected</p>}
                    </div>
                </div>
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
