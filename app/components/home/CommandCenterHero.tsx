"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, MapPin, ArrowRight, Sun, Calendar, ShieldCheck, Zap } from "lucide-react";
import { useHuntPlans } from "@/lib/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CommandCenterHero() {
    const router = useRouter();
    const { plans } = useHuntPlans();

    // Derived state: Next upcoming hunt
    const nextHunt = plans
        .filter(p => new Date(p.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    // Mock "Readiness" score based on inventory/profile (placeholder logic for now)
    const readinessScore = 85;

    return (
        <section className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl group">
            {/* Dynamic Background - subtle animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-mallard-green/20 via-background to-background animate-pulse-soft" />

            {/* Content Container */}
            <div className="relative z-10 p-5 space-y-4">

                {/* Header: Date & Status */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Command Center
                        </h1>
                    </div>
                    {/* Readiness Badge */}
                    <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur border border-border px-2.5 py-1 rounded-full">
                        <ShieldCheck className={`h-3.5 w-3.5 ${readinessScore > 80 ? 'text-mallard-green' : 'text-amber-500'}`} />
                        <span className="text-xs font-bold tabular-nums">{readinessScore}% Ready</span>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="grid grid-cols-1 gap-3">
                    {nextHunt ? (
                        <Link href={`/plan/${nextHunt.id}`}>
                            <div className="bg-background/60 backdrop-blur-md rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all group/card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Timer className="h-12 w-12" />
                                </div>

                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-primary tracking-wide">Next Mission</div>
                                        <div className="font-bold text-lg leading-none">{nextHunt.title}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{nextHunt.location.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Timer className="h-3.5 w-3.5" />
                                        <span>In {Math.ceil((new Date(nextHunt.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/plan/new">
                            <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-4 border border-dashed border-border hover:border-primary/50 hover:bg-background/60 transition-all flex items-center justify-between group/empty">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-secondary text-muted-foreground group-hover/empty:bg-primary/10 group-hover/empty:text-primary transition-colors">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">No Upcoming Hunts</div>
                                        <div className="text-xs text-muted-foreground">Plan your next outing</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/empty:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    )}
                </div>

                {/* Quick Stats / Intel Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/40 backdrop-blur-sm rounded-xl p-3 border border-border/30 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                            <Zap className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground font-bold">Activity</div>
                            <div className="text-sm font-bold">High</div>
                        </div>
                    </div>
                    <div className="bg-background/40 backdrop-blur-sm rounded-xl p-3 border border-border/30 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                            <Sun className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground font-bold">Daylight</div>
                            <div className="text-sm font-bold">10h 24m</div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
