/**
 * SmartInput Component
 * Unified input for all inventory touchpoints with multi-modal input support
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, X, Check } from "lucide-react";
import {
    getProductIntelligenceEngine,
    ParsedProduct,
} from "@/lib/services/ProductIntelligenceEngine";
import { InventoryCategory } from "@/lib/types";
import { CategoryIcon } from "../CategoryIcon";

interface SmartInputProps {
    onResult: (result: ParsedProduct) => void;
    onPartialResult?: (result: Partial<ParsedProduct>) => void;
    onClear?: () => void;
    compact?: boolean; // For inline use in hunt plan/log
    initialCategory?: InventoryCategory;
    placeholder?: string;
    className?: string;
}

type InputState = 'idle' | 'typing' | 'processing' | 'result';

interface Suggestion {
    label: string;
    category: InventoryCategory;
    brand?: string;
}

export function SmartInput({
    onResult,
    onPartialResult,
    onClear,
    compact = false,
    initialCategory,
    placeholder = "What are you adding?",
    className = "",
}: SmartInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [state, setState] = useState<InputState>('idle');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState<ParsedProduct | null>(null);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const engine = getProductIntelligenceEngine();

    // Debounced suggestion fetching
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const results = await engine.getSuggestions(query, 6);
        setSuggestions(results);
    }, [engine]);

    // Handle input change with debounce
    const handleInputChange = (value: string) => {
        setInputValue(value);
        setState('typing');
        setError(null);

        // Clear previous timeout
        if (suggestionsTimeoutRef.current) {
            clearTimeout(suggestionsTimeoutRef.current);
        }

        // Debounce suggestion fetch
        suggestionsTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 150);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = async (suggestion: Suggestion) => {
        setInputValue(suggestion.label);
        setShowSuggestions(false);
        setState('processing');

        const parsed = await engine.parseInput({
            type: 'text',
            data: suggestion.label,
        });

        if (parsed) {
            setResult(parsed);
            setState('result');
            onPartialResult?.(parsed);
        } else {
            setState('idle');
        }
    };

    // Handle full input submission (Enter key or blur)
    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        setState('processing');
        setShowSuggestions(false);

        const parsed = await engine.parseInput({
            type: 'text',
            data: inputValue,
        });

        if (parsed) {
            setResult(parsed);
            setState('result');
            onPartialResult?.(parsed);
        } else {
            setError("Couldn't identify this item. Try adding more details.");
            setState('idle');
        }
    };

    // Confirm result and notify parent
    const confirmResult = () => {
        if (result) {
            onResult(result);
            // Reset state
            setInputValue('');
            setResult(null);
            setState('idle');
        }
    };

    // Clear and reset
    const handleClear = () => {
        setInputValue('');
        setResult(null);
        setState('idle');
        setError(null);
        onClear?.();
        inputRef.current?.focus();
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, []);

    // Compact mode for inline use
    if (compact) {
        return (
            <div className={`relative ${className}`}>
                <div className="relative flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={placeholder}
                        className="flex-1 rounded-xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                        {state === 'processing' && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onMouseDown={() => handleSuggestionSelect(s)}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0 flex items-center gap-3"
                            >
                                <CategoryIcon category={s.category} className="h-4 w-4 text-muted-foreground" />
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Full mode - main add page experience
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main input area */}
            <div className="relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={placeholder}
                        disabled={state === 'processing' || state === 'result'}
                        className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                    />

                    {state === 'processing' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && state === 'typing' && (
                    <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onMouseDown={() => handleSuggestionSelect(s)}
                                className="w-full text-left px-5 py-4 hover:bg-muted transition-colors border-b border-border/50 last:border-0 flex items-center gap-4"
                            >
                                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                                    <CategoryIcon category={s.category} className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{s.label}</p>
                                    <p className="text-xs text-muted-foreground">{s.category}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <p className="text-sm text-destructive text-center mt-2">{error}</p>
                )}
            </div>

            {/* Result card */}
            {result && state === 'result' && (
                <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 animate-slide-up">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CategoryIcon category={result.category} className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{result.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {result.brand && `${result.brand} • `}{result.category}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Extracted attributes */}
                    {Object.keys(result.attributes).length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(result.attributes).map(([key, value]) => (
                                <div key={key} className="bg-secondary/50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                    <p className="text-sm font-medium">{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Confirm button */}
                    <button
                        type="button"
                        onClick={confirmResult}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Check className="h-5 w-5" />
                        Add to Inventory
                    </button>
                </div>
            )}
        </div>
    );
}
