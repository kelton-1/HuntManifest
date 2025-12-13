"use client";

import { useState } from "react";
import { WeatherConditions } from "./types";

// ============================================
// WEATHER CACHE
// ============================================

const WEATHER_CACHE_KEY = "timber_weather_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface WeatherCache {
    data: WeatherConditions;
    timestamp: number;
    lat: number;
    lng: number;
}

function getCacheKey(lat: number, lng: number): string {
    // Round to 2 decimal places for cache key
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

function getWeatherFromCache(lat: number, lng: number): WeatherConditions | null {
    if (typeof window === "undefined") return null;

    try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!cached) return null;

        const cache: WeatherCache = JSON.parse(cached);
        const now = Date.now();

        // Check TTL
        if (now - cache.timestamp > CACHE_TTL_MS) {
            return null;
        }

        // Check location (within ~1km)
        if (Math.abs(cache.lat - lat) > 0.01 || Math.abs(cache.lng - lng) > 0.01) {
            return null;
        }

        return cache.data;
    } catch {
        return null;
    }
}

function saveWeatherToCache(lat: number, lng: number, data: WeatherConditions): void {
    if (typeof window === "undefined") return;

    try {
        const cache: WeatherCache = {
            data,
            timestamp: Date.now(),
            lat,
            lng,
        };
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage errors
    }
}

// ============================================
// API TYPES
// ============================================

interface OpenMeteoResponse {
    current: {
        temperature_2m: number;
        wind_speed_10m: number;
        wind_direction_10m: number;
        weather_code: number;
        relative_humidity_2m: number;
    };
}

// Weather codes from Open-Meteo to sky conditions
function weatherCodeToSkyCondition(code: number): WeatherConditions['skyCondition'] {
    // WMO Weather interpretation codes
    // https://open-meteo.com/en/docs
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 99) return 'Rain'; // Thunderstorm
    return 'Overcast';
}

// Convert degrees to compass direction
function degreesToDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9 / 5) + 32);
}

// Convert m/s to mph
function msToMph(ms: number): number {
    return Math.round(ms * 2.237);
}

export type WeatherResult =
    | { success: true; data: WeatherConditions; fromCache?: boolean }
    | { success: false; error: string };

/**
 * Fetch current weather conditions from Open-Meteo API with caching
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Weather conditions or error
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherResult> {
    // Check cache first
    const cached = getWeatherFromCache(latitude, longitude);
    if (cached) {
        return { success: true, data: cached, fromCache: true };
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=celsius&wind_speed_unit=ms`;

        const response = await fetch(url);

        if (!response.ok) {
            return { success: false, error: `Weather API error: ${response.status}` };
        }

        const data: OpenMeteoResponse = await response.json();

        const weather: WeatherConditions = {
            temperature: celsiusToFahrenheit(data.current.temperature_2m),
            windSpeed: msToMph(data.current.wind_speed_10m),
            windDirection: degreesToDirection(data.current.wind_direction_10m),
            skyCondition: weatherCodeToSkyCondition(data.current.weather_code),
        };

        // Save to cache
        saveWeatherToCache(latitude, longitude, weather);

        return { success: true, data: weather };
    } catch (error) {
        console.error('Weather fetch error:', error);
        return { success: false, error: 'Failed to fetch weather data' };
    }
}

/**
 * React hook for fetching weather with loading state
 */
export function useWeather() {
    const [weather, setWeather] = useState<WeatherConditions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getWeather = async (latitude: number, longitude: number) => {
        setLoading(true);
        setError(null);

        const result = await fetchWeather(latitude, longitude);

        if (result.success) {
            setWeather(result.data);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    return { weather, loading, error, getWeather };
}

