"use client";

import { motion } from "framer-motion";
import { snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";

interface QuickTagsProps {
    selected: string[];
    onChange: (tags: string[]) => void;
}

const PRESET_TAGS = [
    "Slow Morning",
    "Hot Action",
    "Skunked",
    "Limit Out",
    "Decoyed Well",
    "Called In",
    "Pass Shooting",
    "New Spot",
    "Dog Worked Great",
    "Foggy",
    "Bluebird Day",
];

export function QuickTags({ selected, onChange }: QuickTagsProps) {
    const toggle = (tag: string) => {
        hapticLight();
        if (selected.includes(tag)) {
            onChange(selected.filter(t => t !== tag));
        } else {
            onChange([...selected, tag]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map(tag => {
                const isActive = selected.includes(tag);
                return (
                    <motion.button
                        key={tag}
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        transition={snappy}
                        onClick={() => toggle(tag)}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-mallard-green text-white shadow-sm'
                                : 'bg-transparent text-muted-foreground border border-border hover:border-mallard-green/50'
                        }`}
                    >
                        {tag}
                    </motion.button>
                );
            })}
        </div>
    );
}
