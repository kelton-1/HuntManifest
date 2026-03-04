"use client";

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import app from "./firebase";

const ai = getAI(app, { backend: new GoogleAIBackend() });

export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

export async function generateText(prompt: string): Promise<string> {
    try {
        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text();
        return text.replace(/\*+/g, '').replace(/#+\s*/g, '').trim();
    } catch (error: unknown) {
        const err = error as { code?: string; customErrorData?: { status?: number } };
        if (err?.code === 'fetch-error' && err?.customErrorData?.status === 429) {
            throw new Error('RATE_LIMIT');
        }
        throw error;
    }
}

export async function generateHuntingTips(
    weather: { temperature: number; windSpeed: number; windDirection: string; skyCondition: string },
    species?: string[]
): Promise<string> {
    const speciesText = species?.length ? species.join(", ") : "ducks";
    
    const prompt = `Duck hunting tips for ${weather.temperature}°F, ${weather.windSpeed}mph ${weather.windDirection} wind, ${weather.skyCondition}. Target: ${speciesText}. Give 2 short tips on decoys and calling. Max 50 words.`;

    return generateText(prompt);
}

export async function analyzeHuntLog(
    location: string,
    weather: { temperature: number; windSpeed: number; skyCondition: string; humidity?: number; barometricPressure?: number },
    harvests: { species: string; count: number }[],
    notes?: string
): Promise<string> {
    const harvestText = harvests.map(h => `${h.count} ${h.species}`).join(", ");
    const pressureText = weather.barometricPressure ? `, ${weather.barometricPressure}" barometer` : "";
    const humidityText = weather.humidity ? `, ${weather.humidity}% humidity` : "";

    const prompt = `Hunt analysis: ${location}, ${weather.temperature}°F, ${weather.windSpeed}mph, ${weather.skyCondition}${humidityText}${pressureText}. Bag: ${harvestText || "0"}. ${notes ? `Note: ${notes.substring(0, 50)}` : ""} Give 2 sentences: what worked and one tip. Max 40 words.`;

    return generateText(prompt);
}

export async function suggestGear(
    weather: { temperature: number; windSpeed: number; skyCondition: string },
    huntType: string = "duck hunting"
): Promise<string> {
    const prompt = `${huntType} gear for ${weather.temperature}°F, ${weather.windSpeed}mph, ${weather.skyCondition}. List 4 essential items, one line each. Max 30 words.`;

    return generateText(prompt);
}

export interface InsightsSummary {
    totalHunts: number;
    successRate: number;
    totalHarvest: number;
    topSpecies: { name: string; count: number }[];
    favoriteLocation: string | null;
    sweetSpot: { temp: string; wind: string; sky: string; avgHarvest: number } | null;
    uniqueLocations: number;
    avgRating: number | null;
    shootingEfficiency: number | null;
    perHunterAvg: number | null;
}

export async function generateInsightsAnalysis(summary: InsightsSummary): Promise<string> {
    const speciesText = summary.topSpecies.slice(0, 3).map(s => `${s.count} ${s.name}`).join(', ');
    const sweetSpotText = summary.sweetSpot
        ? `Best conditions: ${summary.sweetSpot.temp}, ${summary.sweetSpot.wind} wind, ${summary.sweetSpot.sky} (${summary.sweetSpot.avgHarvest} birds/hunt avg).`
        : '';
    const efficiencyText = summary.shootingEfficiency
        ? `Shooting efficiency: ${summary.shootingEfficiency} birds per shot.`
        : '';
    const locationText = summary.favoriteLocation
        ? `Favorite spot: ${summary.favoriteLocation} (${summary.uniqueLocations} total locations).`
        : '';

    const prompt = `You are an experienced waterfowl hunting guide analyzing a client's season data. Be specific to THEIR numbers, not generic advice.

Season stats: ${summary.totalHunts} hunts, ${summary.successRate}% success rate, ${summary.totalHarvest} total birds.
Top species: ${speciesText || 'none yet'}.
${sweetSpotText}
${locationText}
${efficiencyText}

Give exactly 3 specific observations about their patterns, then 2 actionable recommendations for improving their season. Reference their actual numbers. Be concise and direct, like a guide talking to a hunter. Max 200 words.`;

    return generateText(prompt);
}
