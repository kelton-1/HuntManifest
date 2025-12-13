"use client";

import { useHuntLogs, useHuntPlans } from "@/lib/storage";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, CloudSun, Bird, Trash2, Share2, Check } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { formatTemperature, formatWindSpeed } from "@/lib/formatting";

export default function HuntDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { logs, deleteLog } = useHuntLogs();
    const { plans } = useHuntPlans();
    const { profile } = useUserProfile();

    const id = params.id as string;
    const log = logs.find(l => l.id === id);

    // Find linked plan if any
    const linkedPlan = log?.planId ? plans.find(p => p.id === log.planId) : null;

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
        <div className="pb-24 animate-fade-in min-h-screen bg-background relative">
            {/* Header with Hero Image/Gradient */}
            <div className="h-48 bg-gradient-to-br from-mallard-green to-mallard-green-light relative">
                <div className="absolute inset-0 bg-black/20" />
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm z-20"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 text-white z-20">
                    <h1 className="text-2xl font-bold drop-shadow-md">{log.location?.name || "Unknown Location"}</h1>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                        <Calendar className="h-4 w-4" />
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6 -mt-6 relative z-10">
                {/* Linked Plan Badge */}
                {linkedPlan && (
                    <div
                        onClick={() => router.push(`/plan/${linkedPlan.id}`)}
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
                    </div>
                )}
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-1">
                        <Bird className="h-6 w-6 text-mallard-yellow" />
                        <span className="text-2xl font-bold font-mono">{totalBirds}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Harvested</span>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1 text-sky-500">
                            <CloudSun className="h-5 w-5" />
                            <span className="font-bold">{formatTemperature(log.weather.temperature, profile.temperatureUnit)}</span>
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                            {log.weather.skyCondition}
                            <br />
                            {log.weather.windDirection} {formatWindSpeed(log.weather.windSpeed, profile.windSpeedUnit)}
                        </div>
                    </div>
                </div>

                {/* Harvesting Details */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Harvest Details</h2>
                    <div className="bg-card border border-border rounded-xl divide-y divide-border">
                        {log.harvests.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                                <span className="font-medium">{h.species}</span>
                                <span className="font-mono font-bold">{h.count}</span>
                            </div>
                        ))}
                        {log.harvests.length === 0 && (
                            <div className="p-4 text-center text-muted-foreground italic">No harvest recorded</div>
                        )}
                    </div>
                </div>

                {/* Gear Used */}
                {log.gear && log.gear.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gear Used</h2>
                        <div className="flex flex-wrap gap-2">
                            {log.gear.map((g, i) => (
                                <div key={i} className="bg-secondary px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 border border-border">
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                    {g.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {log.notes && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Notes</h2>
                        <div className="bg-card border border-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {log.notes}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50 flex gap-4">
                <button
                    onClick={handleDelete}
                    className="flex-1 h-12 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Log
                </button>
                <button
                    disabled
                    className="flex-1 h-12 rounded-xl bg-secondary text-muted-foreground font-bold text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                    <Share2 className="h-4 w-4" />
                    Share (Soon)
                </button>
            </div>
        </div>
    );
}
