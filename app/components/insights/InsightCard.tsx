"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, LucideIcon } from "lucide-react";
import { staggerChild } from "@/lib/motion";

interface InsightCardProps {
    title: string;
    icon: LucideIcon;
    locked?: boolean;
    lockMessage?: string;
    children: ReactNode;
}

export function InsightCard({ title, icon: Icon, locked, lockMessage, children }: InsightCardProps) {
    if (locked) {
        return (
            <motion.section variants={staggerChild} className="glass-card rounded-2xl p-5 opacity-50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-muted-foreground">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{lockMessage}</p>
            </motion.section>
        );
    }

    return (
        <motion.section variants={staggerChild} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            {children}
        </motion.section>
    );
}
