"use client";

import { motion } from "framer-motion";
import { snappy } from "@/lib/motion";
import { hapticLight } from "@/lib/haptics";

interface QuickTagsProps {
    selected: string[];
    onChange: (tags: string[]) => void;
}

const PRESET_TAGS = [
    // Setup
    "Layout Blind",
    "Pit Blind",
    "Boat Blind",
    "Walk-In",
    "Float Hunt",
    // Strategy
    "Decoyed Well",
    "Called In",
    "Pass Shooting",
    "Jump Shooting",
    "Traffic Hunt",
    // Conditions
    "Slow Morning",
    "Hot Action",
    "Limit Out",
    "Skunked",
    "Bluebird Day",
    "Foggy",
    "Front Moving In",
    "Post-Front",
    // Pressure & Activity
    "New Spot",
    "Public Land",
    "Heavy Pressure",
    "No Pressure",
    "Birds Working",
    "High Flyers Only",
    "Dog Worked Great",
    "Late Flight",
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
