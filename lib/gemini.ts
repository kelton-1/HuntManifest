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
    weather: { temperature: number; windSpeed: number; skyCondition: string },
    harvests: { species: string; count: number }[],
    notes?: string
): Promise<string> {
    const harvestText = harvests.map(h => `${h.count} ${h.species}`).join(", ");
    
    const prompt = `Hunt analysis: ${location}, ${weather.temperature}°F, ${weather.windSpeed}mph, ${weather.skyCondition}. Bag: ${harvestText || "0"}. ${notes ? `Note: ${notes.substring(0, 50)}` : ""} Give 2 sentences: what worked and one tip. Max 40 words.`;

    return generateText(prompt);
}

export async function suggestGear(
    weather: { temperature: number; windSpeed: number; skyCondition: string },
    huntType: string = "duck hunting"
): Promise<string> {
    const prompt = `${huntType} gear for ${weather.temperature}°F, ${weather.windSpeed}mph, ${weather.skyCondition}. List 4 essential items, one line each. Max 30 words.`;

    return generateText(prompt);
}
