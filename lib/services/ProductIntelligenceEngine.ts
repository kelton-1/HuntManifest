/**
 * ProductIntelligenceEngine
 * Central brain for all product operations - parsing, detection, extraction
 */

"use client";

import { InventoryCategory, InventoryItem, INVENTORY_CATEGORIES } from '../types';
import { BRAND_DATA } from '../brands';
import {
    CategoryAttributes,
    CATEGORY_SCHEMAS,
    extractAttributesFromText
} from '../schemas/categoryAttributes';
import { geminiModel } from '../gemini';

// ============================================
// TYPES
// ============================================

export type InputType = 'text' | 'barcode' | 'url' | 'image' | 'clipboard';

export interface InputPayload {
    type: InputType;
    data: string | Blob;
    context?: {
        existingInventory?: InventoryItem[];
        recentCategories?: InventoryCategory[];
    };
}

export interface ParsedProduct {
    name: string;
    category: InventoryCategory;
    brand?: string;
    model?: string;
    attributes: Partial<CategoryAttributes>;
    confidence: number; // 0-1
    source: 'brand_match' | 'regex' | 'ai' | 'barcode' | 'url' | 'cache';
    imageUrl?: string;
    rawInput?: string;
}

export interface BrandDetection {
    brand: string;
    category: InventoryCategory;
    confidence: number;
}

// ============================================
// BRAND DETECTION
// ============================================

// Flatten brand data for fast lookup
const BRAND_LOOKUP: Map<string, InventoryCategory[]> = new Map();
const ALL_BRANDS: string[] = [];

// Build lookup table on module load
(function initializeBrandLookup() {
    for (const [category, data] of Object.entries(BRAND_DATA) as [InventoryCategory, { brands: string[] }][]) {
        if (data?.brands) {
            for (const brand of data.brands) {
                const normalizedBrand = brand.toLowerCase();
                ALL_BRANDS.push(brand);
                const existing = BRAND_LOOKUP.get(normalizedBrand) || [];
                existing.push(category);
                BRAND_LOOKUP.set(normalizedBrand, existing);
            }
        }
    }
})();

/**
 * Detect brand from input text and narrow down category
 */
export function detectBrand(input: string): BrandDetection | null {
    const normalizedInput = input.toLowerCase().trim();

    // Direct match
    if (BRAND_LOOKUP.has(normalizedInput)) {
        const categories = BRAND_LOOKUP.get(normalizedInput)!;
        return {
            brand: ALL_BRANDS.find(b => b.toLowerCase() === normalizedInput) || normalizedInput,
            category: categories[0], // Primary category
            confidence: 1.0,
        };
    }

    // Partial match - check if input contains a known brand
    for (const brand of ALL_BRANDS) {
        const normalizedBrand = brand.toLowerCase();
        if (normalizedInput.includes(normalizedBrand) || normalizedBrand.includes(normalizedInput)) {
            const categories = BRAND_LOOKUP.get(normalizedBrand)!;
            return {
                brand,
                category: categories[0],
                confidence: normalizedInput.includes(normalizedBrand) ? 0.9 : 0.7,
            };
        }
    }

    return null;
}

/**
 * Detect category from input text using keywords
 */
export function detectCategory(input: string): { category: InventoryCategory; confidence: number } | null {
    const normalizedInput = input.toLowerCase();

    const categoryKeywords: Record<InventoryCategory, string[]> = {
        Firearm: ['shotgun', 'gun', 'firearm', 'rifle', 'sbe', 'a400', 'maxus', 'versa max'],
        Ammo: ['ammo', 'ammunition', 'shells', 'shot', 'load', 'steel', 'bismuth', 'tungsten'],
        Decoy: ['decoy', 'decoys', 'floater', 'floaters', 'spread', 'silhouette', 'full body'],
        Call: ['call', 'calls', 'caller', 'reed', 'whistle', 'flute'],
        Waders: ['wader', 'waders', 'chest wader', 'hip wader', 'bootfoot'],
        Clothing: ['jacket', 'coat', 'pants', 'bibs', 'gloves', 'hat', 'beanie', 'base layer'],
        Blind: ['blind', 'layout', 'a-frame', 'pit blind', 'boat blind'],
        Safety: ['pfd', 'life jacket', 'first aid', 'headlamp', 'safety', 'whistle'],
        Dog: ['dog', 'kennel', 'vest', 'bumper', 'dummy', 'e-collar'],
        Vehicle: ['boat', 'mud motor', 'atv', 'utv', 'trailer', 'kayak'],
        Other: ['thermos', 'cooler', 'bag', 'strap', 'knife', 'license'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords) as [InventoryCategory, string[]][]) {
        for (const keyword of keywords) {
            if (normalizedInput.includes(keyword)) {
                return { category, confidence: 0.8 };
            }
        }
    }

    return null;
}

// ============================================
// AI PARSING WITH GEMINI
// ============================================

const PRODUCT_PARSE_PROMPT = `You are a hunting gear identification system. 
Given the following input about a product, extract structured data.

Categories: ${INVENTORY_CATEGORIES.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "name": "product name",
  "category": "one of the categories above",
  "brand": "brand name or null",
  "model": "model name or null",
  "attributes": { 
    // category-specific attributes only
  }
}

Input: `;

/**
 * Parse input using Gemini AI
 */
export async function parseWithAI(input: string): Promise<Partial<ParsedProduct> | null> {
    try {
        const result = await geminiModel.generateContent(PRODUCT_PARSE_PROMPT + input);
        const text = result.response.text();

        // Extract JSON from response (may have markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate category
        if (!INVENTORY_CATEGORIES.includes(parsed.category)) {
            return null;
        }

        return {
            name: parsed.name || input,
            category: parsed.category,
            brand: parsed.brand || undefined,
            model: parsed.model || undefined,
            attributes: parsed.attributes || {},
            source: 'ai',
            confidence: 0.75,
        };
    } catch (error) {
        console.error('AI parsing error:', error);
        return null;
    }
}

// ============================================
// MAIN ENGINE CLASS
// ============================================

export class ProductIntelligenceEngine {
    private cache: Map<string, ParsedProduct> = new Map();

    /**
     * Parse any input into structured product data
     */
    async parseInput(payload: InputPayload): Promise<ParsedProduct | null> {
        const { type, data } = payload;

        if (typeof data !== 'string') {
            // Handle image/blob in future phases
            console.warn('Image parsing not yet implemented');
            return null;
        }

        const input = data.trim();
        if (!input) return null;

        // Check cache
        const cacheKey = `${type}:${input}`;
        if (this.cache.has(cacheKey)) {
            return { ...this.cache.get(cacheKey)!, source: 'cache' };
        }

        let result: ParsedProduct | null = null;

        switch (type) {
            case 'text':
                result = await this.parseText(input);
                break;
            case 'barcode':
                result = await this.parseBarcode(input);
                break;
            case 'url':
                result = await this.parseUrl(input);
                break;
            default:
                result = await this.parseText(input);
        }

        // Cache successful results
        if (result) {
            this.cache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Parse text input with brand detection + regex + AI fallback
     */
    private async parseText(input: string): Promise<ParsedProduct | null> {
        // Step 1: Try brand detection (fast, no API)
        const brandMatch = detectBrand(input);
        if (brandMatch && brandMatch.confidence >= 0.9) {
            // Get model suggestions from brand data
            const brandData = BRAND_DATA[brandMatch.category];
            const models = brandData?.models?.[brandMatch.brand] || [];

            // Check if input contains a model name
            let matchedModel: string | undefined;
            for (const model of models) {
                if (input.toLowerCase().includes(model.toLowerCase())) {
                    matchedModel = model;
                    break;
                }
            }

            // Extract any additional attributes via regex
            const regexAttributes = extractAttributesFromText(input, brandMatch.category);

            return {
                name: matchedModel ? `${brandMatch.brand} ${matchedModel}` : brandMatch.brand,
                category: brandMatch.category,
                brand: brandMatch.brand,
                model: matchedModel,
                attributes: regexAttributes,
                confidence: brandMatch.confidence,
                source: 'brand_match',
                rawInput: input,
            };
        }

        // Step 2: Try category detection + regex extraction
        const categoryMatch = detectCategory(input);
        if (categoryMatch) {
            const regexAttributes = extractAttributesFromText(input, categoryMatch.category);

            return {
                name: input,
                category: categoryMatch.category,
                attributes: regexAttributes,
                confidence: categoryMatch.confidence,
                source: 'regex',
                rawInput: input,
            };
        }

        // Step 3: Fall back to AI parsing (slower, uses API quota)
        const aiResult = await parseWithAI(input);
        if (aiResult) {
            return {
                ...aiResult,
                rawInput: input,
            } as ParsedProduct;
        }

        // No matches - return null and let UI prompt for more info
        return null;
    }

    /**
     * Parse barcode/UPC
     */
    private async parseBarcode(upc: string): Promise<ParsedProduct | null> {
        // TODO Phase 2: Integrate UPC database API
        console.log('Barcode lookup not yet implemented:', upc);
        return null;
    }

    /**
     * Parse URL (product page)
     */
    private async parseUrl(url: string): Promise<ParsedProduct | null> {
        // TODO Phase 2: Integrate URL scraping
        console.log('URL parsing not yet implemented:', url);
        return null;
    }

    /**
     * Get autocomplete suggestions based on partial input
     */
    async getSuggestions(
        partialInput: string,
        limit = 5
    ): Promise<{ label: string; category: InventoryCategory; brand?: string }[]> {
        const suggestions: { label: string; category: InventoryCategory; brand?: string; score: number }[] = [];
        const normalizedInput = partialInput.toLowerCase();

        // Check brands first
        for (const brand of ALL_BRANDS) {
            if (brand.toLowerCase().startsWith(normalizedInput)) {
                const categories = BRAND_LOOKUP.get(brand.toLowerCase())!;
                suggestions.push({
                    label: brand,
                    category: categories[0],
                    brand,
                    score: 1.0,
                });
            } else if (brand.toLowerCase().includes(normalizedInput)) {
                const categories = BRAND_LOOKUP.get(brand.toLowerCase())!;
                suggestions.push({
                    label: brand,
                    category: categories[0],
                    brand,
                    score: 0.7,
                });
            }
        }

        // Add model suggestions for matched brands
        for (const suggestion of [...suggestions]) {
            if (suggestion.brand) {
                const brandData = BRAND_DATA[suggestion.category];
                const models = brandData?.models?.[suggestion.brand] || [];
                for (const model of models.slice(0, 3)) {
                    suggestions.push({
                        label: `${suggestion.brand} ${model}`,
                        category: suggestion.category,
                        brand: suggestion.brand,
                        score: 0.6,
                    });
                }
            }
        }

        // Sort by score and limit
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ label, category, brand }) => ({ label, category, brand }));
    }

    /**
     * Record user selection for learning (future use)
     */
    recordSelection(query: string, selected: ParsedProduct): void {
        // TODO Phase 5: Store in Firestore for personalization
        console.log('Recording selection:', { query, selected: selected.name });
    }
}

// Singleton instance
let engineInstance: ProductIntelligenceEngine | null = null;

export function getProductIntelligenceEngine(): ProductIntelligenceEngine {
    if (!engineInstance) {
        engineInstance = new ProductIntelligenceEngine();
    }
    return engineInstance;
}
