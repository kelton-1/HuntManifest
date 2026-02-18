# Shared UI Components

**Framework:** Next.js 16 (App Router, static export), React 19, Tailwind CSS 3.x
**Component Library:** Custom (no shadcn/ui, MUI, etc.)
**Icons:** Lucide React (all icons)
**Animations:** Framer Motion
**CSS Approach:** Tailwind utility-first + custom CSS utilities in globals.css

---

## CategoryIcon

**Path:** `app/components/CategoryIcon.tsx`
**Description:** Maps inventory categories to Lucide icons.

```tsx
import { InventoryCategory } from "@/lib/types";
import {
    Crosshair, Flame, Bird, Volume2, Shirt, EyeOff, LifeBuoy, Box,
    Truck, Package
} from "lucide-react";

export function CategoryIcon({ category, className = "h-6 w-6" }: { category: InventoryCategory, className?: string }) {
    switch (category) {
        case "Firearm": return <Crosshair className={className} />;
        case "Ammo": return <Flame className={className} />;
        case "Decoy": return <Bird className={className} />;
        case "Call": return <Volume2 className={className} />;
        case "Clothing": return <Shirt className={className} />;
        case "Blind": return <EyeOff className={className} />;
        case "Safety": return <LifeBuoy className={className} />;
        case "Vehicle": return <Truck className={className} />;
        case "Other": return <Box className={className} />;
        default: return <Package className={className} />;
    }
}
```

---

## StaggerAnimation (StaggerContainer + StaggerItem)

**Path:** `app/components/StaggerAnimation.tsx`
**Description:** Framer Motion staggered entrance animation wrapper components.

```tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24,
        },
    },
};

export function StaggerContainer({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}

export { containerVariants, itemVariants };
```

---

## Calendar

**Path:** `app/components/ui/Calendar.tsx`
**Description:** Date picker component using react-day-picker with custom Tailwind styling.

```tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-bold uppercase tracking-wider",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary rounded-lg transition-colors",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-md shadow-primary/20",
                day_today: "bg-secondary text-foreground font-bold border border-border",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
```

---

## LocationAutocomplete

**Path:** `app/components/LocationAutocomplete.tsx`
**Description:** Google Places autocomplete input with saved locations dropdown.

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { formatLocationName } from "@/lib/geolocation";

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelect?: (place: { name: string; lat?: number; lng?: number }) => void;
    onOpenMap?: () => void;
    placeholder?: string;
    className?: string;
    savedLocations?: string[];
}

let googleScriptLoaded = false;
let googleScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

export function LocationAutocomplete({
    value,
    onChange,
    onPlaceSelect,
    onOpenMap,
    placeholder = "Enter location...",
    className = "",
    savedLocations = []
}: LocationAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [showSaved, setShowSaved] = useState(false);
    const [scriptReady, setScriptReady] = useState(googleScriptLoaded);

    const initAutocomplete = useCallback(() => {
        if (!inputRef.current || !window.google?.maps?.places) return;
        if (autocompleteRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["geocode", "establishment"],
            fields: ["formatted_address", "geometry", "name"]
        });

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place) {
                const rawName = place.formatted_address || place.name || "";
                const name = formatLocationName(rawName);
                onChange(name);
                if (onPlaceSelect) {
                    onPlaceSelect({
                        name,
                        lat: place.geometry?.location?.lat(),
                        lng: place.geometry?.location?.lng()
                    });
                }
                setShowSaved(false);
            }
        });
    }, [onChange, onPlaceSelect]);

    // Google script loading...
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
        if (!apiKey) return;
        if (googleScriptLoaded) return;
        if (googleScriptLoading) {
            loadCallbacks.push(() => setScriptReady(true));
            return;
        }
        googleScriptLoading = true;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            googleScriptLoaded = true;
            googleScriptLoading = false;
            setScriptReady(true);
            loadCallbacks.forEach(cb => cb());
            loadCallbacks.length = 0;
        };
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (scriptReady) initAutocomplete();
    }, [scriptReady, initAutocomplete]);

    const filteredSaved = savedLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase()) || value === ""
    ).slice(0, 5);

    return (
        <div className="relative">
            {onOpenMap ? (
                <button
                    type="button"
                    onClick={onOpenMap}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded hover:bg-primary/10 transition-colors"
                >
                    <MapPin className="h-5 w-5 text-primary" />
                </button>
            ) : (
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            )}
            {!scriptReady && googleScriptLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
            )}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowSaved(true)}
                onBlur={() => setTimeout(() => setShowSaved(false), 200)}
                placeholder={placeholder}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
                autoComplete="off"
            />

            {showSaved && filteredSaved.length > 0 && !scriptReady && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                    <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
                        Recent Locations
                    </div>
                    {filteredSaved.map((loc, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => { onChange(loc); onPlaceSelect?.({ name: loc }); setShowSaved(false); }}
                            className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary flex items-center gap-2 transition-colors"
                        >
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {loc}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---

## MapPickerModal

**Path:** `app/components/MapPickerModal.tsx`
**Description:** Full-screen Google Maps modal for picking a location by dropping a pin.

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { reverseGeocode } from "@/lib/geolocation";

interface MapPickerModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (result: { name: string; lat: number; lng: number }) => void;
    initialLat?: number;
    initialLng?: number;
}

export function MapPickerModal({ open, onClose, onConfirm, initialLat, initialLng }: MapPickerModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [resolving, setResolving] = useState(false);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const defaultLat = initialLat || 38.627;
    const defaultLng = initialLng || -90.199;

    useEffect(() => {
        if (!open || !mapRef.current) return;
        if (!(window as any).google?.maps) return;

        const google = (window as any).google;
        const map = new google.maps.Map(mapRef.current, {
            center: { lat: defaultLat, lng: defaultLng },
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
            styles: [
                { featureType: "poi", stylers: [{ visibility: "off" }] },
                { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
        });

        mapInstanceRef.current = map;

        let debounceTimer: ReturnType<typeof setTimeout>;
        map.addListener("idle", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const center = map.getCenter();
                if (center) {
                    const name = await reverseGeocode(center.lat(), center.lng());
                    setPreviewName(name);
                }
            }, 500);
        });

        return () => { clearTimeout(debounceTimer); };
    }, [open, defaultLat, defaultLng]);

    const handleConfirm = useCallback(async () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        setResolving(true);
        const center = map.getCenter();
        if (center) {
            const lat = center.lat();
            const lng = center.lng();
            const name = await reverseGeocode(lat, lng);
            onConfirm({ name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
        }
        setResolving(false);
        onClose();
    }, [onConfirm, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col"
                >
                    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="font-bold text-lg">Select Location</h2>
                        <div className="w-9" />
                    </div>
                    <div className="flex-1 relative">
                        <div ref={mapRef} className="absolute inset-0" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
                            <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
                        </div>
                    </div>
                    <div className="p-4 border-t border-border bg-background space-y-3 pb-safe">
                        {previewName && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-medium truncate">{previewName}</span>
                            </div>
                        )}
                        <button
                            onClick={handleConfirm}
                            disabled={resolving}
                            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {resolving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Resolving...</>
                            ) : (
                                <><Check className="h-4 w-4" />Confirm Location</>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
```

---

## ThemeProvider

**Path:** `app/components/theme-provider.tsx`
**Description:** Wrapper around next-themes ThemeProvider.

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

---

## AppWrapper

**Path:** `app/components/AppWrapper.tsx`
**Description:** Wraps main content, shows onboarding or loading state if needed.

```tsx
"use client";

import { ReactNode } from "react";
import { OnboardingFlow } from "./onboarding";
import { useOnboarding } from "@/lib/onboarding";

interface AppWrapperProps {
    children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
    const { state, isLoaded } = useOnboarding();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center animate-pulse">
                    <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
                </div>
            </div>
        );
    }

    if (!state.completed) {
        return <OnboardingFlow />;
    }

    return <>{children}</>;
}
```

---

## Utility: cn()

**Path:** `lib/utils.ts`
**Description:** Tailwind class merge utility (clsx + tailwind-merge).

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

---

## Utility: Motion Presets

**Path:** `lib/motion.ts`
**Description:** Shared Framer Motion spring presets.

```typescript
export const snappy = { type: "spring" as const, stiffness: 400, damping: 30 };
export const smooth = { type: "spring" as const, stiffness: 300, damping: 28 };
export const gentle = { type: "spring" as const, stiffness: 200, damping: 25 };

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: smooth },
};
```

---

## Utility: Haptics

**Path:** `lib/haptics.ts`
**Description:** Vibration API wrapper for mobile haptic feedback.

```typescript
export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
}

export function hapticMedium() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
}

export function hapticHeavy() {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 20, 30]);
}
```

---

## CSS Component Classes (defined in globals.css)

The project does NOT have separate Button, Card, Input, or Modal components. Instead, these patterns are defined as Tailwind `@layer components` classes in `app/globals.css`:

- `.btn-primary` — green gradient button with hover/active states
- `.card` — bg-card rounded-xl with border and shadow
- `.input` — full-width rounded input with focus ring
- `.badge` / `.badge-primary` / `.badge-success` / `.badge-warning` / `.badge-danger` — inline pill badges
- `.glass` / `.glass-subtle` / `.glass-section` / `.glass-nav` / `.glass-card` / `.glass-weather` — glassmorphism effects
- `.stat-tile` — standardized metric card
