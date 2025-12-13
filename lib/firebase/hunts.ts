import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    runTransaction,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    HuntLog,
    HuntGearUsage,
    HarvestEntry,
    HuntPlan,
    GearSource
} from './models';
import { getPlanSelections } from './plans';

const HUNTS_COLLECTION = 'hunts';
const GEAR_USAGE_COLLECTION = 'gear';
const HARVEST_COLLECTION = 'harvest';

// ==========================================
// Converters
// ==========================================

const huntConverter = {
    toFirestore: (data: HuntLog): DocumentData => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = data;
        return rest;
    },
    fromFirestore: (doc: QueryDocumentSnapshot): HuntLog => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startAt: data.startAt as Timestamp,
            endAt: data.endAt ? data.endAt as Timestamp : null,
            conditions: data.conditions ? {
                ...data.conditions,
                observedAt: data.conditions.observedAt as Timestamp,
            } : undefined,
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
        } as HuntLog;
    },
};

// ==========================================
// Hunts (Top Level)
// ==========================================

export async function getHuntLogs(userId: string): Promise<HuntLog[]> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION).withConverter(huntConverter);
    const q = query(colRef, orderBy('startAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
}

export async function createHuntLog(
    userId: string,
    log: Omit<HuntLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION);

    const docRef = await addDoc(colRef, {
        ...log,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Creates a Hunt Log based on a Hunt Plan.
 * Copies all PlanGearSelection items to HuntGearUsage.
 */
export async function logHuntFromPlan(
    userId: string,
    plan: HuntPlan
): Promise<string> {
    // 1. Create the Hunt Log doc
    const huntData: Omit<HuntLog, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        planId: plan.id,
        startAt: plan.startAt || Timestamp.now(), // Default to now if plan didn't have start time
        endAt: null,
        location: plan.location || { lat: 0, lng: 0 }, // Fallback logic
        conditions: plan.conditions || {},
        // Initialize empty outcome
        outcome: {
            totalBirds: 0,
        },
        notes: plan.notes || '',
    };

    // We use a transaction or simple batch. Since we depend on plan selections first,
    // we can fetch them and then batch write.
    const selections = await getPlanSelections(userId, plan.id);

    // Use transaction to ensure hunt and gear are created together? 
    // Batch is sufficient for this create operation.
    return await runTransaction(db, async (transaction) => {
        // A. Create Hunt Doc
        const huntRef = doc(collection(db, 'users', userId, HUNTS_COLLECTION));
        transaction.set(huntRef, {
            ...huntData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // B. Copy selections to gear usage
        for (const sel of selections) {
            const gearRef = doc(collection(db, 'users', userId, HUNTS_COLLECTION, huntRef.id, GEAR_USAGE_COLLECTION));

            const gearData: Omit<HuntGearUsage, 'id' | 'createdAt' | 'updatedAt'> = {
                huntId: huntRef.id,
                inventoryItemId: sel.inventoryItemId,
                quantityUsed: sel.quantityPlanned,
                unitType: sel.unitType,
                source: 'from_plan',
                itemSnapshot: sel.itemSnapshot,
            };

            transaction.set(gearRef, {
                ...gearData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        // C. Update Plan status to 'completed' (optional, but good workflow)
        const planRef = doc(db, 'users', userId, 'plans', plan.id);
        transaction.update(planRef, {
            status: 'completed',
            updatedAt: serverTimestamp(),
        });

        return huntRef.id;
    });
}

// ==========================================
// Gear Usage (Sub-collection)
// ==========================================

export async function getHuntGear(userId: string, huntId: string): Promise<HuntGearUsage[]> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION, huntId, GEAR_USAGE_COLLECTION);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt as Timestamp,
        updatedAt: doc.data().updatedAt as Timestamp,
    } as HuntGearUsage));
}

export async function addHuntGear(
    userId: string,
    huntId: string,
    gear: Omit<HuntGearUsage, 'id' | 'createdAt' | 'updatedAt' | 'huntId'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION, huntId, GEAR_USAGE_COLLECTION);
    const docRef = await addDoc(colRef, {
        ...gear,
        huntId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// ==========================================
// Harvest (Sub-collection)
// ==========================================

export async function getHarvestEntries(userId: string, huntId: string): Promise<HarvestEntry[]> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION, huntId, HARVEST_COLLECTION);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt as Timestamp,
        updatedAt: doc.data().updatedAt as Timestamp,
    } as HarvestEntry));
}

export async function addHarvestEntry(
    userId: string,
    huntId: string,
    entry: Omit<HarvestEntry, 'id' | 'createdAt' | 'updatedAt' | 'huntId'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, HUNTS_COLLECTION, huntId, HARVEST_COLLECTION);

    const docRef = await addDoc(colRef, {
        ...entry,
        huntId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Update Denormalized Outcome
    await updateHuntOutcome(userId, huntId);

    return docRef.id;
}

async function updateHuntOutcome(userId: string, huntId: string) {
    const entries = await getHarvestEntries(userId, huntId);
    const totalBirds = entries.reduce((sum, e) => sum + e.count, 0);

    const speciesBreakdown: Record<string, number> = {};
    entries.forEach(e => {
        if (!speciesBreakdown[e.species]) speciesBreakdown[e.species] = 0;
        speciesBreakdown[e.species] += e.count;
    });

    const huntRef = doc(db, 'users', userId, HUNTS_COLLECTION, huntId);
    await updateDoc(huntRef, {
        outcome: {
            totalBirds,
            speciesBreakdown,
        },
        updatedAt: serverTimestamp(),
    });
}
