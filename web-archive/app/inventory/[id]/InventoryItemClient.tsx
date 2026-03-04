"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Minus, Plus, Copy, Trash2, Check, ChevronDown, X } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryCategory, ItemCondition, ItemStatus, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { motion, AnimatePresence } from "framer-motion";

const CONDITIONS: ItemCondition[] = ["New", "Excellent", "Good", "Fair", "Poor"];
const STATUSES: { value: ItemStatus; label: string; color: string; bg: string }[] = [
    { value: "READY", label: "Ready", color: "text-emerald-500", bg: "bg-emerald-500" },
    { value: "PACKED", label: "Packed", color: "text-amber-500", bg: "bg-amber-500" },
    { value: "MISSING", label: "Missing", color: "text-red-500", bg: "bg-red-500" },
];

type EditingField = "name" | "brand" | "category" | "quantity" | "cost" | "condition" | "status" | "notes" | null;

export default function InventoryItemDetailClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { inventory, loading, updateItem, deleteItem, addItem } = useInventory();

    const id = searchParams.get("id") || "";
    const item = id ? inventory.find((i) => i.id === id) : undefined;

    const [editingField, setEditingField] = useState<EditingField>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (editingField && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingField]);

    const startEditing = useCallback((field: EditingField, currentValue: string) => {
        hapticLight();
        setEditingField(field);
        setEditValue(currentValue);
    }, []);

    const saveField = useCallback(async (field: EditingField, value: string) => {
        if (!item || !field) return;
        hapticLight();

        const updates: Record<string, unknown> = { updatedAt: new Date() };

        switch (field) {
            case "name":
                if (!value.trim()) return;
                updates.name = value.trim();
                break;
            case "brand":
                updates.specs = { ...item.specs, brand: value.trim() || undefined };
                break;
            case "category":
                updates.category = value as InventoryCategory;
                break;
            case "quantity":
                updates.quantity = Math.max(0, parseInt(value) || 0);
                break;
            case "cost":
                updates.purchasePrice = parseFloat(value) || undefined;
                break;
            case "condition":
                updates.condition = value as ItemCondition;
                break;
            case "status":
                updates.status = value as ItemStatus;
                break;
            case "notes":
                updates.notes = value.trim() || undefined;
                break;
        }

        await updateItem({ ...item, ...updates });
        setEditingField(null);
    }, [item, updateItem]);

    const cancelEditing = useCallback(() => {
        setEditingField(null);
        setEditValue("");
    }, []);

    const handleDuplicate = useCallback(async () => {
        if (!item) return;
        hapticLight();
        const dup = {
            ...item,
            id: crypto.randomUUID(),
            name: `${item.name} (copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await addItem(dup);
        router.push(`/inventory/detail?id=${dup.id}`);
    }, [item, addItem, router]);

    const handleDelete = useCallback(() => {
        if (!item) return;
        hapticMedium();
        deleteItem(item.id);
        router.replace("/inventory");
    }, [item, deleteItem, router]);

    if (loading || !id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
                <p>Item not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    const totalValue = (item.purchasePrice || 0) * item.quantity;
    const statusConfig = STATUSES.find((s) => s.value === item.status) || STATUSES[0];
    const createdDate = item.createdAt
        ? new Date(item.createdAt instanceof Date ? item.createdAt : item.createdAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-background pb-32 animate-fade-in">
            {/* Header */}
            <header className="pt-2 px-5 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <button
                        onClick={() => router.back()}
                        className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        {editingField === "name" ? (
                            <div className="flex items-center gap-2">
                                <input
                                    ref={editInputRef as React.RefObject<HTMLInputElement>}
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveField("name", editValue);
                                        if (e.key === "Escape") cancelEditing();
                                    }}
                                    className="flex-1 bg-transparent text-lg font-bold outline-none border-b-2 border-primary py-0.5"
                                />
                                <button onClick={() => saveField("name", editValue)} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-primary" />
                                </button>
                                <button onClick={cancelEditing} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => startEditing("name", item.name)}
                                className="text-left w-full group"
                            >
                                <h1 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{item.name}</h1>
                                <p className="text-xs text-muted-foreground">{item.specs?.brand || item.category} &middot; Tap to edit</p>
                            </button>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CategoryIcon category={item.category} className="h-5 w-5 text-primary" />
                    </div>
                </motion.div>
            </header>

            <main className="px-5 pb-8 space-y-5">
                {/* Status + Category Row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {/* Status Selector */}
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Status</p>
                        <div className="flex gap-1.5">
                            {STATUSES.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => { hapticLight(); saveField("status", s.value); }}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                        item.status === s.value
                                            ? `${s.bg}/15 ${s.color} ring-1 ring-current`
                                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total Value */}
                    <div className="glass-card rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Total Value</p>
                        <p className="font-bold font-mono text-lg text-primary">
                            {totalValue > 0 ? `$${totalValue.toFixed(2)}` : "—"}
                        </p>
                    </div>
                </motion.div>

                {/* Quantity Stepper */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</p>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => { hapticLight(); saveField("quantity", String(Math.max(0, item.quantity - 1))); }}
                                className="w-[52px] h-[52px] rounded-[0.875rem] bg-primary/12 text-primary flex items-center justify-center font-bold active:scale-92 transition-transform"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <div className="flex-1 text-center">
                                <p className="text-4xl font-bold font-mono">{item.quantity}</p>
                                <p className="text-xs text-muted-foreground mt-1">units</p>
                            </div>
                            <button
                                onClick={() => { hapticLight(); saveField("quantity", String(item.quantity + 1)); }}
                                className="w-[52px] h-[52px] rounded-[0.875rem] bg-primary/12 text-primary flex items-center justify-center font-bold active:scale-92 transition-transform"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Editable Details */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details</p>
                    <div className="glass-card rounded-2xl divide-y divide-white/5">
                        {/* Brand */}
                        <EditableRow
                            label="Brand"
                            value={item.specs?.brand || ""}
                            placeholder="Add brand"
                            isEditing={editingField === "brand"}
                            editValue={editValue}
                            onStartEdit={() => startEditing("brand", item.specs?.brand || "")}
                            onSave={(v) => saveField("brand", v)}
                            onCancel={cancelEditing}
                            onChange={setEditValue}
                            inputRef={editInputRef}
                        />

                        {/* Category */}
                        {editingField === "category" ? (
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    <button onClick={cancelEditing} className="text-xs text-primary font-bold">Done</button>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {INVENTORY_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => saveField("category", cat)}
                                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                                                item.category === cat
                                                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                            }`}
                                        >
                                            <CategoryIcon category={cat} className="h-3.5 w-3.5" />
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => startEditing("category", item.category)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="text-sm text-muted-foreground">Category</span>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={item.category} className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-medium">{item.category}</span>
                                </div>
                            </button>
                        )}

                        {/* Unit Cost */}
                        <EditableRow
                            label="Unit Cost"
                            value={item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : ""}
                            rawValue={item.purchasePrice ? String(item.purchasePrice) : ""}
                            placeholder="Add cost"
                            isEditing={editingField === "cost"}
                            editValue={editValue}
                            onStartEdit={() => startEditing("cost", item.purchasePrice ? String(item.purchasePrice) : "")}
                            onSave={(v) => saveField("cost", v)}
                            onCancel={cancelEditing}
                            onChange={setEditValue}
                            inputRef={editInputRef}
                            inputType="number"
                            prefix="$"
                        />

                        {/* Condition */}
                        {editingField === "condition" ? (
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Condition</span>
                                    <button onClick={cancelEditing} className="text-xs text-primary font-bold">Done</button>
                                </div>
                                <div className="flex gap-1.5">
                                    {CONDITIONS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => saveField("condition", c)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                item.condition === c
                                                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => startEditing("condition", item.condition || "Good")}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="text-sm text-muted-foreground">Condition</span>
                                <span className="text-sm font-medium">{item.condition || "—"}</span>
                            </button>
                        )}

                        {/* Date Added */}
                        {createdDate && (
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Date added</span>
                                <span className="text-sm font-medium">{createdDate}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
                    {editingField === "notes" ? (
                        <div className="glass-card rounded-2xl p-4 space-y-3">
                            <textarea
                                ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={4}
                                className="w-full bg-transparent text-sm outline-none resize-none"
                                placeholder="Add notes..."
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={cancelEditing} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">
                                    Cancel
                                </button>
                                <button onClick={() => saveField("notes", editValue)} className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-bold">
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => startEditing("notes", item.notes || "")}
                            className="w-full glass-card rounded-2xl p-4 text-left hover:bg-white/[0.02] transition-colors"
                        >
                            {item.notes ? (
                                <p className="text-sm leading-relaxed">{item.notes}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Tap to add notes...</p>
                            )}
                        </button>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-3"
                >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</p>
                    <button
                        onClick={handleDuplicate}
                        className="w-full py-3.5 rounded-xl bg-secondary text-foreground font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Duplicate Item
                    </button>

                    {/* Delete */}
                    {showDeleteConfirm ? (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                            <p className="text-sm font-bold text-red-400 mb-3">Delete "{item.name}"? This can't be undone.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-bold text-sm active:scale-[0.98] transition-transform"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Item
                        </button>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

/* ─── Reusable Inline-Editable Row ─── */
function EditableRow({
    label,
    value,
    rawValue,
    placeholder,
    isEditing,
    editValue,
    onStartEdit,
    onSave,
    onCancel,
    onChange,
    inputRef,
    inputType = "text",
    prefix,
}: {
    label: string;
    value: string;
    rawValue?: string;
    placeholder: string;
    isEditing: boolean;
    editValue: string;
    onStartEdit: () => void;
    onSave: (value: string) => void;
    onCancel: () => void;
    onChange: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    inputType?: string;
    prefix?: string;
}) {
    if (isEditing) {
        return (
            <div className="p-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                <div className="flex-1 flex items-center gap-2">
                    {prefix && <span className="text-primary font-bold text-sm">{prefix}</span>}
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type={inputType}
                        value={editValue}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSave(editValue);
                            if (e.key === "Escape") onCancel();
                        }}
                        className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-primary"
                        placeholder={placeholder}
                        step={inputType === "number" ? "0.01" : undefined}
                        min={inputType === "number" ? "0" : undefined}
                    />
                </div>
                <button onClick={() => onSave(editValue)} className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                </button>
                <button onClick={onCancel} className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={onStartEdit}
            className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm ${value ? "font-medium" : "text-muted-foreground/50"}`}>
                {value || placeholder}
            </span>
        </button>
    );
}
