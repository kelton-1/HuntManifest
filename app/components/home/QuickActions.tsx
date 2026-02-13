"use client";

import Link from "next/link";
import { Calendar, NotebookPen, Package, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { hapticLight } from "@/lib/haptics";
import { staggerContainer, staggerChild } from "@/lib/motion";
import { useInventory, useHuntPlans } from "@/lib/storage";
import { WeatherConditions } from "@/lib/types";
import { getHuntingSuitability } from "@/lib/huntingSuitability";

interface QuickActionsProps {
    weather: WeatherConditions | null;
}

export function QuickActions({ weather }: QuickActionsProps) {
    const { inventory } = useInventory();
    const { plans } = useHuntPlans();

    const suitability = weather ? getHuntingSuitability(weather) : null;
    const hasActivePlan = plans.some((p) => p.status === "ACTIVE");

    const planSublabel = suitability?.level === "GOOD"
        ? "Conditions look good"
        : hasActivePlan
            ? "Continue planning"
            : "Set up your next hunt";

    const actions = [
        { icon: Calendar, label: "Plan Hunt", sublabel: planSublabel, href: "/plan/new", primary: true },
        { icon: NotebookPen, label: "Log Hunt", sublabel: "Record your day", href: "/log/new", primary: false },
        { icon: Package, label: "Inventory", sublabel: `${inventory.length} items`, href: "/inventory", primary: false },
        { icon: BarChart3, label: "Insights", sublabel: "Season trends", href: "/insights", primary: false },
    ];

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
        >
            {actions.map((action) => (
                <motion.div key={action.href} variants={staggerChild}>
                    <Link
                        href={action.href}
                        onClick={() => hapticLight()}
                        className="glass-card rounded-xl p-4 flex flex-col items-center gap-1 tap-highlight block"
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                action.primary ? "bg-primary/10" : "bg-muted"
                            }`}
                        >
                            <action.icon
                                className={`h-5 w-5 ${
                                    action.primary ? "text-primary" : "text-foreground"
                                }`}
                            />
                        </div>
                        <span
                            className={`text-sm font-semibold ${
                                action.primary ? "text-primary" : "text-foreground"
                            }`}
                        >
                            {action.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {action.sublabel}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
