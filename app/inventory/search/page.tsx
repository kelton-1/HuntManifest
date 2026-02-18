"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, X, ChevronRight, Package } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { ScrollRevealItem } from "@/app/components/StaggerAnimation";
import { InventoryItem } from "@/lib/types";

function HighlightMatch({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-primary/25 text-primary-foreground dark:text-mallard-yellow-light px-0.5 rounded-sm">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

function scoreItem(item: InventoryItem, query: string): number {
    const q = query.toLowerCase();
    let score = 0;
    if (item.name.toLowerCase().startsWith(q)) score += 100;
    else if (item.name.toLowerCase().includes(q)) score += 50;
    if (item.specs?.brand?.toLowerCase().includes(q)) score += 30;
    if (item.category.toLowerCase().includes(q)) score += 20;
    if (item.notes?.toLowerCase().includes(q)) score += 10;
    return score;
}

export default function InventorySearchPage() {
    const router = useRouter();
    const { inventory } = useInventory();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        return inventory
            .map((item) => ({ item, score: scoreItem(item, query) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);
    }, [inventory, query]);

    const maxScore = results.length > 0 ? results[0].score : 0;

    const suggestions = useMemo(() => {
        const cats = [...new Set(inventory.map((i) => i.category.toLowerCase()))];
        const brands = [...new Set(inventory.map((i) => i.specs?.brand).filter(Boolean))] as string[];
        return [...cats.slice(0, 2), ...brands.slice(0, 2)].slice(0, 3);
    }, [inventory]);

    return (
        <div className="min-h-screen bg-background pb-32 animate-fade-in">
            {/* Search Header */}
            <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/40 pt-2 px-5 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 shrink-0 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search inventory..."
                            className="w-full pl-11 pr-10 py-3 bg-secondary rounded-xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="px-5 py-4 space-y-4">
                {query.trim() && results.length > 0 && (
                    <>
                        {/* Results Summary */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm">
                                <span className="font-bold text-primary">{results.length}</span> result{results.length !== 1 ? "s" : ""} for &ldquo;<span className="font-bold">{query}</span>&rdquo;
                            </p>
                        </div>

                        {/* Results */}
                        <div className="space-y-3">
                            {results.map(({ item, score }, index) => {
                                const isBest = score === maxScore && score >= 50;
                                return (
                                    <ScrollRevealItem key={item.id} index={index}>
                                        <Link
                                            href={`/inventory/${item.id}`}
                                            className={`block rounded-xl p-4 flex items-start gap-3 transition-all active:scale-[0.98] ${
                                                isBest
                                                    ? "glass-card border-primary/25 bg-gradient-to-r from-primary/[0.08] to-transparent"
                                                    : "glass-card"
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <CategoryIcon category={item.category} className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-sm truncate">
                                                        <HighlightMatch text={item.name} query={query} />
                                                    </p>
                                                    {isBest && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">
                                                            BEST
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mb-2">
                                                    {item.specs?.brand ? (
                                                        <><HighlightMatch text={item.specs.brand} query={query} /> &middot; </>
                                                    ) : null}
                                                    <HighlightMatch text={item.category} query={query} />
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs font-mono">{item.quantity} unit{item.quantity !== 1 ? "s" : ""}</span>
                                                    </div>
                                                    {item.purchasePrice != null && (
                                                        <span className="text-xs font-mono text-muted-foreground">
                                                            ${(item.purchasePrice * item.quantity).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                        </Link>
                                    </ScrollRevealItem>
                                );
                            })}
                        </div>
                    </>
                )}

                {query.trim() && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-secondary rounded-2xl mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">No results for &ldquo;{query}&rdquo;</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                )}

                {!query.trim() && (
                    <div className="pt-4 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Try Searching</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setQuery(s)}
                                    className="px-3 py-2 rounded-lg bg-secondary text-xs font-medium flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
                                >
                                    <Search className="h-3 w-3 text-muted-foreground" />
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
