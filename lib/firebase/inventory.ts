import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, InventoryStatus } from './models';

const INVENTORY_COLLECTION = 'inventory';

const getInventoryCollection = (userId: string) =>
    collection(db, 'users', userId, INVENTORY_COLLECTION);

const inventoryConverter = {
    toFirestore: (data: InventoryItem): DocumentData => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = data;
        return rest;
    },
    fromFirestore: (doc: QueryDocumentSnapshot): InventoryItem => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure timestamps are correctly typed
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
            usage: data.usage ? {
                lastUsedAt: data.usage.lastUsedAt as Timestamp,
                huntsUsedCount: data.usage.huntsUsedCount,
            } : undefined,
        } as InventoryItem;
    },
};

/**
 * Fetch all inventory items for a user.
 * Optional: filter by status (default: active).
 */
export async function getInventory(
    userId: string,
    status: InventoryStatus = 'active'
): Promise<InventoryItem[]> {
    const colRef = getInventoryCollection(userId).withConverter(inventoryConverter);
    const q = query(
        colRef,
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
}

/**
 * Add a new inventory item.
 */
export async function addInventoryItem(
    userId: string,
    item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<string> {
    const colRef = getInventoryCollection(userId).withConverter(inventoryConverter);
    const docRef = doc(colRef);

    const newItem: InventoryItem = {
        id: docRef.id,
        userId,
        ...item,
        createdAt: serverTimestamp() as Timestamp, // temporary cast for local type check
        updatedAt: serverTimestamp() as Timestamp,
    };

    // Create with standard setDoc to let Firestore handle serverTimestamp
    await setDoc(docRef, {
        ...item,
        id: docRef.id, // Store ID in doc as well to match type
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Update an existing inventory item.
 */
export async function updateInventoryItem(
    userId: string,
    itemId: string,
    updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    const docRef = doc(db, 'users', userId, INVENTORY_COLLECTION, itemId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Soft delete an inventory item by setting status to 'archived'.
 */
export async function archiveInventoryItem(
    userId: string,
    itemId: string
): Promise<void> {
    return updateInventoryItem(userId, itemId, { status: 'archived' });
}

/**
 * Hard delete an inventory item.
 * Use with caution.
 */
export async function deleteInventoryItem(
    userId: string,
    itemId: string
): Promise<void> {
    const docRef = doc(db, 'users', userId, INVENTORY_COLLECTION, itemId);
    await deleteDoc(docRef);
}
