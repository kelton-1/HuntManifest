"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, CloudSun, Sun, Wind, Droplets, CalendarDays } from "lucide-react";
import { snappy } from "@/lib/motion";

type ForecastMode = 3 | 5 | 7;

interface DailyForecast {
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
    windSpeed: number;
    precipChance: number;
}

// Mock Data Generator
const generateForecast = (days: number): DailyForecast[] => {
    const today = new Date();
    return Array.from({ length: days }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i + 1);
        return {
            day: date.toLocaleDateString(undefined, { weekday: 'short' }),
            tempHigh: 45 + Math.floor(Math.random() * 15),
            tempLow: 30 + Math.floor(Math.random() * 10),
            condition: Math.random() > 0.6 ? 'Rain' : Math.random() > 0.3 ? 'Cloudy' : 'Clear',
            windSpeed: 5 + Math.floor(Math.random() * 15),
            precipChance: Math.floor(Math.random() * 60)
        };
    });
};

export function WeatherForecastWidget() {
    const [mode, setMode] = useState<ForecastMode>(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const forecast = useMemo(() => generateForecast(mode), [mode]);

    const cycleMode = () => {
        if (mode === 3) setMode(5);
        else if (mode === 5) setMode(7);
        else setMode(3);
    };

    const getIcon = (condition: string) => {
        switch (condition) {
            case 'Rain': return <CloudRain className="h-5 w-5 text-blue-400" />;
            case 'Cloudy': return <CloudSun className="h-5 w-5 text-gray-400" />;
            default: return <Sun className="h-5 w-5 text-amber-500" />;
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Forecast
                </h2>
                <button
                    onClick={cycleMode}
                    className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors tabular-nums"
                >
                    {mode}-Day View
                </button>
            </div>

            <motion.div
                layout
                onClick={cycleMode}
                className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm overflow-hidden cursor-pointer relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none" />

                <div className={`grid gap-2 ${mode === 3 ? 'grid-cols-1' : mode === 5 ? 'grid-cols-5' : 'grid-cols-7 overflow-x-auto pb-2'}`}>
                    {mode === 3 ? (
                        // Detailed 3-Day View
                        forecast.map((day, i) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 font-bold text-muted-foreground">{day.day}</div>
                                    <div className="flex flex-col items-center justify-center w-8">
                                        {getIcon(day.condition)}
                                    </div>
                                    <div>
                                        <div className="flex items-end gap-1">
                                            <span className="font-bold text-lg leading-none">{day.tempHigh}°</span>
                                            <span className="text-xs text-muted-foreground mb-0.5">/ {day.tempLow}°</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Wind className="h-3.5 w-3.5" />
                                        <span>{day.windSpeed} mph</span>
                                    </div>
                                    <div className="flex items-center gap-1 min-w-[3rem]">
                                        <Droplets className="h-3.5 w-3.5 text-blue-400" />
                                        <span>{day.precipChance}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        // Compact 5/7 Day View
                        forecast.map((day, i) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-secondary/20 border border-border/30 min-w-[3.5rem]"
                            >
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.day}</span>
                                {getIcon(day.condition)}
                                <div className="flex flex-col items-center mt-1">
                                    <span className="font-bold text-sm">{day.tempHigh}°</span>
                                    <span className="text-[10px] text-muted-foreground opacity-70">{day.tempLow}°</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="mt-3 text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to cycle view
                </div>
            </motion.div>
        </section>
    );
}
