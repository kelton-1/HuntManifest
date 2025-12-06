import { InventoryCategory } from "@/lib/types";
import {
    Crosshair, Flame, Bird, Volume2, Shirt, EyeOff, LifeBuoy, Box,
    Dog, Truck, Package
} from "lucide-react";

/**
 * CategoryIcon - Unified icon component for inventory categories
 * 
 * IMPORTANT: All icons must use Lucide React for consistency.
 * Do not add custom SVGs or composite icons.
 * 
 * If you need to add a new category, add it to:
 * 1. lib/types.ts - InventoryCategory type
 * 2. This switch statement with a Lucide icon
 * 3. inventory/add/page.tsx - categories array
 * 4. inventory/page.tsx - categories array
 */
export function CategoryIcon({ category, className = "h-6 w-6" }: { category: InventoryCategory, className?: string }) {
    switch (category) {
        case "Firearm": return <Crosshair className={className} />;
        case "Ammo": return <Flame className={className} />;
        case "Decoy": return <Bird className={className} />;
        case "Call": return <Volume2 className={className} />;
        case "Clothing": return <Shirt className={className} />;
        case "Blind": return <EyeOff className={className} />;
        case "Safety": return <LifeBuoy className={className} />;
        case "Dog": return <Dog className={className} />;
        case "Vehicle": return <Truck className={className} />;
        case "Other": return <Box className={className} />;
        default: return <Package className={className} />;
    }
}
