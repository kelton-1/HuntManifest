"use client";

import { Lock } from "lucide-react";

export default function InsightsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
            <div className="p-6 bg-primary/10 rounded-full mb-6">
                <Lock className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Insights</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
                Log 5+ hunts to unlock pattern analysis, species trends, and weather correlations.
            </p>
            <p className="text-xs text-muted-foreground mt-4 opacity-60">Coming Soon</p>
        </div>
    );
}
