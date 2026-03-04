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
 * Standard geolocation request to trigger the browser permission prompt.
 * Returns a promise that resolves with the position if allowed, or rejects/resolves null if not.
 */
export function requestLocationPermission(): Promise<GeolocationPosition | null> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: GeolocationPosition = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                };
                resolve(coords);
            },
            (err) => {
                console.error("Geolocation permission error:", err);
                reject(err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    });
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
 * US state name → 2-letter abbreviation
 */
const US_STATE_ABBREVS: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
};

/** Abbreviate a US state name — returns the input unchanged if not found */
function abbreviateState(state: string): string {
    return US_STATE_ABBREVS[state] || state;
}

/**
 * Format a Google formatted_address or raw string into "City, ST" style.
 * Exported so LocationAutocomplete can reuse it.
 *
 * Handles patterns like:
 *   "Saint Charles, MO 63301, USA"  → "Saint Charles, MO"
 *   "Saint Charles, Missouri, USA"  → "Saint Charles, MO"
 *   "123 Main St, Saint Charles, MO 63301, USA" → "Saint Charles, MO"
 */
export function formatLocationName(raw: string): string {
    if (!raw) return raw;
    // Split by comma, trim
    const parts = raw.split(',').map(p => p.trim());

    // For US addresses Google typically returns:
    //   [street, city, "ST ZIP", "USA"]   or   [city, "ST ZIP", "USA"]
    // Nominatim may return:  [place, county, state, country]

    // Walk backwards to find a 2-char state code or full state name
    for (let i = parts.length - 1; i >= 1; i--) {
        // Strip ZIP codes from parts like "MO 63301"
        const cleaned = parts[i].replace(/\d{5}(-\d{4})?/, '').trim();
        if (!cleaned) continue;

        // Already a 2-char abbreviation?
        if (/^[A-Z]{2}$/.test(cleaned)) {
            // City is the part before this
            const city = parts[i - 1];
            return `${city}, ${cleaned}`;
        }
        // Full state name?
        if (US_STATE_ABBREVS[cleaned]) {
            const city = parts[i - 1];
            return `${city}, ${US_STATE_ABBREVS[cleaned]}`;
        }
    }

    // Fallback: return first two parts (e.g. international or unrecognized)
    if (parts.length >= 2) {
        return `${parts[0]}, ${parts[1]}`;
    }
    return raw;
}

export interface StructuredLocation {
    name: string;
    county?: string;
    state?: string;
    latitude: number;
    longitude: number;
}

/**
 * Reverse geocode with structured data extraction.
 * Returns county, state, and display name for Insights data capture.
 */
export async function reverseGeocodeStructured(
    latitude: number,
    longitude: number
): Promise<StructuredLocation | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'HuntManifest/0.2.0' }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const address = data.address;
        if (!address) return null;

        const place = address.hamlet || address.village || address.town || address.city || address.municipality;
        const stateRaw = address.state;
        const stateAbbrev = stateRaw ? abbreviateState(stateRaw) : undefined;
        const county = address.county || undefined;

        let name: string;
        if (place && stateAbbrev) {
            name = `${place}, ${stateAbbrev}`;
        } else if (place) {
            name = place;
        } else if (stateAbbrev) {
            name = stateAbbrev;
        } else if (data.display_name) {
            name = formatLocationName(data.display_name);
        } else {
            return null;
        }

        return { name, county, state: stateAbbrev, latitude, longitude };
    } catch (error) {
        console.error('Structured reverse geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to a location name using Nominatim (free, no API key).
 * Returns "City, ST" format for US locations.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                // Nominatim requires a User-Agent
                'User-Agent': 'HuntManifest/0.2.0'
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

        // Prefer: hamlet/village/town/city, state (abbreviated)
        const place = address.hamlet || address.village || address.town || address.city || address.municipality;
        const stateRaw = address.state;
        const stateAbbrev = stateRaw ? abbreviateState(stateRaw) : null;

        if (place && stateAbbrev) {
            return `${place}, ${stateAbbrev}`;
        } else if (place) {
            return place;
        } else if (stateAbbrev) {
            return stateAbbrev;
        } else if (data.display_name) {
            return formatLocationName(data.display_name);
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
