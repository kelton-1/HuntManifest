"use client";

import { useEffect, useState } from "react";
import { useHuntLogs } from "@/lib/storage";
import { fetchWeather } from "@/lib/weatherApi";
import { useGeolocation } from "@/lib/geolocation";
import { WeatherConditions } from "@/lib/types";
import { useUserProfile } from "@/lib/useUserProfile";
import { formatTemperature, formatWindSpeed } from "@/lib/formatting";

// Premium Components
import { SeasonGoalsRing } from "./components/home/SeasonGoalsRing";
import { AtmosphericCard } from "./components/home/AtmosphericCard";
import { HuntMemoryCarousel } from "./components/home/HuntMemoryCarousel";
import { CommandCenterHero } from "./components/home/CommandCenterHero";
import { WeatherForecastWidget } from "./components/home/WeatherForecastWidget";
import { QuickActions } from "./components/home/QuickActions";

export default function Home() {
  const { logs } = useHuntLogs();
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

  // Basic stats
  const totalHarvest = logs.reduce((acc, log) => acc + log.harvests.reduce((hAcc, h) => hAcc + h.count, 0), 0);
  const totalHunts = logs.length;

  return (
    <div className="flex flex-col gap-4 pb-4 animate-fade-in">

      {/* 1. Command Center Hero (Replaces SeasonGoalsRing) */}
      <CommandCenterHero weather={weather} />

      {/* 2. Atmospheric Weather Widget */}
      <AtmosphericCard
        weather={weather}
        loading={weatherLoading}
        formatTemperature={formatTemperature}
        formatWindSpeed={formatWindSpeed}
        temperatureUnit={profile.temperatureUnit}
        windSpeedUnit={profile.windSpeedUnit}
      />

      {/* 3. Weather Forecast */}
      <WeatherForecastWidget />

      {/* 4. Quick Actions Grid */}
      <QuickActions weather={weather} />

      {/* 5. Hunt Memory Carousel */}
      <HuntMemoryCarousel
        logs={logs}
        formatTemperature={formatTemperature}
        temperatureUnit={profile.temperatureUnit}
      />
    </div>
  );
}
