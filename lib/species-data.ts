export type SpeciesCategory = 'Puddle' | 'Diver' | 'Goose' | 'Other';

export interface SpeciesData {
    id: string; // Unique ID for icon mapping
    name: string;
    category: SpeciesCategory;
    isCommon?: boolean; // For "Quick Picks" default
    colors: [string, string, string]; // 3 dominant colors: [Left, Top-Right, Bottom-Right]
}

export const SPECIES_WHEEL_DEFAULTS = [
    'Mallard', 'Wood Duck', 'Teal (Green-winged)', 'Gadwall', 'Wigeon', 'Canada Goose'
];

export const SPECIES_DATA: SpeciesData[] = [
    // Puddle Ducks
    {
        id: 'mallard',
        name: 'Mallard',
        category: 'Puddle',
        isCommon: true,
        colors: ['#004d26', '#593826', '#e4dcc8'] // Emerald Head, Chestnut Chest, Cream/Grey Body
    },
    {
        id: 'wood_duck',
        name: 'Wood Duck',
        category: 'Puddle',
        isCommon: true,
        colors: ['#2e4726', '#872e29', '#e0c78e'] // Iridescent Green, Burgundy, Gold Flank
    },
    {
        id: 'teal_gw',
        name: 'Teal (Green-winged)',
        category: 'Puddle',
        isCommon: true,
        colors: ['#4b2e2a', '#2d6a4f', '#b3b3b3'] // Rust Head, Green Stripe, Grey Body
    },
    {
        id: 'teal_bw',
        name: 'Teal (Blue-winged)',
        category: 'Puddle',
        colors: ['#3e4a59', '#7daedb', '#a67d58'] // Slate Head, Powder Blue Wing, Brown Body
    },
    {
        id: 'gadwall',
        name: 'Gadwall',
        category: 'Puddle',
        isCommon: true,
        colors: ['#8c8c8c', '#333333', '#d9cba3'] // Grey Body, Black Butt, Tan Head scale
    },
    {
        id: 'wigeon',
        name: 'Wigeon',
        category: 'Puddle',
        isCommon: true,
        colors: ['#e4dcc8', '#2d6a4f', '#a67d58'] // Cream Pale, Green Stripe, Pinkish Brown
    },
    {
        id: 'pintail',
        name: 'Pintail',
        category: 'Puddle',
        colors: ['#4a3728', '#ffffff', '#8c9bb3'] // Chocolate Head, White Neck, Slate/Grey Body
    },
    {
        id: 'black_duck',
        name: 'Black Duck',
        category: 'Puddle',
        colors: ['#3d2b1f', '#6b4e36', '#2d4f82'] // Dark Brown Body, Lighter Head, Purple Speculum
    },
    {
        id: 'shoveler',
        name: 'Shoveler',
        category: 'Puddle',
        colors: ['#0f281e', '#ffffff', '#872e29'] // Green Head, White Chest, Rust Flank
    },

    // Diver Ducks
    {
        id: 'canvasback',
        name: 'Canvasback',
        category: 'Diver',
        colors: ['#e4e4e4', '#872e29', '#000000'] // Canvas White, Rust Head, Black Chest
    },
    {
        id: 'redhead',
        name: 'Redhead',
        category: 'Diver',
        colors: ['#a62929', '#1a1a1a', '#8a8a8a'] // Red Head, Black Chest, Grey Body
    },
    {
        id: 'ring_neck',
        name: 'Ring-necked Duck',
        category: 'Diver',
        colors: ['#1a1a1a', '#8c8c8c', '#ffffff'] // Black Back/Purple Sheen, Grey Flank, White Mark
    },
    {
        id: 'scaup',
        name: 'Scaup',
        category: 'Diver',
        colors: ['#1a1a1a', '#e4e4e4', '#4b5563'] // Black Head, White Side, Grey Back
    },
    {
        id: 'goldeneye',
        name: 'Goldeneye',
        category: 'Diver',
        colors: ['#1a1a1a', '#ffffff', '#fcd34d'] // Black Head, White Spot/Body, Gold Eye
    },
    {
        id: 'bufflehead',
        name: 'Bufflehead',
        category: 'Diver',
        colors: ['#ffffff', '#1a1a1a', '#6b21a8'] // White Pie, Black, Purple/Green Sheen
    },

    // Geese
    {
        id: 'canada_goose',
        name: 'Canada Goose',
        category: 'Goose',
        isCommon: true,
        colors: ['#1a1a1a', '#f5f5f4', '#a18e76'] // Black Head/Neck, White Cheek, Tan Body
    },
    {
        id: 'snow_goose',
        name: 'Snow Goose',
        category: 'Goose',
        colors: ['#ffffff', '#1a1a1a', '#eb7d8c'] // White Body, Black Wingtips, Pink Bill/Legs
    },
    {
        id: 'specklebelly',
        name: 'Specklebelly (White-fronted)',
        category: 'Goose',
        colors: ['#786b59', '#1a1a1a', '#e69138'] // Grey-Brown, Black Bars, Orange Legs
    },
    {
        id: 'ross_goose',
        name: 'Ross Goose',
        category: 'Goose',
        colors: ['#ffffff', '#1a1a1a', '#f87171'] // White (Smaller), Black Tips, Reddish Bill
    },

    // Other
    {
        id: 'coot',
        name: 'Coot',
        category: 'Other',
        colors: ['#1a1a1a', '#374151', '#ffffff'] // Black Body, Dark Grey, White Beak
    },
    {
        id: 'merganser',
        name: 'Merganser',
        category: 'Other',
        colors: ['#1a1a1a', '#ffffff', '#ef4444'] // Green/Black Head, White Body, Red Bill
    },
    {
        id: 'other',
        name: 'Other',
        category: 'Other',
        colors: ['#52525b', '#a1a1aa', '#d4d4d8'] // Generic Grey Scale
    },
];
