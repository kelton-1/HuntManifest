"use client";

import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding";

interface TooltipProps {
    id: string;
    children: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    arrow?: boolean;
}

export function Tooltip({ id, children, position = "bottom", arrow = true }: TooltipProps) {
    const { wasTooltipShown, markTooltipShown, isLoaded, state } = useOnboarding();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show after onboarding is complete and if not shown before
        if (isLoaded && state.completed && !wasTooltipShown(id)) {
            // Small delay to let the page settle
            const timer = setTimeout(() => setVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, state.completed, wasTooltipShown, id]);

    const handleDismiss = () => {
        markTooltipShown(id);
        setVisible(false);
    };

    if (!visible) return null;

    const positionClasses = {
        top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
        bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
        left: "right-full mr-2 top-1/2 -translate-y-1/2",
        right: "left-full ml-2 top-1/2 -translate-y-1/2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-mallard-yellow",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-mallard-yellow",
        left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-mallard-yellow",
        right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-mallard-yellow",
    };

    return (
        <div
            className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}
            onClick={handleDismiss}
        >
            <div className="relative bg-mallard-yellow text-black px-4 py-2.5 rounded-xl shadow-lg max-w-xs cursor-pointer">
                <div className="flex items-start gap-2">
                    <p className="text-sm font-medium leading-tight">{children}</p>
                    <button className="flex-shrink-0 p-0.5 hover:bg-black/10 rounded transition-colors">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
                {arrow && (
                    <div
                        className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}
                    />
                )}
            </div>
        </div>
    );
}

// Pre-configured tooltips for specific features
export const TOOLTIP_IDS = {
    INVENTORY_FIRST_VISIT: "inventory_first_visit",
    PRE_HUNT_CHECK: "pre_hunt_check",
    HUNT_LOG_FIRST: "hunt_log_first",
    PROFILE_CUSTOMIZE: "profile_customize",
} as const;
