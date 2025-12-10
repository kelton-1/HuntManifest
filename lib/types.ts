import { Timestamp } from 'firebase/firestore';

// ============================================
// INVENTORY TYPES
// ============================================

export type InventoryCategory = 'Firearm' | 'Ammo' | 'Waders' | 'Decoy' | 'Call' | 'Clothing' | 'Blind' | 'Safety' | 'Dog' | 'Vehicle' | 'Other';

export type ItemCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type ItemStatus = 'READY' | 'PACKED' | 'MISSING';

export interface InventorySpecs {
    [key: string]: string | number | boolean | undefined;
    // Common specs
    brand?: string;
    model?: string;
    // Firearm
    action?: string;
    gauge?: string;
    chamber?: string;
    choke?: string;
    // Ammo
    shotSize?: string;
    shellLength?: string;
    shotMaterial?: string;
    speed?: number;
    // Decoy
    species?: string;
    decoyType?: string; // Floater, Field
    motionType?: string;
    // Clothing
    size?: string;
    pattern?: string;
    material?: string;
    // General
    color?: string;
    weight?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    status: ItemStatus;
    specs: InventorySpecs;
    notes?: string;
    // Enterprise fields
    condition?: ItemCondition;
    serialNumber?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    warranty?: string;
    tags?: string[];
    // Metadata
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

// ============================================
// WEATHER TYPES
// ============================================

export type SkyCondition = 'Clear' | 'Partly Cloudy' | 'Overcast' | 'Rain' | 'Snow' | 'Fog';

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type MoonPhase = 'New' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

export interface WeatherConditions {
    temperature: number; // Fahrenheit
    windSpeed: number; // mph
    windDirection: string; // N, NE, etc.
    skyCondition: SkyCondition;
    humidity?: number; // Percentage
    barometricPressure?: number; // inHg
    moonPhase?: MoonPhase;
    sunrise?: string;
    sunset?: string;
    notes?: string;
}

// ============================================
// HARVEST TYPES
// ============================================

export type HarvestSex = 'Drake' | 'Hen' | 'Unknown';

export interface Harvest {
    species: string;
    count: number;
    sex?: HarvestSex;
    bandNumber?: string; // For banded birds
    weight?: number; // In pounds
}

// ============================================
// HUNT LOG TYPES
// ============================================

export type HuntType = 'Waterfowl' | 'Upland' | 'Turkey' | 'Deer' | 'Other';

export type HuntResult = 'Successful' | 'Unsuccessful' | 'Partial';

export interface GeoLocation {
    name: string;
    latitude?: number;
    longitude?: number;
    county?: string;
    state?: string;
    publicLand?: boolean;
    huntingZone?: string;
}

export interface HuntParticipant {
    name: string;
    harvestCount?: number;
}

export interface HuntLog {
    id: string;
    date: string; // ISO date string
    huntType?: HuntType;
    location: GeoLocation;
    weather: WeatherConditions;
    harvests: Harvest[];
    notes: string;
    photos?: string[];
    // Enterprise fields
    result?: HuntResult;
    startTime?: string;
    endTime?: string;
    duration?: number; // In minutes
    participants?: HuntParticipant[];
    blindType?: string;
    decoySpread?: string;
    callingStrategy?: string;
    lessonsLearned?: string;
    rating?: number; // 1-5 stars
    tags?: string[];
    // Metadata
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

// ============================================
// AUDIT LOG TYPES (Future)
// ============================================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export interface AuditLogEntry {
    id: string;
    action: AuditAction;
    collection: string;
    documentId: string;
    userId: string;
    timestamp: Timestamp | Date;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const WATERFOWL_SPECIES = [
    'Mallard',
    'Wood Duck',
    'Teal (Green-winged)',
    'Teal (Blue-winged)',
    'Pintail',
    'Wigeon',
    'Gadwall',
    'Canvasback',
    'Redhead',
    'Ring-necked Duck',
    'Scaup',
    'Canada Goose',
    'Snow Goose',
    'Specklebelly (White-fronted)',
    'Other'
];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
    'Firearm', 'Ammo', 'Waders', 'Decoy', 'Call', 'Clothing', 'Blind', 'Safety', 'Dog', 'Vehicle', 'Other'
];

// End of types
