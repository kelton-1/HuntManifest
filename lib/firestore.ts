"use client";

import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { InventoryItem, HuntLog, AuditLogEntry, AuditAction } from "./types";

// ============================================
// USER PROFILE
// ============================================

export interface UserProfile {
    hunterName: string;
    experience: "first" | "intermediate" | "veteran" | null;
    homeLocation: string;
    temperatureUnit: "F" | "C";
    windSpeedUnit: "mph" | "kph";
    notificationsEnabled: boolean;
    onboardingCompleted: boolean;
    onboardingCompletedAt: Timestamp | null;
    createdAt: Timestamp;
}

const DEFAULT_PROFILE: Omit<UserProfile, "createdAt"> = {
    hunterName: "Hunter",
    experience: null,
    homeLocation: "",
    temperatureUnit: "F",
    windSpeedUnit: "mph",
    notificationsEnabled: true,
    onboardingCompleted: false,
    onboardingCompletedAt: null,
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", userId, "profile", "data");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

export async function createUserProfile(userId: string, data: Partial<UserProfile> = {}): Promise<void> {
    const docRef = doc(db, "users", userId, "profile", "data");
    await setDoc(docRef, {
        ...DEFAULT_PROFILE,
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, "users", userId, "profile", "data");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        await createUserProfile(userId, data);
    } else {
        await updateDoc(docRef, data);
    }
}

// ============================================
// INVENTORY
// ============================================

export async function getInventory(userId: string): Promise<InventoryItem[]> {
    const colRef = collection(db, "users", userId, "inventory");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as InventoryItem[];
}

export async function addInventoryItem(userId: string, item: Omit<InventoryItem, "id">): Promise<string> {
    const colRef = collection(db, "users", userId, "inventory");
    const docRef = doc(colRef);
    await setDoc(docRef, {
        ...item,
        status: item.status || 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateInventoryItem(userId: string, itemId: string, data: Partial<InventoryItem>): Promise<void> {
    const docRef = doc(db, "users", userId, "inventory", itemId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteInventoryItem(userId: string, itemId: string): Promise<void> {
    const docRef = doc(db, "users", userId, "inventory", itemId);
    await deleteDoc(docRef);
}

export async function clearInventoryItems(userId: string): Promise<void> {
    const colRef = collection(db, "users", userId, "inventory");
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}

// ============================================
// HUNT LOGS
// ============================================

export async function getHuntLogs(userId: string): Promise<HuntLog[]> {
    const colRef = collection(db, "users", userId, "huntLogs");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as HuntLog[];
}

export async function addHuntLog(userId: string, log: Omit<HuntLog, "id">): Promise<string> {
    const colRef = collection(db, "users", userId, "huntLogs");
    const docRef = doc(colRef);
    await setDoc(docRef, {
        ...log,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function deleteHuntLog(userId: string, logId: string): Promise<void> {
    const docRef = doc(db, "users", userId, "huntLogs", logId);
    await deleteDoc(docRef);
}

export async function clearHuntLogs(userId: string): Promise<void> {
    const colRef = collection(db, "users", userId, "huntLogs");
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}
