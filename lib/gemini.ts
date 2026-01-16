"use client";

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import app from "./firebase";

const ai = getAI(app, { backend: new GoogleAIBackend() });

export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

export async function generateText(prompt: string): Promise<string> {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
}

export async function generateHuntingTips(
    weather: { temperature: number; windSpeed: number; windDirection: string; skyCondition: string },
    species?: string[]
): Promise<string> {
    const speciesText = species?.length ? species.join(", ") : "waterfowl";
    
    const prompt = `You are an experienced waterfowl hunting guide. Based on the following conditions, provide 2-3 brief, practical hunting tips:

Weather conditions:
- Temperature: ${weather.temperature}°F
- Wind: ${weather.windSpeed} mph from the ${weather.windDirection}
- Sky: ${weather.skyCondition}

Target species: ${speciesText}

Keep your response concise and actionable. Focus on decoy placement, calling strategy, and timing based on these conditions.`;

    return generateText(prompt);
}

export async function analyzeHuntLog(
    location: string,
    weather: { temperature: number; windSpeed: number; skyCondition: string },
    harvests: { species: string; count: number }[],
    notes?: string
): Promise<string> {
    const harvestText = harvests.map(h => `${h.count} ${h.species}`).join(", ");
    
    const prompt = `Analyze this waterfowl hunt and provide brief insights:

Location: ${location}
Weather: ${weather.temperature}°F, ${weather.windSpeed} mph wind, ${weather.skyCondition}
Harvest: ${harvestText || "None"}
${notes ? `Notes: ${notes}` : ""}

Provide 2-3 sentences of analysis including what worked well and suggestions for similar conditions in the future.`;

    return generateText(prompt);
}

export async function suggestGear(
    weather: { temperature: number; windSpeed: number; skyCondition: string },
    huntType: string = "duck hunting"
): Promise<string> {
    const prompt = `Based on these conditions for ${huntType}, suggest essential gear to bring:

- Temperature: ${weather.temperature}°F  
- Wind: ${weather.windSpeed} mph
- Sky: ${weather.skyCondition}

List 5-7 specific gear recommendations with brief explanations. Focus on practical items.`;

    return generateText(prompt);
}
