import { InventoryItem, InventoryCategory } from "./types";

export const MASTER_INVENTORY_LIST: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">[] = [
    // -------------------------
    // FIREARMS & AMMO
    // -------------------------
    {
        name: "Shotgun",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: { action: "Semi-Auto", gauge: "12ga" }
    },
    {
        name: "Non-Toxic Shells",
        category: "Ammo",
        quantity: 1,
        status: "READY",
        specs: { shotSize: "#2", shotMaterial: "Steel", shellLength: "3in" }
    },
    {
        name: "Floating Gun Case",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: {}
    },
    {
        name: "Choke Wrench",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: {}
    },
    {
        name: "Spare Gun Parts",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: { notes: "Firing pin, O-rings, bolt handle" }
    },
    {
        name: "Bore Snake/Cleaning Kit",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: {}
    },
    {
        name: "Gun Oil/CLP",
        category: "Firearm",
        quantity: 1,
        status: "READY",
        specs: { size: "Small Bottle" }
    },

    // -------------------------
    // CLOTHING & WADERS
    // -------------------------
    {
        name: "Chest Waders",
        category: "Waders",
        quantity: 1,
        status: "READY",
        specs: { material: "Neoprene/Breathable" }
    },
    {
        name: "Wading Belt",
        category: "Safety",
        quantity: 1,
        status: "READY",
        specs: { notes: "Safety requirement" }
    },
    {
        name: "Waterproof Jacket",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: { notes: "Shell + Liner" }
    },
    {
        name: "Base Layers",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: { material: "Merino/Synthetic" }
    },
    {
        name: "Gloves (Setter)",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: { notes: "Thick/Waterproof" }
    },
    {
        name: "Gloves (Shooter)",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: { notes: "Thin/Tactile" }
    },
    {
        name: "Face Mask/Paint",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: {}
    },
    {
        name: "Wader Repair Kit",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "UV cure (Aquaseal)" }
    },
    {
        name: "Change of Clothes",
        category: "Clothing",
        quantity: 1,
        status: "READY",
        specs: { notes: "Hypothermia kit (in dry bag)" }
    },

    // -------------------------
    // DECOYS & CALLING
    // -------------------------
    {
        name: "Mallard Decoys",
        category: "Decoy",
        quantity: 12,
        status: "READY",
        specs: { species: "Mallard", decoyType: "Floater" }
    },
    {
        name: "Local Species Decoys",
        category: "Decoy",
        quantity: 6,
        status: "READY",
        specs: { species: "Teal/Wood Duck/Pintail" }
    },
    {
        name: "Jerk Rig",
        category: "Decoy",
        quantity: 1,
        status: "READY",
        specs: { notes: "Anchor, bungee, line" }
    },
    {
        name: "Motion Decoys",
        category: "Decoy",
        quantity: 1,
        status: "READY",
        specs: { motionType: "Spinner", notes: "Mojo/Lucky Duck" }
    },
    {
        name: "Duck Calls",
        category: "Call",
        quantity: 2,
        status: "READY",
        specs: { notes: "Primary and backup" }
    },
    {
        name: "Whistle",
        category: "Call",
        quantity: 1,
        status: "READY",
        specs: { notes: "6-in-1 (Pintail/Wigeon/Teal)" }
    },
    {
        name: "Spare Batteries",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "For motion decoys" }
    },

    // -------------------------
    // BLINDS & CONCEALMENT
    // -------------------------
    {
        name: "Marsh Seat",
        category: "Blind",
        quantity: 1,
        status: "READY",
        specs: { notes: "Bucket or pole seat" }
    },
    {
        name: "Camo Netting",
        category: "Blind",
        quantity: 1,
        status: "READY",
        specs: { notes: "Bulk burlap or die-cut" }
    },
    {
        name: "Face Concealment (Dog)",
        category: "Dog",
        quantity: 1,
        status: "READY",
        specs: { notes: "Mut Hut" }
    },
    {
        name: "Saw/Pruners",
        category: "Blind",
        quantity: 1,
        status: "READY",
        specs: { notes: "For cutting natural brush" }
    },
    {
        name: "Layout Blind",
        category: "Blind",
        quantity: 1,
        status: "READY",
        specs: { notes: "For field hunts" }
    },

    // -------------------------
    // FIELD GEAR (BLIND BAG)
    // -------------------------
    {
        name: "Headlamp",
        category: "Safety",
        quantity: 1,
        status: "READY",
        specs: { notes: "Red light mode" }
    },
    {
        name: "License & Stamps",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "Digital & Physical backup" }
    },
    {
        name: "Game Strap",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: {}
    },
    {
        name: "Multi-tool",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "Pliers/Knife" }
    },
    {
        name: "Ear Protection",
        category: "Safety",
        quantity: 1,
        status: "READY",
        specs: { notes: "Electronic muffs or plugs" }
    },
    {
        name: "Toilet Paper",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "In waterproof bag" }
    },
    {
        name: "Thermos",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "Coffee/Broth" }
    },

    // -------------------------
    // LOGISTICS, DOG & SURVIVAL
    // -------------------------
    {
        name: "Neoprene Dog Vest",
        category: "Dog",
        quantity: 1,
        status: "READY",
        specs: { notes: "Warmth/Flotation" }
    },
    {
        name: "Dog Stand",
        category: "Dog",
        quantity: 1,
        status: "READY",
        specs: { notes: "Platform for water" }
    },
    {
        name: "Dog First Aid",
        category: "Dog",
        quantity: 1,
        status: "READY",
        specs: { notes: "EMT Gel, Stapler, Eyewash" }
    },
    {
        name: "Boat Plug",
        category: "Vehicle",
        quantity: 2,
        status: "READY",
        specs: { notes: "Primary + Spare" }
    },
    {
        name: "Life Jacket (PFD)",
        category: "Safety",
        quantity: 1,
        status: "READY",
        specs: { notes: "Worn over waders" }
    },
    {
        name: "Tourniquet",
        category: "Safety",
        quantity: 1,
        status: "READY",
        specs: { notes: "Trauma safety" }
    },
    {
        name: "Spotlight",
        category: "Other",
        quantity: 1,
        status: "READY",
        specs: { notes: "Handheld Q-Beam" }
    }
];
