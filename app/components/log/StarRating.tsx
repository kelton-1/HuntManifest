"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
    value: number;
    onChange: (rating: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
    return (
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star === value ? 0 : star)}
                    className="p-1 transition-transform active:scale-90"
                    style={{ minWidth: 48, minHeight: 48 }}
                >
                    <Star
                        className={`h-8 w-8 transition-colors ${
                            star <= value
                                ? 'fill-mallard-yellow text-mallard-yellow'
                                : 'text-muted-foreground/30'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}
