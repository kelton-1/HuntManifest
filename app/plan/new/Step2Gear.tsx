"use client";

import { useInventory } from "@/lib/storage";
import { InventoryCategory, INVENTORY_CATEGORIES, PlanGearItem, InventoryItem } from "@/lib/types";
import { CategoryIcon } from "@/app/components/CategoryIcon";
import { useState } from "react";
import { Check, Search } from "lucide-react";

interface Step2Props {
    selectedGear: PlanGearItem[];
    setSelectedGear: (gear: PlanGearItem[]) => void;
    onNext: () => void;
}

export function Step2Gear({ selectedGear, setSelectedGear, onNext }: Step2Props) {
    const { inventory } = useInventory();
    const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
    const [search, setSearch] = useState("");

    const toggleItem = (item: InventoryItem) => {
        const exists = selectedGear.find(g => g.id === item.id);
        if (exists) {
            setSelectedGear(selectedGear.filter(g => g.id !== item.id));
        } else {
            setSelectedGear([...selectedGear, {
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                checked: false
            }]);
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="space-y-4 animate-slide-up h-full flex flex-col">
            {/* Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search specific gear..."
                        className="input w-full pl-10 py-2.5 text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                    >
                        All
                    </button>
                    {INVENTORY_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
                {filteredInventory.map(item => {
                    const isSelected = selectedGear.some(g => g.id === item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border hover:bg-secondary/50'}`}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                                {isSelected ? <Check className="h-5 w-5" /> : <CategoryIcon category={item.category} className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{item.name}</h4>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                        {selectedGear.length} items selected
                    </span>
                </div>
                <button
                    onClick={onNext}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                    Next: Review Plan
                </button>
            </div>
        </div>
    );
}
