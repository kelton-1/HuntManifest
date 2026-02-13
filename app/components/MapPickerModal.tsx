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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    const [resolving, setResolving] = useState(false);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const defaultLat = initialLat || 38.627;
    const defaultLng = initialLng || -90.199;

    // Initialize map when modal opens
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

        // Reverse geocode on idle (after pan/zoom)
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

        return () => {
            clearTimeout(debounceTimer);
        };
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
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="font-bold text-lg">Select Location</h2>
                        <div className="w-9" />
                    </div>

                    {/* Map container */}
                    <div className="flex-1 relative">
                        <div ref={mapRef} className="absolute inset-0" />

                        {/* Center pin (fixed position) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
                            <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Footer with preview and confirm */}
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
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Resolving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Confirm Location
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
