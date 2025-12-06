"use client";

import { useState } from "react";
import { WeatherConditions } from "./types";

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
    | { success: true; data: WeatherConditions }
    | { success: false; error: string };

/**
 * Fetch current weather conditions from Open-Meteo API
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Weather conditions or error
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherResult> {
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

