"use client";

import Link from "next/link";
import { Plus, ArrowLeft, Calendar, MapPin, ChevronRight, Package, Loader2, NotebookPen } from "lucide-react";
import { useHuntPlans } from "@/lib/storage";
import { HuntPlan, PlanStatus } from "@/lib/types";

function StatusBadge({ status }: { status: PlanStatus }) {
    const config: Record<PlanStatus, { label: string; className: string }> = {
        ACTIVE: { label: "Active", className: "bg-green-500/15 text-green-400" },
        DRAFT: { label: "Draft", className: "bg-amber-500/15 text-amber-400" },
        COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground" },
        ARCHIVED: { label: "Archived", className: "bg-muted text-muted-foreground" },
    };
    const { label, className } = config[status] || config.DRAFT;
    return (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}>
            {label}
        </span>
    );
}

function PlanCard({ plan }: { plan: HuntPlan }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:bg-secondary/50 transition-colors active:scale-[0.99]">
            <Link href={`/plan/detail?id=${plan.id}`} className="block">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{plan.title}</h3>
                    <StatusBadge status={plan.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(plan.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    {plan.location?.name && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {plan.location.name}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 opacity-70" />
                        {plan.gear?.length || 0} items
                    </div>
                </div>
            </Link>

            {/* Log from this plan action — ACTIVE plans only */}
            {plan.status === "ACTIVE" && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <Link
                        href={`/log/new?planId=${plan.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                        <NotebookPen className="h-3.5 w-3.5" />
                        Log from this plan
                    </Link>
                    <Link href={`/plan/detail?id=${plan.id}`}>
                        <ChevronRight className="h-4 w-4 opacity-30" />
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function PlansPage() {
    const { plans, loading } = useHuntPlans();

    // Group by status: Active → Draft → Completed/Archived
    const activePlans = plans
        .filter((p) => p.status === "ACTIVE")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const draftPlans = plans
        .filter((p) => p.status === "DRAFT")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const pastPlans = plans
        .filter((p) => ["COMPLETED", "ARCHIVED"].includes(p.status))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sections = [
        { title: "Active", plans: activePlans },
        { title: "Drafts", plans: draftPlans },
        { title: "Completed", plans: pastPlans },
    ].filter((s) => s.plans.length > 0);

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
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-10 bg-secondary/30 rounded-2xl border border-border/50 border-dashed">
                        <p className="text-muted-foreground text-sm mb-4">No hunts planned yet.</p>
                        <Link href="/plan/new" className="text-primary font-bold text-sm hover:underline">
                            Start a new plan
                        </Link>
                    </div>
                ) : (
                    sections.map((section) => (
                        <section key={section.title}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    {section.title}
                                </h2>
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-mono">
                                    {section.plans.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {section.plans.map((plan) => (
                                    <PlanCard key={plan.id} plan={plan} />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
