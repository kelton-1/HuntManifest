"use client";

import { useInventory, useHuntLogs } from "@/lib/storage";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Edit2, History, Calendar, Tag, Info } from "lucide-react";
import { CategoryIcon } from "@/app/components/CategoryIcon";


export default function InventoryItemDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { inventory, deleteItem } = useInventory();
    const { logs } = useHuntLogs();

    const id = params.id as string;
    const item = inventory.find((i) => i.id === id);

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground">
                <p>Item not found</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-primary hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Calculate Usage Stats
    // HuntLog now has `gear?: { id: string; name: string }[]`
    const attachedLogs = logs.filter(log =>
        log.gear?.some(g => g.id === item.id)
    );

    const usageCount = attachedLogs.length;
    const lastUsedLog = attachedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastUsedDate = lastUsedLog ? new Date(lastUsedLog.date) : null;

    const handleDelete = () => {
        if (confirm(`Permanently delete ${item.name}? This cannot be undone.`)) {
            deleteItem(item.id);
            router.replace("/inventory");
        }
    };

    return (
        <div className="pb-20 animate-fade-in min-h-screen bg-background relative">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-border/50">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => alert("Edit functionality coming in future update")}
                        className="p-2 hover:bg-secondary rounded-full transition-colors text-primary"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-destructive"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Hero Card */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                        <div className="h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center">
                            <CategoryIcon category={item.category} className="h-8 w-8 text-primary" />
                        </div>
                        {item.quantity > 1 && (
                            <span className="bg-secondary px-3 py-1 rounded-full font-mono text-sm font-bold text-muted-foreground">
                                x{item.quantity}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold mb-1">{item.name}</h1>
                    <p className="text-muted-foreground font-medium">{item.category}</p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                <History className="h-3.5 w-3.5" />
                                Usage
                            </div>
                            <p className="text-lg font-semibold">
                                {usageCount} {usageCount === 1 ? 'Hunt' : 'Hunts'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                <Calendar className="h-3.5 w-3.5" />
                                Last Used
                            </div>
                            <p className="text-lg font-semibold">
                                {lastUsedDate ? lastUsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Never"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Specs */}
                {item.specs && Object.keys(item.specs).length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ml-1">
                            <Tag className="h-4 w-4" />
                            Specifications
                        </h2>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
                            {Object.entries(item.specs)
                                .filter(([key]) => key !== 'notes')
                                .map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4">
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="font-medium text-sm">{value}</span>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}

                {/* Notes */}
                {(item.notes || item.specs?.notes) && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ml-1">
                            <Info className="h-4 w-4" />
                            Notes
                        </h2>
                        <div className="bg-secondary/30 border border-secondary rounded-2xl p-5 text-sm leading-relaxed">
                            {item.notes}
                            {item.notes && item.specs?.notes && <br />}
                            {item.specs?.notes}
                        </div>
                    </section>
                )}

                {/* Management Tip */}
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4 text-xs text-muted-foreground text-center">
                    Hunting log integration automatically updates usage stats when you record hunts.
                </div>
            </div>
        </div>
    );
}
