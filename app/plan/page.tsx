"use client";

import Link from "next/link";
import { Plus, ArrowLeft, Calendar, MapPin, ChevronRight, Package, Loader2 } from "lucide-react";
import { useHuntPlans } from "@/lib/storage";
import { PlanStatus } from "@/lib/types";

export default function PlansPage() {
    const { plans, loading } = useHuntPlans();

    // Filter plans (Active/Draft vs Completed/Archived)
    const activePlans = plans.filter(p => !['COMPLETED', 'ARCHIVED'].includes(p.status));
    const pastPlans = plans.filter(p => ['COMPLETED', 'ARCHIVED'].includes(p.status));

    // Sort active by date (ascending)
    const sortedActive = [...activePlans].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="pb-24 animate-fade-in relative min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-4 pb-2 mb-2 border-b border-border/50 transition-all px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Hunt Plans</h1>
                </div>
                <Link
                    href="/plan/new"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus className="h-6 w-6" />
                </Link>
            </header>

            <div className="px-4 space-y-6">
                {/* Active Plans */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upcoming</h2>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-mono">{activePlans.length}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : sortedActive.length === 0 ? (
                        <div className="text-center py-10 bg-secondary/30 rounded-2xl border border-border/50 border-dashed">
                            <p className="text-muted-foreground text-sm mb-4">No upcoming hunts planned.</p>
                            <Link href="/plan/new" className="text-primary font-bold text-sm hover:underline">
                                Start a new plan
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedActive.map(plan => (
                                <Link
                                    key={plan.id}
                                    href={`/plan/${plan.id}`}
                                    className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:bg-secondary/50 transition-colors active:scale-[0.99]"
                                >
                                    <h3 className="font-bold text-lg mb-1">{plan.title}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        {plan.location?.name && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {plan.location.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Package className="h-3.5 w-3.5 opacity-70" />
                                            {plan.gear?.length || 0} items
                                            <span className="mx-1">•</span>
                                            <span className={plan.gear.filter(i => i.checked).length === plan.gear.length && plan.gear.length > 0 ? "text-green-500 font-bold" : ""}>
                                                {plan.gear.filter(i => i.checked).length}/{plan.gear.length} Packed
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 opacity-30" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Plans (Collapsed or Link?) */}
                {pastPlans.length > 0 && (
                    <section className="opacity-60">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Past Plans</h2>
                        </div>
                        <div className="space-y-3">
                            {pastPlans.map(plan => (
                                <Link
                                    key={plan.id}
                                    href={`/plan/${plan.id}`}
                                    className="block bg-card/50 border border-border rounded-xl p-4 grayscale hover:grayscale-0 transition-all"
                                >
                                    <h3 className="font-semibold">{plan.title}</h3>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(plan.date).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
