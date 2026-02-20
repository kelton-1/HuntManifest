"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Bird, ChevronRight, Plus, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { HuntLog } from "@/lib/types";
import { hapticLight } from "@/lib/haptics";

interface HuntMemoryCarouselProps {
    logs: HuntLog[];
    formatTemperature: (temp: number, unit: "F" | "C") => string;
    temperatureUnit: "F" | "C";
}

function getCardGradient(harvestCount: number, index: number): string {
    const gradients = [
        "from-mallard-green/90 to-mallard-green-light/80",
        "from-sky-dawn/90 to-water-blue/80",
        "from-mallard-green-light/90 to-water-blue/80",
        "from-mallard-yellow/70 to-mallard-green/90",
    ];

    if (harvestCount >= 5) return "from-mallard-yellow/80 to-mallard-green/90";
    return gradients[index % gradients.length];
}

const SWIPE_THRESHOLD = 60;

export function HuntMemoryCarousel({ logs, formatTemperature, temperatureUnit }: HuntMemoryCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const displayLogs = logs.slice(0, 6);

    const paginate = useCallback((newDirection: number) => {
        hapticLight();
        setDirection(newDirection);
        setCurrentIndex((prev) => {
            const next = prev + newDirection;
            if (next < 0) return displayLogs.length - 1;
            if (next >= displayLogs.length) return 0;
            return next;
        });
    }, [displayLogs.length]);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -SWIPE_THRESHOLD) {
            paginate(1);
        } else if (info.offset.x > SWIPE_THRESHOLD) {
            paginate(-1);
        }
    }, [paginate]);

    if (logs.length === 0) {
        return (
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hunt Memories</h2>
                </div>
                <div className="bg-card/50 p-6 rounded-2xl border-2 border-dashed border-border text-center">
                    <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    </div>
                    <p className="font-medium text-sm text-foreground">No hunt memories yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tap + to record your first hunt</p>
                </div>
            </section>
        );
    }

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 280 : -280,
            opacity: 0,
            scale: 0.9,
            rotateY: dir > 0 ? 15 : -15,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: { type: "spring" as const, stiffness: 300, damping: 28 },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -280 : 280,
            opacity: 0,
            scale: 0.9,
            rotateY: dir > 0 ? -15 : 15,
            transition: { type: "spring" as const, stiffness: 300, damping: 28 },
        }),
    };

    const log = displayLogs[currentIndex];
    const harvestCount = log.harvests.reduce((sum, h) => sum + h.count, 0);

    return (
        <section>
            <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hunt Memories</h2>
                <Link
                    href="/log"
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                    View All
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Card Stack */}
            <div className="relative" style={{ perspective: "1200px" }}>
                {/* Background cards (depth stack) */}
                {displayLogs.length > 2 && (
                    <div className="absolute inset-0 mx-6 mt-3 rounded-2xl glass-card opacity-20 scale-[0.92]" />
                )}
                {displayLogs.length > 1 && (
                    <div className="absolute inset-0 mx-3 mt-1.5 rounded-2xl glass-card opacity-40 scale-[0.96]" />
                )}

                {/* Active card */}
                <div className="relative h-44 overflow-hidden rounded-2xl">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.15}
                            onDragEnd={handleDragEnd}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        >
                            <Link href={`/log/detail?id=${log.id}`} className="block h-full" draggable={false}>
                                <div
                                    className={`relative h-full rounded-2xl overflow-hidden glass-card shadow-lg bg-gradient-to-br ${getCardGradient(harvestCount, currentIndex)}`}
                                >
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 card-gradient-overlay opacity-60" />

                                    {/* Pattern */}
                                    <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <pattern id={`pattern-${log.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                                <circle cx="15" cy="15" r="1" fill="white" />
                                            </pattern>
                                            <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${log.id})`} />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {/* Top: Date & Temp */}
                                        <div className="p-4 flex justify-between items-start">
                                            <div className="text-xs font-bold text-white/90 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                                {new Date(log.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs font-medium text-white/90 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                                {formatTemperature(log.weather.temperature, temperatureUnit)}
                                            </div>
                                        </div>

                                        {/* Bottom: Glass HUD Bar */}
                                        <div className="glass-subtle backdrop-blur-md p-4 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <MapPin className="h-4 w-4 text-white/90 flex-shrink-0" />
                                                <span className="text-sm font-bold text-white truncate drop-shadow-sm">
                                                    {log.location.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 flex-shrink-0">
                                                <Bird className="h-3.5 w-3.5 text-mallard-yellow" />
                                                <span className="text-sm font-bold text-white tabular-nums">{harvestCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                {displayLogs.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                            onClick={() => paginate(-1)}
                            className="p-2 rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
                            aria-label="Previous hunt"
                        >
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-1.5">
                            {displayLogs.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        hapticLight();
                                        setDirection(i > currentIndex ? 1 : -1);
                                        setCurrentIndex(i);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        i === currentIndex
                                            ? "w-6 bg-primary"
                                            : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                    }`}
                                    aria-label={`Go to hunt ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(1)}
                            className="p-2 rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
                            aria-label="Next hunt"
                        >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
