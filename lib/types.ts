export type InventoryCategory = 'Firearm' | 'Ammo' | 'Decoy' | 'Call' | 'Clothing' | 'Blind' | 'Safety' | 'Dog' | 'Vehicle' | 'Other';

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    brand?: string;
    model?: string;
    quantity: number;
    notes?: string;
    // Category-specific fields
    species?: string; // For Decoys and Calls
    decoyType?: string; // For Decoys (Floater, Field, etc.)
    isChecked?: boolean; // For "Gear Check" mode
}

export interface WeatherConditions {
    temperature: number; // Fahrenheit
    windSpeed: number; // mph
    windDirection: string; // N, NE, etc.
    skyCondition: 'Clear' | 'Partly Cloudy' | 'Overcast' | 'Rain' | 'Snow' | 'Fog';
    notes?: string;
}

export interface Harvest {
    species: string;
    count: number;
    sex?: 'Drake' | 'Hen';
}

export interface HuntLog {
    id: string;
    date: string; // ISO date string
    location: {
        name: string;
        latitude?: number;
        longitude?: number;
    };
    weather: WeatherConditions;
    harvests: Harvest[];
    notes: string;
    photos?: string[]; // URLs or base64 (initially mock/placeholder)
}

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

export const INITIAL_INVENTORY_SEEDS: InventoryItem[] = [
    { id: '1', name: 'Shotgun', category: 'Firearm', quantity: 1, isChecked: false },
    { id: '2', name: 'Shells (Box)', category: 'Ammo', quantity: 2, isChecked: false },
    { id: '3', name: 'Waders', category: 'Clothing', quantity: 1, isChecked: false },
    { id: '4', name: 'Headlamp', category: 'Safety', quantity: 1, isChecked: false },
    { id: '5', name: 'Duck Calls', category: 'Call', quantity: 1, isChecked: false },
    { id: '6', name: 'License/Stamps', category: 'Other', quantity: 1, isChecked: false },
];
