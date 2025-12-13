import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    HuntPlan,
    PlanGearSelection,
    PlanTask,
    PlanStatus,
    InventoryItem
} from './models';

const PLANS_COLLECTION = 'plans';
const SELECTIONS_COLLECTION = 'selections';
const TASKS_COLLECTION = 'tasks';

// ==========================================
// Converters
// ==========================================

const planConverter = {
    toFirestore: (data: HuntPlan): DocumentData => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = data;
        return rest;
    },
    fromFirestore: (doc: QueryDocumentSnapshot): HuntPlan => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startAt: data.startAt as Timestamp,
            endAt: data.endAt as Timestamp,
            conditions: data.conditions ? {
                ...data.conditions,
                observedAt: data.conditions.observedAt as Timestamp,
            } : undefined,
            summary: data.summary ? {
                ...data.summary,
                lastEditedAt: data.summary.lastEditedAt as Timestamp,
            } : undefined,
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
        } as HuntPlan;
    },
};

// ==========================================
// Plans (Top Level)
// ==========================================

export async function getHuntPlans(
    userId: string,
    statusFilter?: PlanStatus[]
): Promise<HuntPlan[]> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION).withConverter(planConverter);
    let q = query(colRef, orderBy('updatedAt', 'desc'));

    if (statusFilter && statusFilter.length > 0) {
        q = query(colRef, where('status', 'in', statusFilter), orderBy('updatedAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
}

export async function getHuntPlan(userId: string, planId: string): Promise<HuntPlan | null> {
    const docRef = doc(db, 'users', userId, PLANS_COLLECTION, planId).withConverter(planConverter);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
}

export async function createHuntPlan(
    userId: string,
    plan: Omit<HuntPlan, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION);

    const docRef = await addDoc(colRef, {
        ...plan,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function updateHuntPlan(
    userId: string,
    planId: string,
    updates: Partial<Omit<HuntPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    const docRef = doc(db, 'users', userId, PLANS_COLLECTION, planId);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

// ==========================================
// Selections (Sub-collection)
// ==========================================

export async function getPlanSelections(
    userId: string,
    planId: string
): Promise<PlanGearSelection[]> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION, planId, SELECTIONS_COLLECTION);
    const q = query(colRef, orderBy('sortOrder', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt as Timestamp,
        updatedAt: doc.data().updatedAt as Timestamp,
    } as PlanGearSelection));
}

/**
 * Add a gear item to the plan.
 * Captures snapshot of key item details at this moment.
 */
export async function addPlanSelection(
    userId: string,
    planId: string,
    inventoryItem: InventoryItem,
    details: Pick<PlanGearSelection, 'quantityPlanned' | 'role' | 'notes' | 'sortOrder'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION, planId, SELECTIONS_COLLECTION);

    // Snapshot the item details
    const selectionData = {
        planId,
        inventoryItemId: inventoryItem.id,
        quantityPlanned: details.quantityPlanned,
        unitType: inventoryItem.unitType, // copied
        role: details.role,
        notes: details.notes || '',
        sortOrder: details.sortOrder || 0,
        itemSnapshot: {
            category: inventoryItem.category,
            name: inventoryItem.name,
            brand: inventoryItem.brand,
            attributes: inventoryItem.attributes,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(colRef, selectionData);

    // Update Plan summary (denormalized count)
    // Note: For high concurrency, use a transaction or cloud function. For now, client-side increment is fine.
    await updatePlanSummary(userId, planId);

    return docRef.id;
}

export async function removePlanSelection(
    userId: string,
    planId: string,
    selectionId: string
): Promise<void> {
    const docRef = doc(db, 'users', userId, PLANS_COLLECTION, planId, SELECTIONS_COLLECTION, selectionId);
    await deleteDoc(docRef);
    await updatePlanSummary(userId, planId);
}

// Helper to update plan summary stats
async function updatePlanSummary(userId: string, planId: string) {
    const selections = await getPlanSelections(userId, planId);
    const count = selections.length;
    // Get unique categories for chips
    const categories = Array.from(new Set(selections.map(s => s.itemSnapshot.category))).slice(0, 3);

    await updateHuntPlan(userId, planId, {
        summary: {
            gearLineCount: count,
            gearKey: categories,
            lastEditedAt: Timestamp.now(),
        }
    });
}

// ==========================================
// Tasks (Sub-collection)
// ==========================================

export async function getPlanTasks(userId: string, planId: string): Promise<PlanTask[]> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION, planId, TASKS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt as Timestamp,
        updatedAt: doc.data().updatedAt as Timestamp,
    } as PlanTask));
}

export async function addPlanTask(
    userId: string,
    planId: string,
    task: Omit<PlanTask, 'id' | 'planId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    const colRef = collection(db, 'users', userId, PLANS_COLLECTION, planId, TASKS_COLLECTION);
    const docRef = await addDoc(colRef, {
        ...task,
        planId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function togglePlanTaskStatus(
    userId: string,
    planId: string,
    taskId: string,
    newStatus: 'open' | 'done'
): Promise<void> {
    const docRef = doc(db, 'users', userId, PLANS_COLLECTION, planId, TASKS_COLLECTION, taskId);
    await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
    });
}
