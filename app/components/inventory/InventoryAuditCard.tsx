"use client";

import { useState } from "react";
import { InventoryItem } from "@/lib/types";
import { Trash2, AlertTriangle, Check, Circle } from "lucide-react";
import { CategoryIcon } from "../CategoryIcon";

interface InventoryAuditCardProps {
    item: InventoryItem;
    onToggleStatus: (id: string, currentStatus: InventoryItem["status"]) => void;
    onSetMissing: (id: string) => void;
    onDelete: (id: string) => void;
}

export function InventoryAuditCard({ item, onToggleStatus, onSetMissing, onDelete }: InventoryAuditCardProps) {
    const [startX, setStartX] = useState<number | null>(null);
    const [offset, setOffset] = useState(0);
    const [isLongPress, setIsLongPress] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

    // Swipe logic
    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);

        // Long press logic for "Missing" status
        const timer = setTimeout(() => {
            setIsLongPress(true);
            // Trigger haptic
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(100);
            }
            onSetMissing(item.id);
        }, 800); // 800ms long press
        setLongPressTimer(timer);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null || isLongPress) return;
        if (longPressTimer) clearTimeout(longPressTimer);

        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        // Only allow left swipe
        if (diff < 0) {
            setOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer) clearTimeout(longPressTimer);
        setIsLongPress(false);
        setStartX(null);

        if (offset < -100) {
            // Threshold met, delete
            if (confirm(`Remove ${item.name} from inventory?`)) {
                onDelete(item.id);
            }
            setOffset(0);
        } else {
            // Reset
            setOffset(0);
        }
    };

    // Style generation based on status
    const getStatusStyles = () => {
        switch (item.status) {
            case "PACKED":
                return "bg-mallard-green/10 border-mallard-green/50 opacity-60";
            case "MISSING":
                return "bg-destructive/10 border-destructive shadow-[0_0_10px_rgba(239,68,68,0.2)]";
            case "READY":
            default:
                return "bg-card border-border hover:border-muted-foreground/50";
        }
    };

    const getTextStyle = () => {
        if (item.status === 'PACKED') return 'line-through text-muted-foreground';
        if (item.status === 'MISSING') return 'text-destructive font-bold';
        return 'font-semibold text-foreground';
    };

    const handleClick = () => {
        // Prevent click if recently swiped or long pressed
        if (offset !== 0 || isLongPress) return;

        // Haptic feedback
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50);
        }

        onToggleStatus(item.id, item.status);
    };

    return (
        <div className="relative overflow-hidden mb-3 rounded-xl select-none touch-pan-y">
            {/* Background actions (Delete) */}
            <div className="absolute inset-0 flex items-center justify-end bg-destructive px-6 rounded-xl">
                <Trash2 className="text-white h-6 w-6" />
            </div>

            {/* Card Content */}
            <div
                className={`
                    relative flex items-center justify-between p-4 rounded-xl border transition-transform duration-200
                    ${getStatusStyles()}
                    active:scale-[0.98]
                `}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
            >
                <div className="flex items-center gap-4 flex-1">
                    {/* Icon / Status Indicator */}
                    <div className="flex-shrink-0">
                        {item.status === 'PACKED' ? (
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-mallard-green text-white">
                                <Check className="h-6 w-6" />
                            </div>
                        ) : item.status === 'MISSING' ? (
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-destructive text-white animate-pulse">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                <CategoryIcon category={item.category} className="h-5 w-5" />
                            </div>
                        )}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 overflow-hidden">
                        <h4 className={`text-base truncate ${getTextStyle()}`}>
                            {item.name}
                        </h4>

                        {/* Power Specs Preview - Show key specs if available */}
                        {(item.specs && Object.keys(item.specs).length > 0) && (
                            <p className="text-xs text-muted-foreground truncate opacity-80 mt-0.5">
                                {Object.entries(item.specs)
                                    .filter(([key]) => !['notes', 'brand', 'model'].includes(key)) // Filter out generic fields for preview
                                    .map(([_, value]) => value)
                                    .join(" • ") || item.specs.notes || (item.category)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Badge (for Missing/Packed clarification) */}
                <div className="ml-3">
                    {item.status === 'READY' && (
                        <Circle className="h-6 w-6 text-muted-foreground/30" />
                    )}
                </div>
            </div>
        </div>
    );
}
