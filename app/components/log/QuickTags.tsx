"use client";

interface QuickTagsProps {
    selected: string[];
    onChange: (tags: string[]) => void;
}

const PRESET_TAGS = [
    "Slow Morning",
    "Hot Action",
    "Skunked",
    "Limit Out",
    "Decoyed Well",
    "Called In",
    "Pass Shooting",
    "New Spot",
    "Dog Worked Great",
    "Foggy",
    "Bluebird Day",
];

export function QuickTags({ selected, onChange }: QuickTagsProps) {
    const toggle = (tag: string) => {
        if (selected.includes(tag)) {
            onChange(selected.filter(t => t !== tag));
        } else {
            onChange([...selected, tag]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map(tag => {
                const isActive = selected.includes(tag);
                return (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-secondary text-muted-foreground border border-border hover:border-primary/50'
                        }`}
                    >
                        {tag}
                    </button>
                );
            })}
        </div>
    );
}
