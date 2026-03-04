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
    // Puddle Ducks - Vibrant & Distinct
    {
        id: 'mallard',
        name: 'Mallard',
        category: 'Puddle',
        isCommon: true,
        colors: ['#00A86B', '#8B4513', '#E6E6FA'] // Emerald Green (Vibrant), Saddle Brown, Lavender Mist (Cream substitute)
    },
    {
        id: 'wood_duck',
        name: 'Wood Duck',
        category: 'Puddle',
        isCommon: true,
        colors: ['#32CD32', '#800020', '#FFD700'] // Lime Green, Burgundy, Gold
    },
    {
        id: 'teal_gw',
        name: 'Teal (Green-winged)',
        category: 'Puddle',
        isCommon: true,
        colors: ['#8B0000', '#00FA9A', '#C0C0C0'] // Dark Red, Medium Spring Green, Silver
    },
    {
        id: 'teal_bw',
        name: 'Teal (Blue-winged)',
        category: 'Puddle',
        colors: ['#708090', '#87CEEB', '#D2691E'] // Slate Gray, Sky Blue, Chocolate
    },
    {
        id: 'gadwall',
        name: 'Gadwall',
        category: 'Puddle',
        isCommon: true,
        colors: ['#696969', '#000000', '#F5DEB3'] // Dim Gray, Black, Wheat
    },
    {
        id: 'wigeon',
        name: 'Wigeon',
        category: 'Puddle',
        isCommon: true,
        colors: ['#FFE4E1', '#228B22', '#BC8F8F'] // Misty Rose (Pinkish), Forest Green, Rosy Brown
    },
    {
        id: 'pintail',
        name: 'Pintail',
        category: 'Puddle',
        colors: ['#8B4513', '#FFFFFF', '#778899'] // Saddle Brown, White, Light Slate Gray
    },
    {
        id: 'black_duck',
        name: 'Black Duck',
        category: 'Puddle',
        colors: ['#2F4F4F', '#A0522D', '#483D8B'] // Dark Slate Gray, Sienna, Dark Slate Blue (Purple Speculum)
    },
    {
        id: 'shoveler',
        name: 'Shoveler',
        category: 'Puddle',
        colors: ['#006400', '#FFFFFF', '#B22222'] // Dark Green, White, Firebrick
    },

    // Diver Ducks - High Contrast
    {
        id: 'canvasback',
        name: 'Canvasback',
        category: 'Diver',
        colors: ['#F5F5F5', '#800000', '#1C1C1C'] // White Smoke, Maroon, Eerie Black
    },
    {
        id: 'redhead',
        name: 'Redhead',
        category: 'Diver',
        colors: ['#DC143C', '#000000', '#808080'] // Crimson, Black, Gray
    },
    {
        id: 'ring_neck',
        name: 'Ring-necked Duck',
        category: 'Diver',
        colors: ['#000000', '#D3D3D3', '#FFFFFF'] // Black, Light Gray, White
    },
    {
        id: 'scaup',
        name: 'Scaup',
        category: 'Diver',
        colors: ['#000080', '#F0F8FF', '#708090'] // Navy, Alice Blue, Slate Gray
    },
    {
        id: 'goldeneye',
        name: 'Goldeneye',
        category: 'Diver',
        colors: ['#000000', '#FFFFFF', '#FFD700'] // Black, White, Gold
    },
    {
        id: 'bufflehead',
        name: 'Bufflehead',
        category: 'Diver',
        colors: ['#FFFFFF', '#000000', '#9400D3'] // White, Black, Dark Violet
    },

    // Geese - distinct patterns
    {
        id: 'canada_goose',
        name: 'Canada Goose',
        category: 'Goose',
        isCommon: true,
        colors: ['#1C1C1C', '#F5F5DC', '#8B4513'] // Eerie Black, Beige, Saddle Brown
    },
    {
        id: 'snow_goose',
        name: 'Snow Goose',
        category: 'Goose',
        colors: ['#FFFFFF', '#000000', '#FF69B4'] // White, Black, Hot Pink
    },
    {
        id: 'specklebelly',
        name: 'Specklebelly (White-fronted)',
        category: 'Goose',
        colors: ['#808000', '#000000', '#FF8C00'] // Olive, Black, Dark Orange
    },
    {
        id: 'ross_goose',
        name: 'Ross Goose',
        category: 'Goose',
        colors: ['#FFFFFF', '#000000', '#CD5C5C'] // White, Black, Indian Red
    },

    // Other
    {
        id: 'coot',
        name: 'Coot',
        category: 'Other',
        colors: ['#000000', '#2F4F4F', '#F0FFFF'] // Black, Dark Slate Gray, Azure
    },
    {
        id: 'merganser',
        name: 'Merganser',
        category: 'Other',
        colors: ['#228B22', '#FFFFFF', '#FF4500'] // Forest Green, White, Orange Red
    },
    {
        id: 'other',
        name: 'Other',
        category: 'Other',
        colors: ['#696969', '#A9A9A9', '#DCDCDC'] // Dims of Gray
    },
];
