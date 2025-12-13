"use client";

import { InventoryItem } from "@/lib/types";
import { Trash2, ChevronRight } from "lucide-react";
import { CategoryIcon } from "../CategoryIcon";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

interface InventoryAuditCardProps {
    item: InventoryItem;
    onDelete: (id: string) => void;
    onToggleStatus?: (id: string, status: InventoryItem['status']) => void;
    onSetMissing?: (id: string) => void;
}

export function InventoryAuditCard({ item, onDelete, onToggleStatus, onSetMissing }: InventoryAuditCardProps) {
    const router = useRouter();
    const [startX, setStartX] = useState<number | null>(null);
    const [offset, setOffset] = useState(0);

    // Swipe logic (Swipe Left to Delete)
    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        // Only allow left swipe (negative diff)
        if (diff < 0) {
            setOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        setStartX(null);

        if (offset < -100) {
            // Threshold met, delete confirmation
            if (confirm(`Permanently delete ${item.name}?`)) {
                onDelete(item.id);
            }
            setOffset(0);
        } else {
            // Reset position
            setOffset(0);
        }
    };

    const handleClick = () => {
        if (offset === 0) {
            router.push(`/inventory/${item.id}`);
        }
    };

    return (
        <div className="relative overflow-hidden mb-2 rounded-xl select-none touch-pan-y group">
            {/* Background actions (Delete) */}
            <div className="absolute inset-0 flex items-center justify-end bg-destructive px-6 rounded-xl">
                <Trash2 className="text-white h-5 w-5" />
            </div>

            {/* Card Content */}
            <div
                className="relative flex items-center justify-between p-3 bg-card border border-border rounded-xl transition-transform duration-200 active:bg-secondary/50"
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
            >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    {/* Icon */}
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-secondary text-primary">
                        <CategoryIcon category={item.category} className="h-5 w-5" />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-foreground">{item.name}</span>
                            {item.quantity > 1 && (
                                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                    x{item.quantity}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate opacity-80 flex items-center gap-1">
                            {item.specs?.brand && <span className="font-medium">{item.specs.brand}</span>}
                            {item.specs?.brand && (item.specs?.model || item.notes) && <span>•</span>}
                            <span>{item.specs?.model || item.notes || item.category}</span>
                        </p>
                    </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
            </div>
        </div>
    );
}
