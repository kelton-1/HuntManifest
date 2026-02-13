import { WeatherConditions } from "./types";

export type SuitabilityLevel = "GOOD" | "FAIR" | "POOR";

export interface HuntingSuitability {
    level: SuitabilityLevel;
    color: string; // Tailwind class for badge bg + text
    bgClass: string;
    textClass: string;
}

/**
 * Evaluate hunting suitability based on weather conditions.
 *
 * GOOD (green): temp 20-45°F, wind 8-20mph, overcast or light precip
 * FAIR (amber): temp 15-55°F, wind 5-25mph, any sky
 * POOR (red):   temp below 10°F or above 60°F, wind above 30mph, or heavy precip
 */
export function getHuntingSuitability(weather: WeatherConditions): HuntingSuitability {
    const { temperature, windSpeed, skyCondition } = weather;

    const isOvercastOrLightPrecip = ["Overcast", "Rain", "Snow", "Fog", "Partly Cloudy"].includes(skyCondition);

    // Check POOR first (worst conditions)
    if (temperature < 10 || temperature > 60 || windSpeed > 30) {
        return { level: "POOR", color: "red", bgClass: "bg-red-500/15", textClass: "text-red-400" };
    }

    // Check GOOD (ideal conditions)
    if (
        temperature >= 20 && temperature <= 45 &&
        windSpeed >= 8 && windSpeed <= 20 &&
        isOvercastOrLightPrecip
    ) {
        return { level: "GOOD", color: "green", bgClass: "bg-green-500/15", textClass: "text-green-400" };
    }

    // Check FAIR (acceptable range)
    if (
        temperature >= 15 && temperature <= 55 &&
        windSpeed >= 5 && windSpeed <= 25
    ) {
        return { level: "FAIR", color: "amber", bgClass: "bg-amber-500/15", textClass: "text-amber-400" };
    }

    // Default to POOR for anything outside FAIR range
    return { level: "POOR", color: "red", bgClass: "bg-red-500/15", textClass: "text-red-400" };
}
