"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

import { formatLocationName } from "@/lib/geolocation";

interface PlaceResult {
    formatted_address?: string;
    name?: string;
    geometry?: {
        location?: {
            lat: () => number;
            lng: () => number;
        };
    };
}

interface AutocompleteInstance {
    addListener: (event: string, callback: () => void) => void;
    getPlace: () => PlaceResult;
}

interface GoogleMaps {
    maps: {
        places: {
            Autocomplete: new (input: HTMLInputElement, options: object) => AutocompleteInstance;
        };
    };
}

declare global {
    interface Window {
        google: GoogleMaps;
    }
}

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
    const autocompleteRef = useRef<AutocompleteInstance | null>(null);
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
                // Format to "City, ST" instead of full Google address
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

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.warn("Google Places API key not configured");
            return;
        }

        if (googleScriptLoaded) {
            return;
        }

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

        script.onerror = () => {
            googleScriptLoading = false;
            console.error("Failed to load Google Places API");
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (scriptReady) {
            initAutocomplete();
        }

        return () => {
            // Clean up autocomplete listeners on unmount
            if (autocompleteRef.current && (window as any).google?.maps?.event) {
                (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [scriptReady, initAutocomplete]);

    const handleSavedLocationClick = (loc: string) => {
        onChange(loc);
        if (onPlaceSelect) {
            onPlaceSelect({ name: loc });
        }
        setShowSaved(false);
    };

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
                    aria-label="Open map"
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
                            onClick={() => handleSavedLocationClick(loc)}
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
