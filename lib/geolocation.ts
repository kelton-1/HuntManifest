import { useState, useCallback } from "react";
import * as Location from "expo-location";

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
}

export async function requestLocationPermission(): Promise<GeolocationPosition | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (err) {
    console.error("Location permission error:", err);
    return null;
  }
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords: GeolocationPosition = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setPosition(coords);
      setLoading(false);
      return coords;
    } catch (err) {
      setError("Failed to get location");
      setLoading(false);
      return null;
    }
  }, []);

  return { position, loading, error, getCurrentPosition };
}

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

function abbreviateState(state: string): string {
  return US_STATE_ABBREVS[state] || state;
}

export function formatLocationName(raw: string): string {
  if (!raw) return raw;
  const parts = raw.split(',').map(p => p.trim());
  for (let i = parts.length - 1; i >= 1; i--) {
    const cleaned = parts[i].replace(/\d{5}(-\d{4})?/, '').trim();
    if (!cleaned) continue;
    if (/^[A-Z]{2}$/.test(cleaned)) {
      const city = parts[i - 1];
      return `${city}, ${cleaned}`;
    }
    if (US_STATE_ABBREVS[cleaned]) {
      const city = parts[i - 1];
      return `${city}, ${US_STATE_ABBREVS[cleaned]}`;
    }
  }
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

export async function reverseGeocodeStructured(
  latitude: number,
  longitude: number
): Promise<StructuredLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HuntManifest/1.0.0' }
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

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HuntManifest/1.0.0' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const address = data.address;
    if (!address) return null;
    const place = address.hamlet || address.village || address.town || address.city || address.municipality;
    const stateRaw = address.state;
    const stateAbbrev = stateRaw ? abbreviateState(stateRaw) : null;
    if (place && stateAbbrev) return `${place}, ${stateAbbrev}`;
    if (place) return place;
    if (stateAbbrev) return stateAbbrev;
    if (data.display_name) return formatLocationName(data.display_name);
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
