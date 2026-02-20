"use client";

import Link from "next/link";
import { MapPin, Calendar, ArrowRight, User } from "lucide-react";
import { WeatherConditions, HuntLog, HuntPlan } from "@/lib/types";
import { getHuntingSuitability } from "@/lib/huntingSuitability";
import { UnifiedUserProfile } from "@/lib/useUserProfile";
import { GlowCard } from "@/app/components/GlowCard";

interface CommandCenterHeroProps {
    weather?: WeatherConditions | null;
    logs: HuntLog[];
    plans: HuntPlan[];
    profile: UnifiedUserProfile;
}

type HeroContent = {
    mode: "upcoming" | "favorable" | "default";
    greeting: string;
    name: string;
    subtitle: string;
    cta?: { label: string; href: string };
    planTitle?: string;
    planLocation?: string;
    daysAway?: number;
};

function getHeroContent(
    hunterName: string,
    totalHunts: number,
    plans: HuntPlan[],
    weather: WeatherConditions | null | undefined,
): HeroContent {
    const name = hunterName || "Hunter";

    // 1. Check for active plan within 48 hours
    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;
    const upcomingPlan = plans
        .filter((p) => p.status === "ACTIVE" && new Date(p.date).getTime() <= in48h && new Date(p.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (upcomingPlan) {
        const daysAway = Math.ceil((new Date(upcomingPlan.date).getTime() - now) / (1000 * 60 * 60 * 24));
        return {
            mode: "upcoming",
            greeting: "Upcoming Hunt",
            name,
            subtitle: daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `In ${daysAway} days`,
            cta: { label: "View Plan", href: `/plan/detail?id=${upcomingPlan.id}` },
            planTitle: upcomingPlan.title,
            planLocation: upcomingPlan.location?.name,
            daysAway,
        };
    }

    // 2. Check for favorable weather conditions
    if (weather) {
        const suitability = getHuntingSuitability(weather);
        if (suitability.level === "GOOD") {
            return {
                mode: "favorable",
                greeting: "Good conditions today",
                name,
                subtitle: "Conditions look good for hunting",
                cta: { label: "Plan a Hunt", href: "/plan/new" },
            };
        }
    }

    // 3. Default: season progress
    const huntText = totalHunts === 1 ? "1 hunt recorded" : `${totalHunts} hunts recorded`;
    return {
        mode: "default",
        greeting: "Welcome back",
        name,
        subtitle: totalHunts > 0 ? `Season: ${huntText}` : "Ready when you are",
    };
}

export function CommandCenterHero({ weather, logs, plans, profile }: CommandCenterHeroProps) {
    const totalHunts = logs.length;
    const hero = getHeroContent(profile.hunterName, totalHunts, plans, weather);

    return (
        <GlowCard className="glass-card rounded-2xl">
            <section className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                            {hero.greeting}
                        </p>
                        <h1 className="text-2xl font-bold font-heading">{hero.name}</h1>
                        <p className="text-sm text-primary font-medium mt-1">{hero.subtitle}</p>
                    </div>
                    <Link
                        href="/profile"
                        className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                        aria-label="Profile & Settings"
                    >
                        <User className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </div>

                {hero.mode === "upcoming" && (
                    <div className="mt-4 bg-background/40 backdrop-blur-sm rounded-xl p-3 border border-border/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{hero.planTitle}</div>
                                {hero.planLocation && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <MapPin className="h-3 w-3" />
                                        <span>{hero.planLocation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link
                            href={hero.cta!.href}
                            className="bg-primary/10 text-primary rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1"
                        >
                            {hero.cta!.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}

                {hero.mode === "favorable" && hero.cta && (
                    <div className="mt-4">
                        <Link
                            href={hero.cta.href}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-xl px-4 py-2 text-sm font-semibold"
                        >
                            {hero.cta.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </section>
        </GlowCard>
    );
}
