"use client";

import { useState, useEffect, useCallback } from "react";
import { InventoryItem, HuntLog, ItemStatus } from "./types";
import { useAuth } from "./auth";
import * as firestoreService from "./firestore";
import { MASTER_INVENTORY_LIST } from "./inventory-data";

// ============================================
// GENERIC LOCALSTORAGE HOOK (fallback)
// ============================================

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}

// ============================================
// INVENTORY HOOK (Firestore + localStorage fallback)
// ============================================

export function useInventory() {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Generate IDs for local master list to ensure keys work
    const initialLocalState = MASTER_INVENTORY_LIST.map((item, idx) => ({
        ...item,
        id: `local-${idx}`,
        // ensure default fields
        status: (item.status || 'READY') as ItemStatus,
        specs: item.specs || {},
        createdAt: new Date(),
    })) as InventoryItem[];

    const [localInventory, setLocalInventory] = useLocalStorage<InventoryItem[]>(
        "timber_inventory_v2", // New key to avoid conflict with old schema
        initialLocalState
    );

    // Load inventory based on auth state
    useEffect(() => {
        const loadInventory = async () => {
            if (user) {
                try {
                    const items = await firestoreService.getInventory(user.uid);
                    setInventory(items);
                } catch (error) {
                    console.error("Error loading inventory from Firestore:", error);
                    setInventory(localInventory);
                }
            } else {
                setInventory(localInventory);
            }
            setLoading(false);
        };
        loadInventory();
    }, [user, localInventory]);

    const addItem = useCallback(async (item: InventoryItem) => {
        if (user) {
            try {
                // Omit the existing id since Firestore will generate a new one
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _, ...itemData } = item;
                const newId = await firestoreService.addInventoryItem(user.uid, itemData);
                setInventory((prev) => [{ ...itemData, id: newId, specs: itemData.specs || {} }, ...prev]);
            } catch (error) {
                console.error("Error adding item to Firestore:", error);
            }
        } else {
            const newItem = { ...item, id: `local-${Date.now()}` };
            setLocalInventory((prev) => [newItem, ...prev]);
            setInventory((prev) => [newItem, ...prev]);
        }
    }, [user, setLocalInventory]);

    const updateItem = useCallback(async (updatedItem: InventoryItem) => {
        if (user) {
            try {
                const { id, ...data } = updatedItem;
                await firestoreService.updateInventoryItem(user.uid, id, data);
                setInventory((prev) =>
                    prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
                );
            } catch (error) {
                console.error("Error updating item in Firestore:", error);
            }
        } else {
            setLocalInventory((prev) =>
                prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
            );
            setInventory((prev) =>
                prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
            );
        }
    }, [user, setLocalInventory]);

    const deleteItem = useCallback(async (id: string) => {
        if (user) {
            try {
                await firestoreService.deleteInventoryItem(user.uid, id);
                setInventory((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
                console.error("Error deleting item from Firestore:", error);
            }
        } else {
            setLocalInventory((prev) => prev.filter((item) => item.id !== id));
            setInventory((prev) => prev.filter((item) => item.id !== id));
        }
    }, [user, setLocalInventory]);

    const toggleStatus = useCallback(async (id: string, currentStatus: InventoryItem['status']) => {
        // Ready <-> Packed logic
        const newStatus = (currentStatus === 'PACKED' ? 'READY' : 'PACKED') as ItemStatus;
        const item = inventory.find(i => i.id === id);
        if (!item) return;

        const updated = { ...item, status: newStatus };

        if (user) {
            try {
                await firestoreService.updateInventoryItem(user.uid, id, { status: newStatus });
                setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
            } catch (error) {
                console.error("Error updating status in Firestore:", error);
            }
        } else {
            setLocalInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
            setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
        }
    }, [user, inventory, setLocalInventory]);

    const setItemStatus = useCallback(async (id: string, status: InventoryItem['status']) => {
        const item = inventory.find(i => i.id === id);
        if (!item) return;
        const updated = { ...item, status };

        if (user) {
            try {
                await firestoreService.updateInventoryItem(user.uid, id, { status });
                setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
            } catch (error) {
                console.error("Error setting status in Firestore:", error);
            }
        } else {
            setLocalInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
            setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
        }
    }, [user, inventory, setLocalInventory]);


    const resetPostHunt = useCallback(async () => {
        if (user) {
            try {
                await firestoreService.resetPostHunt(user.uid);
                // Optimistic update
                setInventory((prev) => prev.map((item) =>
                    // Only reset PACKED to READY. Leave MISSING as is.
                    item.status === 'PACKED' ? { ...item, status: 'READY' } : item
                ));
            } catch (error) {
                console.error("Error resetting post-hunt in Firestore:", error);
            }
        } else {
            const resetFn = (items: InventoryItem[]) => items.map(item =>
                item.status === 'PACKED' ? { ...item, status: 'READY' as ItemStatus } : item
            );
            setLocalInventory(prev => resetFn(prev));
            setInventory(prev => resetFn(prev));
        }
    }, [user, setLocalInventory]);

    const seedInventory = useCallback(async () => {
        if (user) {
            try {
                await firestoreService.seedMasterInventory(user.uid);
                // Reload inventory
                const items = await firestoreService.getInventory(user.uid);
                setInventory(items);
            } catch (error) {
                console.error("Error seeding inventory in Firestore:", error);
            }
        } else {
            // Re-initialize local
            setLocalInventory(initialLocalState);
            setInventory(initialLocalState);
        }
    }, [user, setLocalInventory, initialLocalState]);


    const clearInventory = useCallback(async () => {
        if (user) {
            try {
                await firestoreService.clearInventoryItems(user.uid);
                setInventory([]);
            } catch (error) {
                console.error("Error clearing inventory in Firestore:", error);
            }
        } else {
            setLocalInventory([]);
            setInventory([]);
        }
    }, [user, setLocalInventory]);

    return {
        inventory,
        loading,
        addItem,
        updateItem,
        deleteItem,
        toggleStatus,
        setItemStatus,
        resetPostHunt,
        seedInventory,
        clearInventory
    };
}

// ============================================
// HUNT LOGS HOOK (Firestore + localStorage fallback)
// ============================================

export function useHuntLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<HuntLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [localLogs, setLocalLogs] = useLocalStorage<HuntLog[]>("timber_hunt_logs", []);

    // Load logs based on auth state
    useEffect(() => {
        const loadLogs = async () => {
            if (user) {
                try {
                    const items = await firestoreService.getHuntLogs(user.uid);
                    setLogs(items);
                } catch (error) {
                    console.error("Error loading hunt logs from Firestore:", error);
                    setLogs(localLogs);
                }
            } else {
                setLogs(localLogs);
            }
            setLoading(false);
        };
        loadLogs();
    }, [user, localLogs]);

    const addLog = useCallback(async (log: HuntLog) => {
        if (user) {
            try {
                // Omit the existing id since Firestore will generate a new one
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _, ...logData } = log;
                const newId = await firestoreService.addHuntLog(user.uid, logData);
                setLogs((prev) => [{ ...logData, id: newId }, ...prev]);
            } catch (error) {
                console.error("Error adding hunt log to Firestore:", error);
            }
        } else {
            setLocalLogs((prev) => [log, ...prev]);
            setLogs((prev) => [log, ...prev]);
        }
    }, [user, setLocalLogs]);

    const deleteLog = useCallback(async (id: string) => {
        if (user) {
            try {
                await firestoreService.deleteHuntLog(user.uid, id);
                setLogs((prev) => prev.filter((log) => log.id !== id));
            } catch (error) {
                console.error("Error deleting hunt log from Firestore:", error);
            }
        } else {
            setLocalLogs((prev) => prev.filter((log) => log.id !== id));
            setLogs((prev) => prev.filter((log) => log.id !== id));
        }
    }, [user, setLocalLogs]);

    const clearLogs = useCallback(async () => {
        if (user) {
            try {
                await firestoreService.clearHuntLogs(user.uid);
                setLogs([]);
            } catch (error) {
                console.error("Error clearing hunt logs in Firestore:", error);
            }
        } else {
            setLocalLogs([]);
            setLogs([]);
        }
    }, [user, setLocalLogs]);

    return { logs, loading, addLog, deleteLog, clearLogs };
}
