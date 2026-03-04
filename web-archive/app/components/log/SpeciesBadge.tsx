"use client";

import { motion } from "framer-motion";
import { SPECIES_DATA } from "@/lib/species-data";
import { useMemo } from "react";
import { SpeciesIcon } from "./SpeciesIcon";

interface SpeciesBadgeProps {
    id: string; // Species ID (e.g., 'mallard', 'wood_duck')
    name: string;
    isSelected: boolean;
    onClick?: () => void;
    className?: string;
}

export function SpeciesBadge({ id, name, isSelected, onClick, className = "" }: SpeciesBadgeProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-center gap-2 group ${className}`}
        >
            {/* Geometric Icon Container */}
            <div className={`relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${isSelected
                    ? "ring-4 ring-mallard-green ring-offset-2 ring-offset-background"
                    : "ring-1 ring-border opacity-90 hover:opacity-100 hover:ring-2 hover:ring-muted-foreground/30"
                }`}>
                <SpeciesIcon id={id} className="w-full h-full rounded-none" />

                {/* Selection Overlay (Optional Gloss/Sheen) */}
                {isSelected && (
                    <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                )}

                {/* Selected Checkmark Badge */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-mallard-green/90 rounded-full p-1.5 shadow-sm backdrop-blur-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-medium leading-tight max-w-[70px] text-center transition-colors ${isSelected ? "text-mallard-green font-bold" : "text-muted-foreground group-hover:text-foreground"
                }`}>
                {name}
            </span>
        </motion.button>
    );
}
