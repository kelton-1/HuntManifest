"use client";

import { motion } from "framer-motion";
import { snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";

interface PillSelectorProps<T extends string> {
    options: readonly T[];
    value: T | undefined;
    onChange: (value: T) => void;
    label?: string;
}

export function PillSelector<T extends string>({
    options,
    value,
    onChange,
    label,
}: PillSelectorProps<T>) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-[12px] text-muted-foreground">{label}</label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                    <motion.button
                        key={opt}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        transition={snappy}
                        onClick={() => { hapticLight(); onChange(opt); }}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                            value === opt
                                ? 'bg-mallard-green text-white shadow-sm'
                                : 'bg-transparent text-muted-foreground border border-border hover:border-mallard-green/50'
                        }`}
                    >
                        {opt}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
