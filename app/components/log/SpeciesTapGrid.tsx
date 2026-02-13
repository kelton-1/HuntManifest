"use client";

import { WATERFOWL_SPECIES, Harvest } from "@/lib/types";
import { Minus, Plus, X } from "lucide-react";

interface SpeciesTapGridProps {
    harvests: Harvest[];
    onUpdate: (harvests: Harvest[]) => void;
}

const SPECIES_EMOJI: Record<string, string> = {
    'Mallard': '🦆',
    'Wood Duck': '🪶',
    'Teal (Green-winged)': '🟢',
    'Teal (Blue-winged)': '🔵',
    'Pintail': '📌',
    'Wigeon': '🍃',
    'Gadwall': '🪿',
    'Canvasback': '🔴',
    'Redhead': '🟤',
    'Ring-necked Duck': '⚫',
    'Scaup': '🌊',
    'Canada Goose': '🇨🇦',
    'Snow Goose': '⬜',
    'Specklebelly (White-fronted)': '🟠',
    'Other': '🐦',
};

export function SpeciesTapGrid({ harvests, onUpdate }: SpeciesTapGridProps) {
    const getCount = (species: string) => {
        const h = harvests.find(h => h.species === species);
        return h?.count ?? 0;
    };

    const handleTap = (species: string) => {
        const existing = harvests.find(h => h.species === species);
        if (existing) {
            onUpdate(harvests.map(h =>
                h.species === species ? { ...h, count: h.count + 1 } : h
            ));
        } else {
            onUpdate([...harvests, { species, count: 1 }]);
        }
    };

    const handleIncrement = (e: React.MouseEvent, species: string) => {
        e.stopPropagation();
        onUpdate(harvests.map(h =>
            h.species === species ? { ...h, count: h.count + 1 } : h
        ));
    };

    const handleDecrement = (e: React.MouseEvent, species: string) => {
        e.stopPropagation();
        const current = getCount(species);
        if (current <= 1) {
            onUpdate(harvests.filter(h => h.species !== species));
        } else {
            onUpdate(harvests.map(h =>
                h.species === species ? { ...h, count: h.count - 1 } : h
            ));
        }
    };

    const handleRemove = (e: React.MouseEvent, species: string) => {
        e.stopPropagation();
        onUpdate(harvests.filter(h => h.species !== species));
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {WATERFOWL_SPECIES.map(species => {
                const count = getCount(species);
                const isSelected = count > 0;

                return (
                    <button
                        key={species}
                        type="button"
                        onClick={() => handleTap(species)}
                        className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 min-h-[120px] min-w-[100px] transition-all active:scale-95 ${
                            isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border bg-card hover:border-primary/50'
                        }`}
                    >
                        {/* Remove button */}
                        {isSelected && (
                            <button
                                type="button"
                                onClick={(e) => handleRemove(e, species)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {/* Emoji */}
                        <span className="text-2xl">{SPECIES_EMOJI[species] || '🐦'}</span>

                        {/* Species name */}
                        <span className={`text-xs text-center leading-tight font-medium ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                            {species}
                        </span>

                        {/* Count controls */}
                        {isSelected && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <button
                                    type="button"
                                    onClick={(e) => handleDecrement(e, species)}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-lg font-bold font-mono w-6 text-center">{count}</span>
                                <button
                                    type="button"
                                    onClick={(e) => handleIncrement(e, species)}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
