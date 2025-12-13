"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Map,
  BookOpen,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { useInventory, useHuntLogs, useHuntPlans } from "@/lib/storage";
import { fetchWeather } from "@/lib/weatherApi";
import { useGeolocation } from "@/lib/geolocation";
import { WeatherConditions } from "@/lib/types";
import { useUserProfile } from "@/lib/useUserProfile";
import { formatTemperature, formatWindSpeed } from "@/lib/formatting";

// Premium Components
import { SeasonGoalsRing } from "./components/home/SeasonGoalsRing";
import { AtmosphericCard } from "./components/home/AtmosphericCard";
import { HuntMemoryCarousel } from "./components/home/HuntMemoryCarousel";
import { InventoryDashboard } from "./components/home/InventoryDashboard";

export default function Home() {
  const router = useRouter();
  const { inventory } = useInventory();
  const { logs } = useHuntLogs();
  const { plans } = useHuntPlans();
  const { profile } = useUserProfile();

  // Weather state
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const { getCurrentPosition } = useGeolocation();

  // Hunter name from unified profile
  const hunterName = profile.hunterName;

  // Fetch weather on mount
  useEffect(() => {
    const loadWeather = async () => {
      setWeatherLoading(true);
      const position = await getCurrentPosition();

      if (position) {
        const result = await fetchWeather(position.latitude, position.longitude);
        if (result.success) {
          setWeather(result.data);
        }
      }
      setWeatherLoading(false);
    };

    loadWeather();
  }, []);

  // Get active/upcoming plans
  const activePlans = plans.filter(p => !['COMPLETED', 'ARCHIVED'].includes(p.status));
  const nextPlan = activePlans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Basic stats
  const totalHarvest = logs.reduce((acc, log) => acc + log.harvests.reduce((hAcc, h) => hAcc + h.count, 0), 0);
  const totalHunts = logs.length;

  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in">

      {/* 1. Season Goals Radial Dashboard */}
      <SeasonGoalsRing
        totalHunts={totalHunts}
        totalHarvest={totalHarvest}
        hunterName={hunterName}
      />

      {/* Active Plan Card - Conditional */}
      {nextPlan && (
        <Link
          href={`/plan/${nextPlan.id}`}
          className="block group relative overflow-hidden bg-gradient-to-r from-mallard-yellow/10 to-mallard-yellow/5 border border-mallard-yellow/30 rounded-2xl p-4 shadow-sm card-hover"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-mallard-yellow" />
                <span className="text-xs font-bold uppercase tracking-wider text-mallard-yellow">Next Hunt</span>
              </div>
              <h3 className="font-bold text-base">{nextPlan.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(nextPlan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {nextPlan.location?.name && ` • ${nextPlan.location.name}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-mallard-green" />
                <span className="font-mono font-bold">
                  {nextPlan.gear.filter(i => i.checked).length}/{nextPlan.gear.length}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">packed</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mallard-green to-mallard-yellow rounded-full transition-all duration-500"
              style={{ width: `${nextPlan.gear.length > 0 ? (nextPlan.gear.filter(i => i.checked).length / nextPlan.gear.length) * 100 : 0}%` }}
            />
          </div>
        </Link>
      )}

      {/* 2. Atmospheric Weather Widget - Clickable */}
      <AtmosphericCard
        weather={weather}
        loading={weatherLoading}
        formatTemperature={formatTemperature}
        formatWindSpeed={formatWindSpeed}
        temperatureUnit={profile.temperatureUnit}
        windSpeedUnit={profile.windSpeedUnit}
        onClick={() => router.push('/conditions')}
      />

      {/* 3. Inventory Dashboard with Category Toggles */}
      <InventoryDashboard inventory={inventory} />

      {/* Plan & Log Row */}
      <section className="grid grid-cols-2 gap-3">
        {/* Plan a Hunt */}
        <Link
          href="/plan"
          className="group relative flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-mallard-green to-mallard-green-light text-white shadow-lg overflow-hidden tap-highlight"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Map className="h-5 w-5" />
            </div>
            {activePlans.length > 0 && (
              <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activePlans.length} active
              </span>
            )}
          </div>
          <div className="relative">
            <span className="font-bold text-sm block">Plan Hunt</span>
            <span className="text-[10px] text-white/70">Prep & location</span>
          </div>
        </Link>

        {/* Hunt Log */}
        <Link
          href="/log"
          className="group relative flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border shadow-md overflow-hidden tap-highlight card-hover"
        >
          <div className="relative flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            {totalHunts > 0 && (
              <span className="bg-secondary text-[10px] font-bold px-2 py-0.5 rounded-full text-muted-foreground">
                {totalHunts} logged
              </span>
            )}
          </div>
          <div className="relative">
            <span className="font-bold text-sm block">Hunt Log</span>
            <span className="text-[10px] text-muted-foreground">Record & review</span>
          </div>
        </Link>
      </section>

      {/* 3. Hunt Memory Carousel */}
      <HuntMemoryCarousel
        logs={logs}
        formatTemperature={formatTemperature}
        temperatureUnit={profile.temperatureUnit}
      />
    </div>
  );
}
