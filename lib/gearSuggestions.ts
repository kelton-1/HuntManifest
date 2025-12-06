/**
 * Gear Suggestions & Field Options
 * Provides autocomplete suggestions and dropdown options for the add gear form
 */

// Decoy-specific options
export const DECOY_SPECIES = [
    'Mallard',
    'Teal',
    'Pintail',
    'Wigeon',
    'Gadwall',
    'Canvasback',
    'Redhead',
    'Bluebill',
    'Canada Goose',
    'Snow Goose',
    'Specklebelly',
    'Other'
] as const;

export const DECOY_TYPES = [
    'Floater',
    'Field',
    'Motion',
    'Full-Body',
    'Silhouette',
    'Shell'
] as const;

export const DECOY_QUANTITY_PRESETS = [
    { label: '1 dz', value: 12 },
    { label: '2 dz', value: 24 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
] as const;

// Call-specific options
export const CALL_SPECIES = [
    'Mallard',
    'Teal',
    'Pintail',
    'Wigeon',
    'Wood Duck',
    'Canada Goose',
    'Snow Goose',
    'Specklebelly',
    'Other'
] as const;

// Common items by category for autocomplete suggestions
export const GEAR_SUGGESTIONS: Record<string, string[]> = {
    Firearm: [
        'Shotgun',
        '12 Gauge',
        '20 Gauge',
        'Benelli SBE3',
        'Beretta A400',
        'Browning Maxus',
        'Remington 870',
        'Mossberg 500'
    ],
    Ammo: [
        'Steel Shot #2',
        'Steel Shot #4',
        'Steel Shot BB',
        'Bismuth',
        'Tungsten',
        'Target Loads',
        'High Velocity Steel'
    ],
    Decoy: [
        'Mallard Floaters',
        'Mallard Full-Body',
        'Teal Floaters',
        'Canada Goose Full-Body',
        'Snow Goose Silhouettes',
        'Motion Decoy',
        'Jerk String'
    ],
    Call: [
        'Mallard Call',
        'Goose Flute',
        'Teal Whistle',
        'Pintail Whistle',
        'Wood Duck Call',
        'Specklebelly Flute'
    ],
    Clothing: [
        'Waders',
        'Jacket',
        'Bibs',
        'Gloves',
        'Facemask',
        'Beanie',
        'Boots',
        'Base Layer'
    ],
    Blind: [
        'Layout Blind',
        'A-Frame Blind',
        'Boat Blind',
        'Ground Blind',
        'Camo Netting',
        'Blind Bag'
    ],
    Safety: [
        'Headlamp',
        'First Aid Kit',
        'Whistle',
        'Float Coat',
        'Life Jacket',
        'GPS',
        'Radio'
    ],
    Dog: [
        'Neoprene Vest',
        'Bumpers',
        'Training Dummy',
        'Dog Stand',
        'Dog Ladder',
        'Dog Food/Water'
    ],
    Vehicle: [
        'Jon Boat',
        'Mud Motor',
        'Kayak',
        'ATV',
        'Trailer',
        'Truck'
    ],
    Other: [
        'License/Stamps',
        'Thermos',
        'Hand Warmers',
        'Flashlight',
        'Knife',
        'Game Strap'
    ]
};

export type DecoySpecies = typeof DECOY_SPECIES[number];
export type DecoyType = typeof DECOY_TYPES[number];
export type CallSpecies = typeof CALL_SPECIES[number];
