"use client";

import { useState, useEffect } from "react";
import { InventoryItem, HuntLog, INITIAL_INVENTORY_SEEDS } from "./types";

// Generic hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
    // Pass initial state function to useState so logic only runs once
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
            // Allow value to be a function so we have same API as useState
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

export function useInventory() {
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>(
        "timber_inventory",
        INITIAL_INVENTORY_SEEDS
    );

    const addItem = (item: InventoryItem) => {
        setInventory((prev) => [...prev, item]);
    };

    const updateItem = (updatedItem: InventoryItem) => {
        setInventory((prev) =>
            prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
    };

    const deleteItem = (id: string) => {
        setInventory((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleChecked = (id: string) => {
        setInventory((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isChecked: !item.isChecked } : item
            )
        );
    };

    const resetChecks = () => {
        setInventory((prev) => prev.map((item) => ({ ...item, isChecked: false })));
    };

    const clearInventory = () => {
        setInventory([]);
    };

    return { inventory, addItem, updateItem, deleteItem, toggleChecked, resetChecks, clearInventory };
}

export function useHuntLogs() {
    const [logs, setLogs] = useLocalStorage<HuntLog[]>("timber_hunt_logs", []);

    const addLog = (log: HuntLog) => {
        setLogs((prev) => [log, ...prev]);
    };

    const deleteLog = (id: string) => {
        setLogs((prev) => prev.filter((log) => log.id !== id));
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return { logs, addLog, deleteLog, clearLogs };
}
