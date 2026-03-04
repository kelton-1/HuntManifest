"use client";

import { useHuntLogs, useHuntPlans } from "@/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, CloudSun, Bird, Trash2, Share2, Check, Sparkles, Wind, Droplets, Gauge, Sunrise, Sunset, Thermometer, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useUserProfile } from "@/lib/useUserProfile";
import { formatTemperature, formatWindSpeed } from "@/lib/formatting";
import { analyzeHuntLog } from "@/lib/gemini";
import { useState } from "react";
import { staggerContainer, staggerChild, snappy } from "@/lib/motion";
import { SpeciesIcon } from "@/app/components/log/SpeciesIcon";

export default function HuntDetailClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logs, loading, deleteLog } = useHuntLogs();
    const { plans } = useHuntPlans();
    const { profile } = useUserProfile();

    const id = searchParams.get("id") || "";
    const log = id ? logs.find(l => l.id === id) : undefined;

    // AI Analysis state
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Find linked plan if any
    const linkedPlan = log?.planId ? plans.find(p => p.id === log.planId) : null;

    if (loading || !id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!log) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">
                <p>Hunt log not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm("Delete this hunt log? This cannot be undone.")) {
            await deleteLog(log.id);
            router.replace("/log");
        }
    };

    const totalBirds = log.harvests.reduce((sum, h) => sum + h.count, 0);

    return (
        <div className="pb-24 min-h-screen bg-background relative">
            {/* Header with Hero Image/Gradient */}
            <div className="h-48 bg-gradient-to-br from-mallard-green to-mallard-green-light relative">
                <div className="absolute inset-0 bg-black/20" />
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    transition={snappy}
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm z-20"
                >
                    <ArrowLeft className="h-5 w-5" />
                </motion.button>
                <div className="absolute bottom-4 left-4 text-white z-20">
                    <h1 className="text-2xl font-bold drop-shadow-md">{log.location?.name || "Unknown Location"}</h1>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                        <Calendar className="h-4 w-4" />
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="p-4 space-y-6 -mt-6 relative z-10"
            >
                {/* Linked Plan Badge */}
                {linkedPlan && (
                    <motion.div
                        variants={staggerChild}
                        onClick={() => router.push(`/plan/detail?id=${linkedPlan.id}`)}
                        className="bg-background/95 backdrop-blur border border-mallard-yellow/50 rounded-xl p-3 flex items-center justify-between shadow-lg cursor-pointer hover:bg-background/100 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-mallard-yellow/20 flex items-center justify-center">
                                <Check className="h-5 w-5 text-mallard-yellow" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Executed Plan</p>
                                <p className="font-semibold text-sm">{linkedPlan.title}</p>
                            </div>
                        </div>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                )}

                {/* Harvest Hero */}
                <motion.div
                    variants={staggerChild}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4"
                >
                    <div className="h-14 w-14 rounded-xl bg-mallard-yellow/15 flex items-center justify-center flex-shrink-0">
                        <Bird className="h-7 w-7 text-mallard-yellow" />
                    </div>
                    <div>
                        <span className="text-3xl font-bold tabular-nums text-mallard-yellow">{totalBirds}</span>
                        <span className="text-sm text-muted-foreground ml-2">{totalBirds === 1 ? 'bird' : 'birds'} harvested</span>
                        {log.harvests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {log.harvests.map(h => (
                                    <span key={h.species} className="inline-flex items-center gap-1.5 bg-secondary/50 rounded-md px-2 py-1 text-xs text-foreground/80">
                                        <SpeciesIcon id={h.species} size={14} className="rounded-sm" />
                                        <span>{h.count} {h.species}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Star Rating */}
                {log.rating != null && log.rating > 0 && (
                    <motion.div variants={staggerChild} className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <motion.div
                                key={star}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    ...snappy,
                                    delay: (star - 1) * 0.06,
                                }}
                            >
                                <Star
                                    className={`h-6 w-6 ${star <= log.rating!
                                        ? 'fill-mallard-yellow text-mallard-yellow'
                                        : 'text-muted-foreground/20'
                                        }`}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Tags */}
                {log.tags && log.tags.length > 0 && (
                    <motion.div variants={staggerChild} className="flex flex-wrap gap-2">
                        {log.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-mallard-green text-white"
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* Weather Conditions */}
                <motion.div variants={staggerChild} className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Conditions</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                            <Thermometer className="h-4 w-4 text-sky-500" />
                            <span className="text-lg font-bold tabular-nums">{formatTemperature(log.weather.temperature, profile.temperatureUnit)}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Temp</span>
                        </div>
                        <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                            <Wind className="h-4 w-4 text-sky-500" />
                            <span className="text-lg font-bold tabular-nums">{formatWindSpeed(log.weather.windSpeed, profile.windSpeedUnit)}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{log.weather.windDirection} wind</span>
                        </div>
                        <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                            <CloudSun className="h-4 w-4 text-sky-500" />
                            <span className="text-sm font-bold text-center leading-tight">{log.weather.skyCondition}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">Sky</span>
                        </div>
                        {log.weather.humidity != null && (
                            <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                                <Droplets className="h-4 w-4 text-blue-400" />
                                <span className="text-lg font-bold tabular-nums">{log.weather.humidity}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Humidity</span>
                            </div>
                        )}
                        {log.weather.barometricPressure != null && (
                            <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                                <Gauge className="h-4 w-4 text-blue-400" />
                                <span className="text-lg font-bold tabular-nums">{log.weather.barometricPressure}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">inHg</span>
                            </div>
                        )}
                        {(log.weather.sunrise || log.weather.sunset) && (
                            <div className="glass-section rounded-xl p-3 flex flex-col items-center gap-1">
                                {log.weather.sunrise && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <Sunrise className="h-3 w-3 text-amber-400" />
                                        <span className="font-medium">{log.weather.sunrise}</span>
                                    </div>
                                )}
                                {log.weather.sunset && (
                                    <div className="flex items-center gap-1 text-xs">
                                        <Sunset className="h-3 w-3 text-orange-400" />
                                        <span className="font-medium">{log.weather.sunset}</span>
                                    </div>
                                )}
                                <span className="text-[10px] text-muted-foreground uppercase">Sun</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Harvesting Details */}
                <motion.div variants={staggerChild} className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Harvest Details</h2>
                    <div className="glass-section rounded-xl divide-y divide-border/50 !p-0 overflow-hidden">
                        {log.harvests.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <SpeciesIcon id={h.species} size={40} className="rounded-lg shadow-sm" />
                                    <span className="font-medium">{h.species}</span>
                                </div>
                                <span className="tabular-nums font-bold text-mallard-yellow text-lg">{h.count}</span>
                            </div>
                        ))}
                        {log.harvests.length === 0 && (
                            <div className="p-4 text-center text-muted-foreground italic">No harvest recorded</div>
                        )}
                    </div>
                </motion.div>

                {/* Gear Used */}
                {log.gear && log.gear.length > 0 && (
                    <motion.div variants={staggerChild} className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gear Used</h2>
                        <div className="flex flex-wrap gap-2">
                            {log.gear.map((g, i) => (
                                <div key={i} className="bg-mallard-green/10 text-mallard-green dark:bg-mallard-green dark:text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5" />
                                    {g.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Notes */}
                {log.notes && (
                    <motion.div variants={staggerChild} className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Notes</h2>
                        <div className="glass-section rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {log.notes}
                        </div>
                    </motion.div>
                )}

                {/* AI Hunt Analysis */}
                <motion.div variants={staggerChild} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Analysis
                        </h2>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                        {aiLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                Analyzing your hunt...
                            </div>
                        ) : aiAnalysis ? (
                            <p className="text-sm leading-relaxed">{aiAnalysis}</p>
                        ) : (
                            <button
                                onClick={async () => {
                                    setAiLoading(true);
                                    try {
                                        const analysis = await analyzeHuntLog(
                                            log.location?.name || "Unknown",
                                            {
                                                temperature: log.weather.temperature,
                                                windSpeed: log.weather.windSpeed,
                                                skyCondition: log.weather.skyCondition,
                                                humidity: log.weather.humidity,
                                                barometricPressure: log.weather.barometricPressure,
                                            },
                                            log.harvests,
                                            log.notes
                                        );
                                        setAiAnalysis(analysis);
                                    } catch (e) {
                                        console.error("AI error:", e);
                                        const error = e as Error;
                                        if (error.message === 'RATE_LIMIT') {
                                            setAiAnalysis("Rate limit reached. Please wait a moment and try again.");
                                        } else {
                                            setAiAnalysis("Unable to analyze. Please try again.");
                                        }
                                    }
                                    setAiLoading(false);
                                }}
                                className="w-full py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                Analyze This Hunt
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Actions Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50 flex gap-4">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    transition={snappy}
                    onClick={handleDelete}
                    className="flex-1 h-12 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Log
                </motion.button>
                <button
                    disabled
                    className="flex-1 h-12 rounded-xl bg-secondary text-muted-foreground font-bold text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                    <Share2 className="h-4 w-4" />
                    Share (Soon)
                </button>
            </div>
        </div >
    );
}
