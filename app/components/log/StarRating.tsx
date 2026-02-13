"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";

interface StarRatingProps {
    value: number;
    onChange: (rating: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <motion.button
                    key={star}
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    transition={snappy}
                    onClick={() => {
                        hapticLight();
                        onChange(star === value ? 0 : star);
                    }}
                    className="p-1 flex items-center justify-center"
                    style={{ minWidth: 56, minHeight: 56 }}
                >
                    <motion.div
                        initial={false}
                        animate={{
                            scale: star <= value ? [1, 1.25, 1] : 1,
                        }}
                        transition={{
                            ...snappy,
                            delay: star <= value ? (star - 1) * 0.05 : 0,
                        }}
                    >
                        <Star
                            className={`h-8 w-8 transition-colors duration-150 ${
                                star <= value
                                    ? 'fill-mallard-yellow text-mallard-yellow'
                                    : 'text-muted-foreground/30'
                            }`}
                        />
                    </motion.div>
                </motion.button>
            ))}
        </div>
    );
}
