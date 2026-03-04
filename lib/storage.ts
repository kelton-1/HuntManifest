import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InventoryItem, HuntLog, HuntPlan, ItemStatus } from "./types";
import { useAuth } from "./auth";
import * as firestoreService from "./firestore";
import { MASTER_INVENTORY_LIST } from "./inventory-data";

async function getStoredValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

async function setStoredValue<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting AsyncStorage key "${key}":`, error);
  }
}

export function useInventory() {
  const { user, loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const initialLocalState = MASTER_INVENTORY_LIST.map((item, idx) => ({
    ...item,
    id: `local-${idx}`,
    status: (item.status || 'READY') as ItemStatus,
    specs: item.specs || {},
    createdAt: new Date(),
  })) as InventoryItem[];

  useEffect(() => {
    if (authLoading) return;
    const loadInventory = async () => {
      if (user) {
        try {
          const items = await firestoreService.getInventory(user.uid);
          setInventory(items);
        } catch (error) {
          console.error("Error loading inventory from Firestore:", error);
          const local = await getStoredValue<InventoryItem[]>("timber_inventory_v2", initialLocalState);
          setInventory(local);
        }
      } else {
        const local = await getStoredValue<InventoryItem[]>("timber_inventory_v2", initialLocalState);
        setInventory(local);
      }
      setLoading(false);
    };
    loadInventory();
  }, [user, authLoading]);

  const addItem = useCallback(async (item: InventoryItem) => {
    if (user) {
      try {
        const { id: _, ...itemData } = item;
        const newId = await firestoreService.addInventoryItem(user.uid, itemData);
        setInventory((prev) => [{ ...itemData, id: newId, specs: itemData.specs || {} }, ...prev]);
      } catch (error) {
        console.error("Error adding item to Firestore:", error);
      }
    } else {
      const newItem = { ...item, id: `local-${Date.now()}` };
      setInventory((prev) => {
        const updated = [newItem, ...prev];
        setStoredValue("timber_inventory_v2", updated);
        return updated;
      });
    }
  }, [user]);

  const updateItem = useCallback(async (updatedItem: InventoryItem) => {
    if (user) {
      try {
        const { id, ...data } = updatedItem;
        await firestoreService.updateInventoryItem(user.uid, id, data);
        setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      } catch (error) {
        console.error("Error updating item in Firestore:", error);
      }
    } else {
      setInventory((prev) => {
        const updated = prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));
        setStoredValue("timber_inventory_v2", updated);
        return updated;
      });
    }
  }, [user]);

  const deleteItem = useCallback(async (id: string) => {
    if (user) {
      try {
        await firestoreService.deleteInventoryItem(user.uid, id);
        setInventory((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting item from Firestore:", error);
      }
    } else {
      setInventory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        setStoredValue("timber_inventory_v2", updated);
        return updated;
      });
    }
  }, [user]);

  const toggleStatus = useCallback(async (id: string, currentStatus: InventoryItem['status']) => {
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
      setInventory((prev) => {
        const items = prev.map((i) => (i.id === id ? updated : i));
        setStoredValue("timber_inventory_v2", items);
        return items;
      });
    }
  }, [user, inventory]);

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
      setInventory((prev) => {
        const items = prev.map((i) => (i.id === id ? updated : i));
        setStoredValue("timber_inventory_v2", items);
        return items;
      });
    }
  }, [user, inventory]);

  const resetPostHunt = useCallback(async () => {
    if (user) {
      try {
        await firestoreService.resetPostHunt(user.uid);
        setInventory((prev) => prev.map((item) =>
          item.status === 'PACKED' ? { ...item, status: 'READY' as ItemStatus } : item
        ));
      } catch (error) {
        console.error("Error resetting post-hunt in Firestore:", error);
      }
    } else {
      setInventory((prev) => {
        const items = prev.map(item =>
          item.status === 'PACKED' ? { ...item, status: 'READY' as ItemStatus } : item
        );
        setStoredValue("timber_inventory_v2", items);
        return items;
      });
    }
  }, [user]);

  const seedInventory = useCallback(async () => {
    if (user) {
      try {
        await firestoreService.seedMasterInventory(user.uid);
        const items = await firestoreService.getInventory(user.uid);
        setInventory(items);
      } catch (error) {
        console.error("Error seeding inventory in Firestore:", error);
      }
    } else {
      setStoredValue("timber_inventory_v2", initialLocalState);
      setInventory(initialLocalState);
    }
  }, [user, initialLocalState]);

  const clearInventory = useCallback(async () => {
    if (user) {
      try {
        await firestoreService.clearInventoryItems(user.uid);
        setInventory([]);
      } catch (error) {
        console.error("Error clearing inventory in Firestore:", error);
      }
    } else {
      setStoredValue("timber_inventory_v2", []);
      setInventory([]);
    }
  }, [user]);

  return { inventory, loading, addItem, updateItem, deleteItem, toggleStatus, setItemStatus, resetPostHunt, seedInventory, clearInventory };
}

export function useHuntLogs() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<HuntLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const loadLogs = async () => {
      if (user) {
        try {
          const items = await firestoreService.getHuntLogs(user.uid);
          setLogs(items);
        } catch (error) {
          console.error("Error loading hunt logs from Firestore:", error);
          const local = await getStoredValue<HuntLog[]>("timber_hunt_logs", []);
          setLogs(local);
        }
      } else {
        const local = await getStoredValue<HuntLog[]>("timber_hunt_logs", []);
        setLogs(local);
      }
      setLoading(false);
    };
    loadLogs();
  }, [user, authLoading]);

  const addLog = useCallback(async (log: HuntLog) => {
    if (user) {
      try {
        const { id: _, ...logData } = log;
        const newId = await firestoreService.addHuntLog(user.uid, logData);
        setLogs((prev) => [{ ...logData, id: newId }, ...prev]);
      } catch (error) {
        console.error("Error adding hunt log to Firestore:", error);
      }
    } else {
      setLogs((prev) => {
        const updated = [log, ...prev];
        setStoredValue("timber_hunt_logs", updated);
        return updated;
      });
    }
  }, [user]);

  const deleteLog = useCallback(async (id: string) => {
    if (user) {
      try {
        await firestoreService.deleteHuntLog(user.uid, id);
        setLogs((prev) => prev.filter((log) => log.id !== id));
      } catch (error) {
        console.error("Error deleting hunt log from Firestore:", error);
      }
    } else {
      setLogs((prev) => {
        const updated = prev.filter((log) => log.id !== id);
        setStoredValue("timber_hunt_logs", updated);
        return updated;
      });
    }
  }, [user]);

  const clearLogs = useCallback(async () => {
    if (user) {
      try {
        await firestoreService.clearHuntLogs(user.uid);
        setLogs([]);
      } catch (error) {
        console.error("Error clearing hunt logs in Firestore:", error);
      }
    } else {
      setStoredValue("timber_hunt_logs", []);
      setLogs([]);
    }
  }, [user]);

  return { logs, loading, addLog, deleteLog, clearLogs };
}

export function useHuntPlans() {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<HuntPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const loadPlans = async () => {
      if (user) {
        try {
          const items = await firestoreService.getHuntPlans(user.uid);
          setPlans(items);
        } catch (error) {
          console.error("Error loading hunt plans from Firestore:", error);
          const local = await getStoredValue<HuntPlan[]>("timber_hunt_plans", []);
          setPlans(local);
        }
      } else {
        const local = await getStoredValue<HuntPlan[]>("timber_hunt_plans", []);
        setPlans(local);
      }
      setLoading(false);
    };
    loadPlans();
  }, [user, authLoading]);

  const addPlan = useCallback(async (plan: HuntPlan) => {
    if (user) {
      try {
        const { id: _, ...planData } = plan;
        const newId = await firestoreService.addHuntPlan(user.uid, planData);
        setPlans((prev) => [{ ...planData, id: newId }, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
      } catch (error) {
        console.error("Error adding hunt plan to Firestore:", error);
      }
    } else {
      setPlans((prev) => {
        const updated = [plan, ...prev].sort((a, b) => a.date.localeCompare(b.date));
        setStoredValue("timber_hunt_plans", updated);
        return updated;
      });
    }
  }, [user]);

  const updatePlan = useCallback(async (updatedPlan: HuntPlan) => {
    if (user) {
      try {
        const { id, ...data } = updatedPlan;
        await firestoreService.updateHuntPlan(user.uid, id, data);
        setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      } catch (error) {
        console.error("Error updating hunt plan in Firestore:", error);
      }
    } else {
      setPlans((prev) => {
        const updated = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
        setStoredValue("timber_hunt_plans", updated);
        return updated;
      });
    }
  }, [user]);

  const deletePlan = useCallback(async (id: string) => {
    if (user) {
      try {
        await firestoreService.deleteHuntPlan(user.uid, id);
        setPlans((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting hunt plan from Firestore:", error);
      }
    } else {
      setPlans((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        setStoredValue("timber_hunt_plans", updated);
        return updated;
      });
    }
  }, [user]);

  return { plans, loading, addPlan, updatePlan, deletePlan };
}
