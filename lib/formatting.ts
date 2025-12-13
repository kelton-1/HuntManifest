"use client";

/**
 * Formatting utilities that respect user preferences
 */

/**
 * Format temperature with user's preferred unit
 */
export function formatTemperature(tempF: number, unit: 'F' | 'C'): string {
    if (unit === 'C') {
        const tempC = Math.round((tempF - 32) * 5 / 9);
        return `${tempC}°C`;
    }
    return `${Math.round(tempF)}°F`;
}

/**
 * Format wind speed with user's preferred unit
 */
export function formatWindSpeed(speedMph: number, unit: 'mph' | 'kph'): string {
    if (unit === 'kph') {
        const speedKph = Math.round(speedMph * 1.60934);
        return `${speedKph} kph`;
    }
    return `${Math.round(speedMph)} mph`;
}

/**
 * Format temperature value only (without degree symbol), for inputs
 */
export function convertTemperature(tempF: number, unit: 'F' | 'C'): number {
    if (unit === 'C') {
        return Math.round((tempF - 32) * 5 / 9);
    }
    return Math.round(tempF);
}

/**
 * Convert temperature back to Fahrenheit for storage
 */
export function toFahrenheit(temp: number, fromUnit: 'F' | 'C'): number {
    if (fromUnit === 'C') {
        return Math.round((temp * 9 / 5) + 32);
    }
    return temp;
}

/**
 * Format wind speed value only (without unit), for inputs
 */
export function convertWindSpeed(speedMph: number, unit: 'mph' | 'kph'): number {
    if (unit === 'kph') {
        return Math.round(speedMph * 1.60934);
    }
    return Math.round(speedMph);
}

/**
 * Convert wind speed back to mph for storage
 */
export function toMph(speed: number, fromUnit: 'mph' | 'kph'): number {
    if (fromUnit === 'kph') {
        return Math.round(speed / 1.60934);
    }
    return speed;
}
