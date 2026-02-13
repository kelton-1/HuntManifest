/**
 * Category-Specific Attribute Schemas
 * Defines extraction targets for each inventory category
 */

import { InventoryCategory } from '../types';

// Base attributes present on all items
export interface BaseAttributes {
    name: string;
    brand?: string;
    model?: string;
    notes?: string;
}

// Firearm-specific attributes
export interface FirearmAttributes extends BaseAttributes {
    gauge?: '12ga' | '20ga' | '28ga' | '.410';
    action?: 'Semi-Auto' | 'Pump' | 'Over/Under' | 'Side-by-Side' | 'Bolt';
    chamber?: '2 3/4"' | '3"' | '3 1/2"';
    choke?: string;
    barrelLength?: string;
}

// Ammo-specific attributes
export interface AmmoAttributes extends BaseAttributes {
    gauge?: '12ga' | '20ga' | '28ga' | '.410';
    shotSize?: 'BB' | 'BBB' | '#1' | '#2' | '#3' | '#4' | '#5' | '#6';
    shellLength?: '2 3/4"' | '3"' | '3 1/2"';
    shotMaterial?: 'Steel' | 'Bismuth' | 'Tungsten' | 'TSS' | 'Lead';
    speed?: number; // fps
    loadWeight?: string; // oz
}

// Decoy-specific attributes
export interface DecoyAttributes extends BaseAttributes {
    species?: string;
    decoyType?: 'Floater' | 'Field' | 'Full-Body' | 'Silhouette' | 'Shell' | 'Motion';
    motionType?: 'Spinner' | 'Swimmer' | 'Jerk' | 'None';
    packSize?: number;
}

// Call-specific attributes
export interface CallAttributes extends BaseAttributes {
    species?: string;
    callType?: 'Single Reed' | 'Double Reed' | 'Cutdown' | 'Whistle' | 'Flute' | 'Short Reed';
    material?: 'Acrylic' | 'Polycarbonate' | 'Wood' | 'Hybrid';
    tone?: string;
}

// Waders-specific attributes
export interface WadersAttributes extends BaseAttributes {
    insulation?: 'Uninsulated' | '400g' | '600g' | '800g' | '1000g' | '1200g' | '1600g';
    bootSize?: string;
    camoPattern?: string;
    material?: 'Neoprene' | 'Breathable' | 'Rubber';
    bootType?: 'Bootfoot' | 'Stockingfoot';
}

// Clothing-specific attributes
export interface ClothingAttributes extends BaseAttributes {
    size?: string;
    camoPattern?: string;
    layerType?: 'Base' | 'Mid' | 'Outer' | 'Shell';
    material?: string;
    insulated?: boolean;
}

// Blind-specific attributes
export interface BlindAttributes extends BaseAttributes {
    blindType?: 'Layout' | 'A-Frame' | 'Boat' | 'Ground' | 'Panel' | 'Pit';
    dimensions?: string;
    weight?: string;
    capacity?: number; // persons
}

// Safety-specific attributes
export interface SafetyAttributes extends BaseAttributes {
    itemType?: 'PFD' | 'First Aid' | 'Light' | 'Communication' | 'Protection';
}

// Vehicle-specific attributes
export interface VehicleAttributes extends BaseAttributes {
    vehicleType?: 'Boat' | 'ATV' | 'UTV' | 'Trailer' | 'Motor';
    length?: string;
    horsepower?: number;
}

// Other category attributes
export interface OtherAttributes extends BaseAttributes {
    itemType?: string;
}

// Union type for all category attributes
export type CategoryAttributes =
    | FirearmAttributes
    | AmmoAttributes
    | DecoyAttributes
    | CallAttributes
    | WadersAttributes
    | ClothingAttributes
    | BlindAttributes
    | SafetyAttributes
    | VehicleAttributes
    | OtherAttributes;

// Schema definition for extraction rules
export interface AttributeSchema {
    category: InventoryCategory;
    requiredFields: string[];
    optionalFields: string[];
    extractionPatterns: Record<string, readonly RegExp[]>;
}

// Extraction patterns for common attributes
export const EXTRACTION_PATTERNS = {
    gauge: [/\b(12|20|28)\s*(?:ga(?:uge)?|g)\b/i, /\.410\b/i],
    shotSize: [/\b#?([1-6]|BB|BBB)\b/i, /shot\s*size[:\s]*([^\s,]+)/i],
    shellLength: [/\b(2\s*3\/4|3|3\s*1\/2)["\s]*(?:in(?:ch)?)?/i],
    shotMaterial: [/\b(steel|bismuth|tungsten|tss|lead)\b/i],
    species: [/\b(mallard|teal|pintail|wigeon|gadwall|wood\s*duck|canvasback|redhead|canada\s*goose|snow\s*goose|specklebelly)\b/i],
    decoyType: [/\b(floater|field|full[\s-]?body|silhouette|shell|motion)\b/i],
    insulation: [/\b(\d{3,4})\s*g(?:ram)?\b/i, /\buninsulated\b/i],
    action: [/\b(semi[\s-]?auto|pump|over[\s/]under|side[\s-]by[\s-]side|bolt)\b/i],
} as const;

// Category to schema mapping
export const CATEGORY_SCHEMAS: Record<InventoryCategory, AttributeSchema> = {
    Firearm: {
        category: 'Firearm',
        requiredFields: ['name'],
        optionalFields: ['gauge', 'action', 'chamber', 'choke', 'barrelLength'],
        extractionPatterns: {
            gauge: EXTRACTION_PATTERNS.gauge,
            action: EXTRACTION_PATTERNS.action,
        },
    },
    Ammo: {
        category: 'Ammo',
        requiredFields: ['name'],
        optionalFields: ['gauge', 'shotSize', 'shellLength', 'shotMaterial', 'speed'],
        extractionPatterns: {
            gauge: EXTRACTION_PATTERNS.gauge,
            shotSize: EXTRACTION_PATTERNS.shotSize,
            shellLength: EXTRACTION_PATTERNS.shellLength,
            shotMaterial: EXTRACTION_PATTERNS.shotMaterial,
        },
    },
    Decoy: {
        category: 'Decoy',
        requiredFields: ['name'],
        optionalFields: ['species', 'decoyType', 'motionType', 'packSize'],
        extractionPatterns: {
            species: EXTRACTION_PATTERNS.species,
            decoyType: EXTRACTION_PATTERNS.decoyType,
        },
    },
    Call: {
        category: 'Call',
        requiredFields: ['name'],
        optionalFields: ['species', 'callType', 'material', 'tone'],
        extractionPatterns: {
            species: EXTRACTION_PATTERNS.species,
        },
    },
    Waders: {
        category: 'Waders',
        requiredFields: ['name'],
        optionalFields: ['insulation', 'bootSize', 'camoPattern', 'material', 'bootType'],
        extractionPatterns: {
            insulation: EXTRACTION_PATTERNS.insulation,
        },
    },
    Clothing: {
        category: 'Clothing',
        requiredFields: ['name'],
        optionalFields: ['size', 'camoPattern', 'layerType', 'material', 'insulated'],
        extractionPatterns: {},
    },
    Blind: {
        category: 'Blind',
        requiredFields: ['name'],
        optionalFields: ['blindType', 'dimensions', 'weight', 'capacity'],
        extractionPatterns: {},
    },
    Safety: {
        category: 'Safety',
        requiredFields: ['name'],
        optionalFields: ['itemType'],
        extractionPatterns: {},
    },
    Dog: {
        category: 'Dog',
        requiredFields: ['name'],
        optionalFields: ['itemType'],
        extractionPatterns: {},
    },
    Vehicle: {
        category: 'Vehicle',
        requiredFields: ['name'],
        optionalFields: ['vehicleType', 'length', 'horsepower'],
        extractionPatterns: {},
    },
    Other: {
        category: 'Other',
        requiredFields: ['name'],
        optionalFields: ['itemType'],
        extractionPatterns: {},
    },
};

/**
 * Extract attributes from text using regex patterns
 */
export function extractAttributesFromText(
    text: string,
    category: InventoryCategory
): Partial<CategoryAttributes> {
    const schema = CATEGORY_SCHEMAS[category];
    const extracted: Record<string, string> = {};

    for (const [field, patterns] of Object.entries(schema.extractionPatterns)) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                extracted[field] = match[1] || match[0];
                break;
            }
        }
    }

    return extracted as Partial<CategoryAttributes>;
}
