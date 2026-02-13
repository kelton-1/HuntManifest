"use client";

import { Bird } from "lucide-react";
import { motion } from "framer-motion";
import { smooth } from "@/lib/motion";
import { SpeciesBreakdownData } from "@/lib/useInsights";
import { InsightCard } from "./InsightCard";

interface SpeciesBreakdownProps {
    data: SpeciesBreakdownData;
}

export function SpeciesBreakdown({ data }: SpeciesBreakdownProps) {
    return (
        <InsightCard title="Species Breakdown" icon={Bird}>
            {/* Species List */}
            <div className="space-y-2.5">
                {data.species.map(sp => (
                    <div key={sp.name} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: sp.colorHex }}
                            />
                            <span className="text-sm font-semibold flex-1">{sp.name}</span>
                            <span className="text-sm font-bold tabular-nums">{sp.count}</span>
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{sp.percentage}%</span>
                        </div>

                        {/* Percentage Bar */}
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden ml-5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${sp.percentage}%` }}
                                transition={{ ...smooth, delay: 0.1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: sp.colorHex }}
                            />
                        </div>

                        {/* Details row */}
                        <div className="flex items-center gap-3 ml-5 text-[10px] text-muted-foreground">
                            {sp.bestLocation && (
                                <span>Best: {sp.bestLocation}</span>
                            )}
                            {(sp.drakeCount > 0 || sp.henCount > 0) && (
                                <span className="font-medium">
                                    {sp.drakeCount}D / {sp.henCount}H
                                    {sp.unknownCount > 0 && ` / ${sp.unknownCount}?`}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Diversity Indicator */}
            <div className="pt-3 border-t border-border/50 text-center">
                <span className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{data.diversityCount}</span>
                    {' '}of {data.totalAvailableSpecies} species harvested
                </span>
            </div>
        </InsightCard>
    );
}
