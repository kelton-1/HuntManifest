import { Timestamp } from 'firebase/firestore';

// ==========================================
// Enums & Shared Types
// ==========================================

export type InventoryCategory =
    | 'decoy'
    | 'firearm'
    | 'ammo'
    | 'call'
    | 'clothing'
    | 'blind'
    | 'safety'
    | 'dog'
    | 'vehicle'
    | 'other';

export type UnitType =
    | 'each'
    | 'dozen'
    | 'box'
    | 'case'
    | 'pair'
    | 'lb'
    | 'oz';

export type InventoryStatus = 'active' | 'archived';

export type PlanStatus =
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'completed'
    | 'canceled'
    | 'archived';

export type GearRole = 'must_have' | 'nice_to_have' | 'optional';

export type PlanTaskStatus = 'open' | 'done';
export type PlanTaskType = 'admin' | 'prep' | 'travel' | 'food' | 'dog' | 'other';

export type GearSource = 'from_plan' | 'manual_add';

// ==========================================
// Snapshots
// ==========================================

export interface Attributes {
    [key: string]: string | number | boolean | undefined | string[];
}

// Stored in PlanGearSelection and HuntGearUsage
export interface ItemSnapshot {
    category: InventoryCategory;
    name: string;
    brand?: string;
    attributes?: Attributes;
}

// Stored in Plans and Hunts (ConditionsSnapshot)
export interface ConditionsSnapshot {
    tempF?: number;
    windMph?: number;
    windDir?: string;
    sky?: string;
    precip?: string;
    humidity?: number;
    source?: string; // e.g. 'openweather'
    observedAt?: Timestamp;
}

// Stored in Plans and Hunts (LocationSnapshot)
export interface LocationSnapshot {
    name?: string;
    lat: number;
    lng: number;
    region?: string;
    type?: string; // field, marsh, river, etc.
}

// ==========================================
// 1. Inventory Domain
// ==========================================

export interface InventoryItem {
    id: string; // Document ID
    userId: string;
    category: InventoryCategory;
    name: string;
    brand?: string;
    quantityOwned: number;
    unitType: UnitType;
    attributes: Attributes; // JSON keyed by category
    status: InventoryStatus;
    notes?: string;

    // Denormalized usage stats
    usage?: {
        lastUsedAt?: Timestamp | null;
        huntsUsedCount?: number;
    };

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ==========================================
// 2. Plan Domain
// ==========================================

export interface HuntPlan {
    id: string; // Document ID
    userId: string;
    title?: string;
    status: PlanStatus;
    startAt?: Timestamp | null;
    endAt?: Timestamp | null;

    location?: LocationSnapshot;
    conditions?: ConditionsSnapshot;

    tags?: string[];
    notes?: string;

    // Denormalized summary for list views
    summary?: {
        gearLineCount: number;
        gearKey?: string[]; // Quick chips e.g. ["Decoys", "Ammo"]
        lastEditedAt: Timestamp;
    };

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Subcollection: /users/{uid}/plans/{planId}/selections/{selectionId}
export interface PlanGearSelection {
    id: string;
    planId: string;
    inventoryItemId: string; // FK to InventoryItem

    quantityPlanned: number;
    unitType: UnitType; // Copied from inventory at selection time
    role: GearRole;
    notes?: string;
    sortOrder: number;

    itemSnapshot: ItemSnapshot; // Snapshot for stability

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Subcollection: /users/{uid}/plans/{planId}/tasks/{taskId}
export interface PlanTask {
    id: string;
    planId: string;
    title: string;
    status: PlanTaskStatus;
    type?: PlanTaskType;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ==========================================
// 3. Hunt Domain (Log)
// ==========================================

export interface HuntLog {
    id: string; // Document ID
    userId: string;
    planId?: string | null; // Nullable if not from plan

    startAt: Timestamp;
    endAt?: Timestamp | null;

    location: LocationSnapshot; // Immutable snapshot
    conditions: ConditionsSnapshot; // Immutable snapshot

    // Denormalized quick stats
    outcome?: {
        totalBirds: number;
        speciesBreakdown?: Record<string, number>;
    };

    notes?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Subcollection: /users/{uid}/hunts/{huntId}/gear/{gearUsageId}
export interface HuntGearUsage {
    id: string;
    huntId: string;
    inventoryItemId?: string | null; // Nullable for ad-hoc/borrowed gear

    quantityUsed: number;
    unitType: UnitType;
    source: GearSource;

    itemSnapshot: ItemSnapshot; // Snapshot

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Subcollection: /users/{uid}/hunts/{huntId}/harvest/{harvestId}
export interface HarvestEntry {
    id: string;
    huntId: string;
    species: string;
    count: number;
    sex?: string | null; // drake, hen, etc.
    notes?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ==========================================
// 4. Locations Domain (Optional)
// ==========================================

export interface LocationSaved {
    id: string;
    userId: string;
    name: string;
    lat: number;
    lng: number;
    region?: string;
    type?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
