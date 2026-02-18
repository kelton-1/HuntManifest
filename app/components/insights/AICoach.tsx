"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RotateCcw, Loader2, AlertCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";
import { generateInsightsAnalysis, InsightsSummary } from "@/lib/gemini";
import { InsightCard } from "./InsightCard";

const CACHE_KEY = "timber_insights_ai_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedResponse {
    response: string;
    timestamp: number;
    logCount: number;
}

function getCache(logCount: number): string | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached: CachedResponse = JSON.parse(raw);
        if (Date.now() - cached.timestamp > CACHE_TTL) return null;
        if (cached.logCount !== logCount) return null;
        return cached.response;
    } catch {
        return null;
    }
}

function setCache(response: string, logCount: number) {
    try {
        const entry: CachedResponse = { response, timestamp: Date.now(), logCount };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch { /* ignore */ }
}

interface AICoachProps {
    summary: InsightsSummary;
    logCount: number;
}

export function AICoach({ summary, logCount }: AICoachProps) {
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputFocused, setInputFocused] = useState(false);

    const fetchAnalysis = useCallback(async (force = false) => {
        if (!force) {
            const cached = getCache(logCount);
            if (cached) {
                setResponse(cached);
                return;
            }
        }

        setLoading(true);
        setError(null);
        try {
            const text = await generateInsightsAnalysis(summary);
            setResponse(text);
            setCache(text, logCount);
        } catch (err) {
            if (err instanceof Error && err.message === 'RATE_LIMIT') {
                setError("AI Guide is thinking... Try again in a moment.");
            } else {
                setError("Unable to generate analysis right now.");
            }
        } finally {
            setLoading(false);
        }
    }, [summary, logCount]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    return (
        <InsightCard title="AI Guide" icon={Sparkles}>
            {/* Powered by badge */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                    Powered by Gemini
                </span>
                {response && !loading && (
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        transition={snappy}
                        onClick={() => { hapticLight(); fetchAnalysis(true); }}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.button>
                )}
            </div>

            {/* Content */}
            {loading && (
                <div className="space-y-3 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing your season...
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-secondary/50 animate-shimmer" />
                        <div className="h-3 w-4/5 rounded bg-secondary/50 animate-shimmer" />
                        <div className="h-3 w-3/5 rounded bg-secondary/50 animate-shimmer" />
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                    <button
                        onClick={() => fetchAnalysis(true)}
                        className="text-primary font-medium ml-auto shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {response && !loading && !error && (
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                    {response}
                </div>
            )}

            {/* Radiant Prompt Input */}
            <div className={`radiant-input-wrapper mt-2 ${inputFocused ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                <div className="radiant-input-inner flex items-center gap-2 px-4 py-3">
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Ask about your season..."
                        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                hapticLight();
                                fetchAnalysis(true);
                            }
                        }}
                    />
                    <button
                        onClick={() => { hapticLight(); fetchAnalysis(true); }}
                        className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                        <Send className="h-3.5 w-3.5 text-primary" />
                    </button>
                </div>
            </div>
        </InsightCard>
    );
}
