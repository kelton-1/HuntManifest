import { InventoryCategory } from "./types";

export interface BrandModelData {
    brands: string[];
    models: Record<string, string[]>; // Brand -> Models
}

export const BRAND_DATA: Partial<Record<InventoryCategory, BrandModelData>> = {
    Firearm: {
        brands: ["Benelli", "Beretta", "Browning", "Winchester", "Remington", "Franchi", "Stoeger", "Mossberg", "Retay", "Weatherby", "Savage", "CZ"],
        models: {
            Benelli: ["Super Black Eagle 3", "Super Black Eagle 2", "M2 Field", "Super Vinci", "Ethos", "Nova", "SuperNova"],
            Beretta: ["A400 Xtreme Plus", "A400 Xtreme Unico", "A300 Ultima", "A300 Outlander", "A400 Xplor"],
            Browning: ["A5", "Maxus II", "Silver", "Gold", "Citori", "Cynergy"],
            Winchester: ["SX4", "SX3", "SXP"],
            Remington: ["Versa Max", "V3", "870", "1100", "11-87"],
            Franchi: ["Affinity 3", "Affinity 3.5", "Instinct"],
            Stoeger: ["M3500", "M3000", "P3500", "P3000"],
            Retay: ["Masai Mara", "Gordion", "GPS"],
            Mossberg: ["940 Pro Waterfowl", "930", "835 Ulti-Mag", "500"],
        }
    },
    Ammo: {
        brands: ["Boss Shotshells", "Federal Premium", "Winchester", "Remington", "Kent", "Hevi-Shot", "Migra", "Apex", "Browning", "Fiocchi", "Rio"],
        models: {
            "Boss Shotshells": ["Copper-Plated Bismuth", "Shorty", "Legacy"],
            "Federal Premium": ["Black Cloud TSS", "Black Cloud FS Steel", "Speed Shok"],
            Winchester: ["Drylok", "Blind Side", "Xpert Game/Target"],
            Remington: ["Nitro Steel", "Hypersonic Steel", "Sportsman"],
            Kent: ["Fasteel 2.0", "Bismuth", "Tungsten Matrix"],
            "Hevi-Shot": ["Hevi-XII", "Hevi-Metal", "Hevi-Bismuth"],
            Migra: ["Stacked", "Straight"],
            Apex: ["TSS", "S3 Steel"],
        }
    },
    Waders: {
        brands: ["Sitka Gear", "Chene Gear", "Drake Waterfowl", "Simms", "Frogg Toggs", "Banded", "Rogers", "Gator Waders", "High 'N Dry", "LaCrosse"],
        models: {
            "Sitka Gear": ["Delta Zip Wader"],
            "Chene Gear": ["Wader"],
            "Drake Waterfowl": ["Guardian Elite", "Eqwader"],
            "Simms": ["G3 Guide", "Freestone"],
            "Banded": ["Redzone 2.0", "Black Label"],
            "Frogg Toggs": ["Grand Refuge 3.0", "Anfib 2.0"],
            "Gator Waders": ["Shield Series"],
            "High 'N Dry": ["Breathable Waders"],
            "Rogers": ["Toughman 2-in-1", "Workingman"],
            "LaCrosse": ["Alpha Swampfox", "Mallard II"] // Often boots but sometimes waders
        }
    },
    Clothing: {
        brands: ["Sitka Gear", "Chene Gear", "Drake Waterfowl", "Banded", "Filson", "Under Armour", "Duck Camp", "First Lite", "KUIU", "Columbia"],
        models: {
            "Sitka Gear": ["Hudson Jacket", "Duck Oven Jacket", "Delta Wading Jacket", "Gradient Hoodie", "Core Lightweight Hoody", "Dakota Hoody"],
            "Chene Gear": ["Over and Under Jacket", "Hydro-Loft Jacket", "Scout Vest"],
            "Drake Waterfowl": ["MST Eqwader", "LST Guardian", "EST Heat Escape"],
            "Banded": ["Aspire", "Squaw Creek"],
            "Filson": ["Waterfowl Sweater", "Oil Finish Shelter Cloth"],
            "Duck Camp": ["Contact Series", "Bamboo Hoodie"],
        }
    },
    Decoy: {
        brands: ["G&H Decoys", "Dive Bomb", "Avian-X", "Dakota Decoys", "Higdon", "Tanglefree", "Bigfoot", "White Rock", "GHG (Greenhead Gear)", "Mojo Outdoors"],
        models: {
            "Dive Bomb": ["V2 Mallards", "F1 Canada", "S3 Silhouettes"],
            "Avian-X": ["Topflight Mallards", "AXP Geese", "LCD Hen"],
            "Dakota Decoys": ["X-Treme Mallards", "X-Treme Honkers"],
            "Higdon": ["Battleship", "Standard", "Pulsator"],
            "Tanglefree": ["Flight Series", "Pro Series"],
            "Mojo Outdoors": ["King Mallard", "Baby Mojo", "Elite Series"],
            "G&H Decoys": ["Magnum Mallard", "Standard Mallard"]
        }
    },
    Call: {
        brands: ["RNT (Rich-N-Tone)", "Zink", "Echo", "Field Proven", "Buck Gardner", "Duck Commander", "Power Calls", "Molt Gear", "Tim Grounds", "Lares"],
        models: {
            "RNT (Rich-N-Tone)": ["Mondo", "Daisy Cutter", "Diablo", "MVP"],
            "Zink": ["NBG", "COD", "ATM"],
            "Echo": ["Meat Hanger", "Timber", "XLT"],
            "Buck Gardner": ["Double Nasty", "Spitfire"],
            "Duck Commander": ["Classic Commander", "Triple Threat"],
            "Lares": ["Hybrid", "T1", "A5"]
        }
    },
    Blind: {
        brands: ["Tanglefree", "Rig'Em Right", "Avian-X", "Rogers", "Momarsh", "Beavertail", "Final Approach"],
        models: {
            "Tanglefree": ["Panel Blind", "360 Solo"],
            "Rig'Em Right": ["Low Rider", "Field Bully"],
            "Avian-X": ["A-Frame", "Powerflight"],
            "Momarsh": ["Invisiman", "Fatboy"],
            "Beavertail": ["Stealth 1200", "Stealth 2000", "Boat Blind"],
        }
    },
    Safety: {
        brands: ["Surefire", "Petzl", "Black Diamond", "Garmin", "Generic"],
        models: {
            "Surefire": ["Ear Protection"],
            "Garmin": ["inReach"]
        }
    },
    Dog: {
        brands: ["Gunner Kennels", "Lucky Duck", "Momarsh", "Rig'Em Right", "Dokken"],
        models: {
            "Gunner Kennels": ["G1 Intermediate", "G1 Large"],
            "Lucky Duck": ["Intermediate Kennel"],
            "Momarsh": ["Invisilab", "Final Stand"],
            "Rig'Em Right": ["Field Bully Dog Blind"]
        }
    },
    Vehicle: {
        brands: ["Polaris", "Can-Am", "Honda", "Yamaha", "Gator-Tail", "Pro-Drive", "War Eagle", "Xpress"],
        models: {
            "Polaris": ["Ranger", "Sportsman"],
            "Can-Am": ["Defender", "Outlander"],
            "Gator-Tail": ["GTR 40XD", "Mod V"],
            "War Eagle": ["Blackhawk", "Gladiator"]
        }
    },
    Other: {
        brands: ["Yeti", "Stanley", "Thermos"],
        models: {
            "Yeti": ["Rambler", "Tundra", "LoadOut GoBox"]
        }
    }
};
