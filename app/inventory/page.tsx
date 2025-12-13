"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronDown, Trash2, Edit2, Package, Filter } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryItem, InventoryCategory, INVENTORY_CATEGORIES } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";

// Sample items to show when user wants to see what a full inventory looks like
const SAMPLE_ITEMS: Partial<InventoryItem>[] = [
    { name: "Mallard Drake Decoys", category: "Decoy", quantity: 12, status: "READY", specs: { brand: "Avian-X", species: "Mallard", decoyType: "Floater" } },
    { name: "Mallard Hen Decoys", category: "Decoy", quantity: 6, status: "READY", specs: { brand: "Avian-X", species: "Mallard", decoyType: "Floater" } },
    { name: "Pintail Decoys", category: "Decoy", quantity: 6, status: "READY", specs: { brand: "GHG", species: "Pintail" } },
    { name: "Teal Decoys", category: "Decoy", quantity: 6, status: "READY", specs: { brand: "Dakota", species: "Teal" } },
    { name: "Canada Goose Shells", category: "Decoy", quantity: 24, status: "READY", specs: { brand: "Tanglefree", species: "Canada Goose", decoyType: "Shell" } },
    { name: "Motion Jerk Cord", category: "Decoy", quantity: 2, status: "READY", specs: {} },
    { name: "Double Reed Duck Call", category: "Call", quantity: 1, status: "READY", specs: { brand: "Zink", species: "Mallard" } },
    { name: "Single Reed Duck Call", category: "Call", quantity: 2, status: "READY", specs: { brand: "RNT", species: "Mallard" } },
    { name: "Goose Flute", category: "Call", quantity: 1, status: "READY", specs: { brand: "Foiles", species: "Canada Goose" } },
    { name: "Whistle Teal Call", category: "Call", quantity: 1, status: "READY", specs: { brand: "Haydel's", species: "Teal" } },
    { name: "Insulated Waders", category: "Waders", quantity: 1, status: "READY", specs: { brand: "Sitka" } },
    { name: "Camo Jacket", category: "Clothing", quantity: 2, status: "READY", specs: { brand: "Drake" } },
    { name: "Fleece Bibs", category: "Clothing", quantity: 1, status: "READY", specs: { brand: "Banded" } },
    { name: "Neoprene Gloves", category: "Clothing", quantity: 2, status: "READY", specs: { brand: "Drake" } },
    { name: "Camo Face Mask", category: "Clothing", quantity: 3, status: "READY", specs: {} },
    { name: "12ga Steel #2", category: "Ammo", quantity: 4, status: "READY", specs: { gauge: "12ga", shotSize: "#2" }, notes: "boxes" },
    { name: "12ga Steel BB", category: "Ammo", quantity: 2, status: "READY", specs: { gauge: "12ga", shotSize: "BB" }, notes: "boxes" },
    { name: "A-Frame Blind", category: "Blind", quantity: 1, status: "READY", specs: { brand: "Avery" } },
    { name: "Layout Blind", category: "Blind", quantity: 2, status: "READY", specs: { brand: "Tanglefree" } },
    { name: "Camo Netting", category: "Blind", quantity: 3, status: "READY", specs: {}, notes: "12ft sections" },
    { name: "Mud Boat", category: "Vehicle", quantity: 1, status: "READY", specs: { brand: "Go-Devil" } },
    { name: "ATV", category: "Vehicle", quantity: 1, status: "READY", specs: { brand: "Polaris" } },
    { name: "Headlamp", category: "Other", quantity: 2, status: "READY", specs: { brand: "Petzl" } },
    { name: "Decoy Bag", category: "Other", quantity: 4, status: "READY", specs: { brand: "Rig'Em Right" } },
    { name: "Thermos", category: "Other", quantity: 1, status: "READY", specs: {} },
    { name: "First Aid Kit", category: "Safety", quantity: 1, status: "READY", specs: {} },
];

type ViewMode = "grid" | "list";

export default function InventoryPage() {
    const { inventory, deleteItem, seedInventory, addItem } = useInventory();
    const [activeCategory, setActiveCategory] = useState<InventoryCategory | "all">("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [showSamplePreview, setShowSamplePreview] = useState(false);

    // Filter inventory
    const filteredInventory = inventory.filter(item => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch = searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.specs?.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Get category counts
    const categoryCounts = INVENTORY_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = inventory.filter(item => item.category === cat).length;
        return acc;
    }, {} as Record<InventoryCategory, number>);

    // Categories with items (for tabs)
    const activeCategories = INVENTORY_CATEGORIES.filter(cat => categoryCounts[cat] > 0);

    // Handle delete with confirmation
    const handleDelete = (id: string) => {
        if (deleteConfirmId === id) {
            deleteItem(id);
            setDeleteConfirmId(null);
        } else {
            setDeleteConfirmId(id);
            // Auto-clear after 3 seconds
            setTimeout(() => setDeleteConfirmId(null), 3000);
        }
    };

    // Load sample items for preview
    const loadSampleItems = () => {
        SAMPLE_ITEMS.forEach((item, index) => {
            setTimeout(() => {
                addItem(item as InventoryItem);
            }, index * 50);
        });
        setShowSamplePreview(false);
    };

    // Display items (either real inventory or sample preview)
    const displayItems = showSamplePreview
        ? SAMPLE_ITEMS.map((item, i) => ({ ...item, id: `sample-${i}`, userId: 'sample' })) as InventoryItem[]
        : filteredInventory;

    return (
        <div className="pb-24 animate-fade-in relative min-h-screen bg-background">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md pt-2 pb-3 border-b border-border/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory</h1>
                        <p className="text-xs text-muted-foreground">
                            {inventory.length} items • {activeCategories.length} categories
                        </p>
                    </div>

                    {/* Add Button */}
                    <Link
                        href="/inventory/add"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                </div>

                {/* Category Pills */}
                {inventory.length > 0 && (
                    <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide pb-1">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === "all"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                }`}
                        >
                            All ({inventory.length})
                        </button>
                        {activeCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                <CategoryIcon category={cat} className="h-3 w-3" />
                                {cat} ({categoryCounts[cat]})
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Empty State / Cold Start */}
            {inventory.length === 0 && !showSamplePreview && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-slide-up">
                    <div className="p-6 bg-mallard-green/10 rounded-full mb-6 relative">
                        <div className="absolute inset-0 animate-ping opacity-20 bg-mallard-green rounded-full"></div>
                        <Package className="h-12 w-12 text-mallard-green" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Build Your Loadout</h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                        Get started with our pro-curated list or add your own items.
                    </p>

                    <div className="w-full max-w-sm space-y-3">
                        <button
                            onClick={() => seedInventory()}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Load Master Gear List
                        </button>

                        <button
                            onClick={() => setShowSamplePreview(true)}
                            className="w-full py-3 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-all"
                        >
                            Preview What It Looks Like
                        </button>

                        <Link
                            href="/inventory/add"
                            className="block w-full py-3 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Or add items manually →
                        </Link>
                    </div>
                </div>
            )}

            {/* Sample Preview Banner */}
            {showSamplePreview && (
                <div className="mx-4 mt-4 p-3 bg-mallard-yellow/10 border border-mallard-yellow/30 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Preview Mode</p>
                            <p className="text-xs text-muted-foreground">Showing sample inventory</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSamplePreview(false)}
                                className="px-3 py-1.5 text-xs font-medium bg-secondary rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={loadSampleItems}
                                className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg"
                            >
                                Use These Items
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inventory Grid */}
            {(inventory.length > 0 || showSamplePreview) && (
                <div className="p-4 grid grid-cols-2 gap-3">
                    {displayItems.map((item) => (
                        <div
                            key={item.id}
                            className="relative bg-card border border-border rounded-xl p-3 shadow-sm group"
                        >
                            {/* Category Icon Badge */}
                            <div className="absolute -top-2 -left-2 p-1.5 bg-mallard-yellow/20 rounded-lg border border-mallard-yellow/30">
                                <CategoryIcon category={item.category} className="h-3.5 w-3.5 text-mallard-yellow" />
                            </div>

                            {/* Quick Actions (shown on hover/tap) */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/inventory/edit/${item.id}`}
                                    className="p-1.5 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${deleteConfirmId === item.id
                                        ? "bg-red-500 text-white"
                                        : "bg-secondary hover:bg-red-100 hover:text-red-600"
                                        }`}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="pt-2">
                                <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                                    {item.name}
                                </p>
                                {item.specs?.brand && (
                                    <p className="text-[10px] text-muted-foreground mb-2">{item.specs.brand}</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        Qty: <span className="font-bold text-foreground">{item.quantity}</span>
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground uppercase">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card */}
                    <Link
                        href={activeCategory !== "all" ? `/inventory/add?category=${activeCategory}` : "/inventory/add"}
                        className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all min-h-[120px]"
                    >
                        <Plus className="h-6 w-6" />
                        <span className="text-xs font-medium">Add Item</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
