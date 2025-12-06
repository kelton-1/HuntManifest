"use client";

import Link from "next/link";
import { Check, ChevronRight, X, Target } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding";
import { useHuntLogs, useInventory } from "@/lib/storage";
import { useEffect, useState } from "react";

export function GettingStartedChecklist() {
    const { state, markChecklistItem, isLoaded } = useOnboarding();
    const { logs } = useHuntLogs();
    const { inventory } = useInventory();
    const [dismissed, setDismissed] = useState(false);
    const [firstShownAt, setFirstShownAt] = useState<string | null>(null);

    // Track first hunt logged
    useEffect(() => {
        if (logs.length > 0 && !state.setupChecklist.firstHunt) {
            markChecklistItem("firstHunt");
        }
    }, [logs.length, state.setupChecklist.firstHunt, markChecklistItem]);

    // Track first check completed (when all items are checked in inventory)
    useEffect(() => {
        const allChecked = inventory.length > 0 && inventory.every((item) => item.isChecked);
        if (allChecked && !state.setupChecklist.firstCheck) {
            markChecklistItem("firstCheck");
        }
    }, [inventory, state.setupChecklist.firstCheck, markChecklistItem]);

    // Store first shown date for auto-dismiss after 7 days
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("timber_checklist_shown_at");
            if (stored) {
                setFirstShownAt(stored);
            } else {
                const now = new Date().toISOString();
                localStorage.setItem("timber_checklist_shown_at", now);
                setFirstShownAt(now);
            }
        }
    }, []);

    if (!isLoaded || !state.completed) return null;
    if (dismissed) return null;

    // Check if all items are complete
    const { profile, gear, firstHunt, firstCheck } = state.setupChecklist;
    const allComplete = profile && gear && firstHunt && firstCheck;

    // Auto-dismiss after 7 days or if all complete
    if (firstShownAt) {
        const shownDate = new Date(firstShownAt);
        const daysSinceShown = (Date.now() - shownDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceShown > 7 || allComplete) {
            // Clean up
            if (typeof window !== "undefined" && allComplete) {
                localStorage.removeItem("timber_checklist_shown_at");
            }
            if (allComplete) return null;
        }
    }

    const completedCount = [profile, gear, firstHunt, firstCheck].filter(Boolean).length;
    const progress = (completedCount / 4) * 100;

    const tasks = [
        { id: "profile", label: "Set up your profile", done: profile, link: "/profile" },
        { id: "gear", label: "Add your gear", done: gear, link: "/inventory/add" },
        { id: "firstHunt", label: "Log your first hunt", done: firstHunt, link: "/log/new" },
        { id: "firstCheck", label: "Complete a gear check", done: firstCheck, link: "/inventory" },
    ];

    return (
        <section className="mb-5 animate-fade-in">
            <div className="bg-gradient-to-br from-mallard-green/10 to-mallard-green/5 dark:from-mallard-yellow/10 dark:to-mallard-yellow/5 rounded-2xl border border-mallard-green/20 dark:border-mallard-yellow/20 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-mallard-green dark:bg-mallard-yellow rounded-lg">
                            <Target className="h-4 w-4 text-white dark:text-black" />
                        </div>
                        <h2 className="font-bold">Getting Started</h2>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tasks */}
                <div className="divide-y divide-border/50">
                    {tasks.map((task) => (
                        <Link
                            key={task.id}
                            href={task.done ? "#" : task.link}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${task.done
                                    ? "opacity-60 cursor-default"
                                    : "hover:bg-secondary/50"
                                }`}
                            onClick={(e) => task.done && e.preventDefault()}
                        >
                            <div className={`flex-shrink-0 ${task.done ? "text-mallard-green dark:text-mallard-yellow" : "text-muted-foreground"}`}>
                                {task.done ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                                )}
                            </div>
                            <span className={`flex-1 text-sm font-medium ${task.done ? "line-through" : ""}`}>
                                {task.label}
                            </span>
                            {!task.done && (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="p-4 pt-3 bg-secondary/30">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-mallard-green to-mallard-green-light dark:from-mallard-yellow dark:to-mallard-yellow-light transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        {completedCount} of 4 complete
                    </p>
                </div>
            </div>
        </section>
    );
}
