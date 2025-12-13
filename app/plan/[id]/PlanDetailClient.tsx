"use client";

import { useHuntPlans } from "@/lib/storage";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Check, MoreVertical, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { CategoryIcon } from "@/app/components/CategoryIcon";

export default function PlanDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { plans, updatePlan, deletePlan, loading } = useHuntPlans();

    const id = params.id as string;
    const plan = plans.find(p => p.id === id);

    // Filter gear by status
    const gearList = useMemo(() => plan?.gear || [], [plan]);
    const packedCount = gearList.filter(g => g.checked).length;
    const totalCount = gearList.length;
    const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;
    const isReady = totalCount > 0 && packedCount === totalCount;

    const [showOptions, setShowOptions] = useState(false);

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">
                <p>Plan not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    const toggleGear = async (itemId: string, currentChecked: boolean) => {
        const updatedGear = gearList.map(g =>
            g.id === itemId ? { ...g, checked: !currentChecked } : g
        );
        await updatePlan({ ...plan, gear: updatedGear });
    };

    const handleStartHunt = () => {
        router.push(`/log/new?planId=${plan.id}`);
    };

    const handleDelete = async () => {
        if (confirm("Delete this plan?")) {
            await deletePlan(plan.id);
            router.replace("/plan");
        }
    };

    return (
        <div className="pb-24 animate-fade-in min-h-screen bg-background relative">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-border/50">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="font-bold text-lg truncate max-w-[200px]">{plan.title}</h1>
                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    {showOptions && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleDelete}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Delete Plan
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Context Card */}
                <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 border border-secondary rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-background rounded-xl flex items-center justify-center shadow-sm">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date</div>
                            <div className="font-semibold text-lg">{new Date(plan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-background rounded-xl flex items-center justify-center shadow-sm">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Location</div>
                            <div className="font-semibold text-lg">{plan.location.name || "TBD"}</div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <h2 className="font-bold text-lg">Packing List</h2>
                        <span className={`text-sm font-bold ${isReady ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {packedCount}/{totalCount} Packed
                        </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${isReady ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                    {gearList.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleGear(item.id, item.checked)}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.99] select-none
                                ${item.checked
                                    ? 'bg-secondary/30 border-transparent opacity-60'
                                    : 'bg-card border-border hover:border-primary/50'
                                }
                            `}
                        >
                            <div className={`
                                h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${item.checked
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-muted-foreground/30 text-transparent'
                                }
                            `}>
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </div>

                            <div className="flex-1 flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                    <CategoryIcon category={item.category} className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <div className={`font-medium truncate ${item.checked && 'line-through'}`}>{item.name}</div>
                                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {gearList.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground italic bg-secondary/20 rounded-xl border border-dashed border-secondary">
                            No gear in this plan.
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border/50 flex gap-4">
                {plan.resultLogId ? (
                    <button
                        onClick={() => router.push(`/log/${plan.resultLogId}`)}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                    >
                        <Check className="h-5 w-5" />
                        View Hunt Log
                    </button>
                ) : (
                    <button
                        onClick={handleStartHunt}
                        disabled={loading}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        <Check className="h-5 w-5" />
                        Start Hunt / Log Result
                    </button>
                )}
            </div>
        </div>
    );
}
