"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Package, CloudSun, Wind, Thermometer, MapPin, Bird, Trophy, Loader2, Cloud } from "lucide-react";
import { useInventory, useHuntLogs } from "@/lib/storage";
import { GettingStartedChecklist } from "./components/GettingStartedChecklist";
import { fetchWeather } from "@/lib/weatherApi";
import { useGeolocation } from "@/lib/geolocation";
import { WeatherConditions } from "@/lib/types";

export default function Home() {
  const { inventory } = useInventory();
  const { logs } = useHuntLogs();

  // Weather state
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const { getCurrentPosition } = useGeolocation();

  // Fetch weather on mount
  useEffect(() => {
    const loadWeather = async () => {
      setWeatherLoading(true);
      const position = await getCurrentPosition();

      if (position) {
        const result = await fetchWeather(position.latitude, position.longitude);
        if (result.success) {
          setWeather(result.data);
        } else {
          setWeatherError(result.error);
        }
      } else {
        setWeatherError("Enable location for weather");
      }
      setWeatherLoading(false);
    };

    loadWeather();
  }, []);

  // Get recent logs (top 3)
  const recentLogs = logs.slice(0, 3);

  // Basic stats
  const gearCount = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const totalHarvest = logs.reduce((acc, log) => acc + log.harvests.reduce((hAcc, h) => hAcc + h.count, 0), 0);
  const totalHunts = logs.length;

  return (
    <div className="flex flex-col gap-5 pb-4 animate-fade-in">
      {/* Getting Started Checklist - shows after onboarding until dismissed */}
      <GettingStartedChecklist />

      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mallard-green via-mallard-green to-mallard-green-light rounded-2xl p-6 text-white shadow-lg">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id="feathers" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0C10 5.5 5.5 10 0 10C5.5 10 10 14.5 10 20C10 14.5 14.5 10 20 10C14.5 10 10 5.5 10 0Z" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#feathers)" />
          </svg>
        </div>

        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Welcome back, Hunter
          </h1>
          <p className="text-white/80 text-sm">
            {logs.length > 0
              ? `${totalHarvest} birds bagged across ${totalHunts} hunt${totalHunts !== 1 ? 's' : ''}`
              : "Ready to log your first success?"}
          </p>
        </div>

        {/* Quick Stats */}
        {totalHarvest > 0 && (
          <div className="relative flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalHarvest}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wide">Total Bag</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bird className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalHunts}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wide">Hunts</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Current Conditions */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-dawn via-sky-morning to-water-blue rounded-2xl p-5 text-white shadow-lg">
        {/* Stars/dots decoration for dawn sky effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-8 w-1 h-1 bg-white rounded-full animate-pulse-soft" />
          <div className="absolute top-6 right-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-mallard-yellow" />
              Local Conditions
            </h2>
            {weatherLoading && (
              <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading
              </span>
            )}
            {weather && !weatherLoading && (
              <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
                Live
              </span>
            )}
            {weatherError && !weatherLoading && (
              <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
                {weatherError}
              </span>
            )}
          </div>

          {weatherLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
          ) : weather ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Thermometer className="h-4 w-4 mx-auto mb-1 text-mallard-yellow" />
                <span className="text-xl font-bold block">{weather.temperature}°</span>
                <span className="text-[10px] text-white/70">Temp</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Wind className="h-4 w-4 mx-auto mb-1 text-white/80" />
                <span className="text-xl font-bold block">{weather.windSpeed}</span>
                <span className="text-[10px] text-white/70">{weather.windDirection} mph</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Cloud className="h-4 w-4 mx-auto mb-1 text-water-blue" />
                <span className="text-lg font-bold block">{weather.skyCondition === 'Partly Cloudy' ? 'P. Cloudy' : weather.skyCondition}</span>
                <span className="text-[10px] text-white/70">Sky</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Thermometer className="h-4 w-4 mx-auto mb-1 text-mallard-yellow" />
                <span className="text-xl font-bold block">--°</span>
                <span className="text-[10px] text-white/70">Temp</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Wind className="h-4 w-4 mx-auto mb-1 text-white/80" />
                <span className="text-xl font-bold block">--</span>
                <span className="text-[10px] text-white/70">-- mph</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Cloud className="h-4 w-4 mx-auto mb-1 text-water-blue" />
                <span className="text-lg font-bold block">--</span>
                <span className="text-[10px] text-white/70">Sky</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/log/new"
          className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-mallard-green to-mallard-green-light text-white shadow-lg overflow-hidden tap-highlight"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Plus className="h-6 w-6" />
          </div>
          <span className="relative font-bold text-sm">Log Hunt</span>
        </Link>

        <Link
          href="/inventory"
          className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-md overflow-hidden tap-highlight card-hover"
        >
          <div className="relative p-3 bg-mallard-yellow/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Package className="h-6 w-6 text-mallard-yellow" />
          </div>
          <div className="relative text-center">
            <span className="font-bold text-sm block">{gearCount} Items</span>
            <span className="text-[10px] text-muted-foreground">Gear Locker</span>
          </div>
        </Link>
      </section>

      {/* Recent Logs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Recent Hunts</h2>
          <Link
            href="/log"
            className="text-sm text-primary font-medium flex items-center gap-1 hover:underline group"
          >
            View All
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, index) => (
              <Link
                href="/log"
                key={log.id}
                className="block animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <p className="font-semibold text-sm">{log.location.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        <span className="mx-2">•</span>
                        {log.weather.temperature}°F, {log.weather.windDirection} {log.weather.windSpeed}mph
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-mallard-yellow">
                          {log.harvests.reduce((sum, h) => sum + h.count, 0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Birds</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-card/50 p-8 rounded-2xl border-2 border-dashed border-border text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-3">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              </div>
              <p className="font-medium text-foreground">No hunts logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">Get out there and bag some birds!</p>
              <Link
                href="/log/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Log Your First Hunt
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
