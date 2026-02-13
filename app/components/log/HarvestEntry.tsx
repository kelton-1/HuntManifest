"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Bird, Filter } from "lucide-react";
import { Harvest } from "@/lib/types";
import { SPECIES_DATA, SPECIES_WHEEL_DEFAULTS, SpeciesCategory } from "@/lib/species-data";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { snappy } from "@/lib/motion";
import { SpeciesBadge } from "./SpeciesBadge";

interface HarvestEntryProps {
    harvests: Harvest[];
    onUpdate: (harvests: Harvest[]) => void;
}

export function HarvestEntry({ harvests, onUpdate }: HarvestEntryProps) {
    const [isFullListOpen, setIsFullListOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<SpeciesCategory | 'All'>('All');

    // Quick Picks Data
    const quickPicks = useMemo(() => {
        return SPECIES_DATA.filter(s => SPECIES_WHEEL_DEFAULTS.includes(s.name));
    }, []);

    // Helper to get current count
    const getCount = (name: string) => {
        return harvests.find(h => h.species === name)?.count || 0;
    };

    // Body scroll lock
    useEffect(() => {
        if (isFullListOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullListOpen]);

    // Handler: Add/Increment
    const handleIncrement = (speciesName: string) => {
        hapticMedium();

        const existing = harvests.find(h => h.species === speciesName);
        if (existing) {
            hapticLight();
            onUpdate(harvests.map(h => h.species === speciesName ? { ...h, count: h.count + 1 } : h));
        } else {
            hapticMedium();
            onUpdate([...harvests, { species: speciesName, count: 1 }]);
        }
    };

    // Handler: Decrement
    const handleDecrement = (speciesName: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        hapticLight();
        const current = getCount(speciesName);
        if (current <= 1) {
            onUpdate(harvests.filter(h => h.species !== speciesName));
        } else {
            onUpdate(harvests.map(h => h.species === speciesName ? { ...h, count: h.count - 1 } : h));
        }
    };

    // Filtered Full List
    const filteredSpecies = useMemo(() => {
        return SPECIES_DATA.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    // Group by Category for the View
    const groupedSpecies = useMemo(() => {
        const groups: Record<string, typeof SPECIES_DATA> = {};
        filteredSpecies.forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });
        return groups;
    }, [filteredSpecies]);

    return (
        <div className="space-y-4">
            {/* Quick Picks Row */}
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {quickPicks.map(species => {
                    const count = getCount(species.name);
                    const isSelected = count > 0;

                    return (
                        <div key={species.id} className="relative snap-start shrink-0">
                            <SpeciesBadge
                                id={species.id}
                                name={species.name}
                                isSelected={isSelected}
                                onClick={() => handleIncrement(species.name)}
                                className=""
                            />
                            {/* Count Badge on Quick Pick */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-mallard-yellow text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white"
                                >
                                    {count}
                                </motion.div>
                            )}
                        </div>
                    );
                })}

                {/* 'More' Button */}
                <button
                    type="button"
                    onClick={() => setIsFullListOpen(true)}
                    className="flex flex-col items-center gap-2 shrink-0 snap-start mt-1"
                >
                    <div className="w-16 h-16 rounded-2xl bg-secondary/30 border border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
                        <Search className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">Browse All</span>
                </button>
            </div>

            {/* Selected Summary (Bottom of card) */}
            {harvests.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        {harvests.map(h => (
                            <motion.button
                                layout
                                key={h.species}
                                onClick={() => handleDecrement(h.species)}
                                className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-mallard-green/10 text-mallard-green text-xs font-semibold rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors group"
                            >
                                <span>{h.species}</span>
                                <span className="bg-mallard-green text-white px-1.5 py-0.5 rounded-md text-[10px] min-w-[18px] text-center group-hover:bg-destructive group-hover:text-white transition-colors">
                                    {h.count}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
                        Tap a chip above to add. Tap a tag below to remove/decrement.
                    </p>
                </div>
            )}

            {/* Full List Modal / Slide-over */}
            <AnimatePresence>
                {isFullListOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={snappy}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-14 pb-4 border-b border-border/50">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Select Species</h2>
                                <p className="text-sm text-muted-foreground">Log your harvest</p>
                            </div>
                            <button
                                onClick={() => setIsFullListOpen(false)}
                                className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    autoFocus
                                    type="search"
                                    placeholder="Search species..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:bg-background focus:border-primary transition-all outline-none appearance-none"
                                />
                            </div>

                            {/* Category Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                {['All', 'Puddle', 'Diver', 'Goose', 'Other'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat as any)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
                            {Object.entries(groupedSpecies).map(([category, list]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/30 pb-2">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {list.map(species => {
                                            const count = getCount(species.name);
                                            const isSelected = count > 0;
                                            return (
                                                <button
                                                    key={species.id}
                                                    onClick={() => handleIncrement(species.name)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected
                                                        ? 'bg-mallard-green/10 border-mallard-green'
                                                        : 'bg-card border-border hover:border-border/80'
                                                        }`}
                                                >
                                                    {/* Mini Badge */}
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-mallard-green text-white' : 'bg-secondary text-muted-foreground'
                                                        }`}>
                                                        <Bird className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex-1 text-left">
                                                        <div className={`text-sm font-semibold ${isSelected ? 'text-mallard-green' : 'text-foreground'}`}>
                                                            {species.name}
                                                        </div>
                                                        {isSelected && (
                                                            <div className="text-[10px] text-muted-foreground font-medium">
                                                                {count} selected
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isSelected && (
                                                        <div className="h-6 w-6 rounded-full bg-mallard-green text-white flex items-center justify-center text-xs font-bold">
                                                            {count}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {filteredSpecies.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>No species found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
