"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { WATERFOWL_SPECIES, Harvest, HuntLog } from "@/lib/types";
import { snappy } from "@/lib/motion";
import { hapticLight, hapticMedium } from "@/lib/haptics";

interface SpeciesTapGridProps {
    harvests: Harvest[];
    onUpdate: (harvests: Harvest[]) => void;
    pastLogs?: HuntLog[];
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

export function SpeciesTapGrid({ harvests, onUpdate, pastLogs = [] }: SpeciesTapGridProps) {
    // History-sorted: most-hunted species float to top
    const speciesOrder = useMemo(() => {
        const freq: Record<string, number> = {};
        pastLogs.forEach(log => {
            log.harvests.forEach(h => {
                freq[h.species] = (freq[h.species] || 0) + h.count;
            });
        });
        return [...WATERFOWL_SPECIES].sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
    }, [pastLogs]);

    const getCount = (species: string) => {
        const h = harvests.find(h => h.species === species);
        return h?.count ?? 0;
    };

    const handleTap = (species: string) => {
        const existing = harvests.find(h => h.species === species);
        if (existing) {
            hapticLight();
            onUpdate(harvests.map(h =>
                h.species === species ? { ...h, count: h.count + 1 } : h
            ));
        } else {
            hapticMedium();
            onUpdate([...harvests, { species, count: 1 }]);
        }
    };

    const handleIncrement = (e: React.MouseEvent, species: string) => {
        e.stopPropagation();
        hapticLight();
        onUpdate(harvests.map(h =>
            h.species === species ? { ...h, count: h.count + 1 } : h
        ));
    };

    const handleDecrement = (e: React.MouseEvent, species: string) => {
        e.stopPropagation();
        hapticLight();
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
        hapticLight();
        onUpdate(harvests.filter(h => h.species !== species));
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {speciesOrder.map((species, i) => {
                const count = getCount(species);
                const isSelected = count > 0;

                return (
                    <motion.button
                        key={species}
                        type="button"
                        onClick={() => handleTap(species)}
                        whileTap={{ scale: 0.95 }}
                        transition={snappy}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ transitionDelay: `${i * 30}ms` }}
                        className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 min-h-[120px] transition-colors ${
                            isSelected
                                ? 'bg-card shadow-md'
                                : 'bg-card/50 hover:bg-card'
                        }`}
                    >
                        {/* Gold ring overlay */}
                        {isSelected && (
                            <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-mallard-yellow pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}

                        {/* Remove button */}
                        {isSelected && (
                            <button
                                type="button"
                                onClick={(e) => handleRemove(e, species)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors z-10"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {/* Emoji */}
                        <span className="text-3xl leading-none">{SPECIES_EMOJI[species] || '🐦'}</span>

                        {/* Species name — spec typography */}
                        <span className={`text-[13px] font-medium uppercase tracking-[0.05em] text-center leading-tight ${
                            isSelected ? 'text-mallard-yellow' : 'text-muted-foreground'
                        }`}>
                            {species}
                        </span>

                        {/* Count controls */}
                        {isSelected && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <motion.button
                                    type="button"
                                    onClick={(e) => handleDecrement(e, species)}
                                    whileTap={{ scale: 0.85 }}
                                    transition={snappy}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </motion.button>

                                {/* Animated counter — pulses on change */}
                                <motion.span
                                    key={count}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={snappy}
                                    className="text-[28px] font-bold tabular-nums text-mallard-yellow w-8 text-center leading-none"
                                >
                                    {count}
                                </motion.span>

                                <motion.button
                                    type="button"
                                    onClick={(e) => handleIncrement(e, species)}
                                    whileTap={{ scale: 0.85 }}
                                    transition={snappy}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-mallard-yellow/10 hover:text-mallard-yellow transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </motion.button>
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
