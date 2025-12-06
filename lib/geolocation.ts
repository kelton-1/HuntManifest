"use client";

import { useState, useCallback } from "react";

export interface GeolocationPosition {
    latitude: number;
    longitude: number;
}

export interface GeolocationResult {
    position: GeolocationPosition | null;
    loading: boolean;
    error: string | null;
}

/**
 * React hook for getting the user's current GPS position
 */
export function useGeolocation() {
    const [position, setPosition] = useState<GeolocationPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentPosition = useCallback((): Promise<GeolocationPosition | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setError("Geolocation is not supported by your browser");
                resolve(null);
                return;
            }

            setLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords: GeolocationPosition = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    };
                    setPosition(coords);
                    setLoading(false);
                    resolve(coords);
                },
                (err) => {
                    let errorMessage = "Failed to get location";
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage = "Location permission denied";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage = "Location unavailable";
                            break;
                        case err.TIMEOUT:
                            errorMessage = "Location request timed out";
                            break;
                    }
                    setError(errorMessage);
                    setLoading(false);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // Cache for 1 minute
                }
            );
        });
    }, []);

    return { position, loading, error, getCurrentPosition };
}

/**
 * Reverse geocode coordinates to a location name using Nominatim (free, no API key)
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`;

        const response = await fetch(url, {
            headers: {
                // Nominatim requires a User-Agent
                'User-Agent': 'TalkinTimber/1.0'
            }
        });

        if (!response.ok) {
            console.error('Reverse geocoding failed:', response.status);
            return null;
        }

        const data = await response.json();

        // Build a friendly location name
        const address = data.address;
        if (!address) return null;

        // Prefer: hamlet/village/town/city, county/state
        const place = address.hamlet || address.village || address.town || address.city || address.municipality;
        const area = address.county || address.state;

        if (place && area) {
            return `${place}, ${area}`;
        } else if (place) {
            return place;
        } else if (area) {
            return area;
        } else if (data.display_name) {
            // Fallback to first two parts of display name
            const parts = data.display_name.split(', ');
            return parts.slice(0, 2).join(', ');
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
