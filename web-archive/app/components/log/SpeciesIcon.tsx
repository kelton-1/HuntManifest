"use client";

import { useMemo } from "react";
import { SPECIES_DATA } from "@/lib/species-data";

interface SpeciesIconProps {
    id: string; // Species ID or name (will try to match)
    className?: string;
    size?: number; // Pixel size (default 40-ish via class if not set)
}

export function SpeciesIcon({ id, className = "w-10 h-10", size }: SpeciesIconProps) {
    // Lookup species colors
    const speciesInfo = useMemo(() => {
        // Try to match by ID first, then by Name (case insensitive)
        const match = SPECIES_DATA.find(s => s.id === id) ||
            SPECIES_DATA.find(s => s.name.toLowerCase() === id.toLowerCase());
        return match || SPECIES_DATA.find(s => s.id === 'other');
    }, [id]);

    const colors = speciesInfo?.colors || ['#52525b', '#a1a1aa', '#d4d4d8'];

    const style = size ? { width: size, height: size } : {};

    return (
        <div
            className={`relative rounded-lg overflow-hidden shrink-0 ${className}`}
            style={style}
            role="img"
            aria-label={`${speciesInfo?.name || 'Species'} Icon`}
        >
            {/* Geometric Layout: Square made of 3 rectangles 
                - Rect 1: Top Half (Head/Primary)
                - Rect 2: Bottom Left (Chest/Secondary)
                - Rect 3: Bottom Right (Body/Tertiary)
            */}
            <div className="absolute inset-0 flex flex-col">
                {/* Top Rectangle (50% height) */}
                <div
                    className="h-1/2 w-full"
                    style={{ backgroundColor: colors[0] }}
                />

                {/* Bottom Row (50% height) */}
                <div className="h-1/2 w-full flex">
                    {/* Bottom Left (50% width) */}
                    <div
                        className="h-full w-1/2"
                        style={{ backgroundColor: colors[1] }}
                    />
                    {/* Bottom Right (50% width) */}
                    <div
                        className="h-full w-1/2"
                        style={{ backgroundColor: colors[2] }}
                    />
                </div>
            </div>
        </div>
    );
}
