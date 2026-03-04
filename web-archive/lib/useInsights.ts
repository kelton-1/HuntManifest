"use client";

import { useMemo } from "react";
import { HuntLog } from "./types";
import { SPECIES_DATA } from "./species-data";

// ============================================
// TYPES
// ============================================

export type InsightsTier = 'none' | 'starter' | 'growing' | 'full';

export interface SeasonPulseData {
    totalHunts: number;
    totalHarvest: number;
    successRate: number; // 0-100
    uniqueLocations: number;
    uniqueSpecies: number;
    topSpecies: { name: string; count: number }[];
    favoriteLocation: string | null;
    avgRating: number | null;
    avgPartySize: number | null;
}

export interface WeatherBucket {
    label: string;
    hunts: number;
    totalHarvest: number;
    avgHarvest: number;
}

export interface WeatherPatternsData {
    temperatureBuckets: WeatherBucket[];
    windBuckets: WeatherBucket[];
    skyBuckets: WeatherBucket[];
    sweetSpot: { temp: string; wind: string; sky: string; avgHarvest: number } | null;
    moonPhaseBuckets: WeatherBucket[];
    pressureInsight: string | null;
}

export interface SpeciesStats {
    name: string;
    count: number;
    percentage: number;
    bestLocation: string | null;
    drakeCount: number;
    henCount: number;
    unknownCount: number;
    colorHex: string;
}

export interface SpeciesBreakdownData {
    species: SpeciesStats[];
    diversityCount: number;
    totalAvailableSpecies: number;
}

export interface LocationStats {
    name: string;
    visits: number;
    totalHarvest: number;
    avgHarvest: number;
    uniqueSpecies: number;
    topSpecies: string[];
    lastVisited: string;
}

export interface LocationIntelData {
    locations: LocationStats[];
}

export interface TimeAnalysisData {
    dayOfWeek: { day: string; hunts: number }[];
    avgDuration: number | null;
    peakStartHour: number | null;
    shootingEfficiency: number | null; // harvest per shot
    perHunterAvg: number | null;
}

export interface InsightsData {
    tier: InsightsTier;
    seasonPulse: SeasonPulseData;
    weatherPatterns: WeatherPatternsData;
    speciesBreakdown: SpeciesBreakdownData;
    locationIntel: LocationIntelData;
    timeAnalysis: TimeAnalysisData;
}

// ============================================
// COMPUTATION
// ============================================

function getTier(logCount: number): InsightsTier {
    if (logCount === 0) return 'none';
    if (logCount <= 2) return 'starter';
    if (logCount <= 4) return 'growing';
    return 'full';
}

function computeSeasonPulse(logs: HuntLog[]): SeasonPulseData {
    const totalHunts = logs.length;
    const totalHarvest = logs.reduce((sum, log) =>
        sum + log.harvests.reduce((s, h) => s + h.count, 0), 0);

    // Success rate: use result field if available, fall back to harvest count
    const successfulHunts = logs.filter(log => {
        if (log.result) return log.result === 'Successful' || log.result === 'Partial';
        return log.harvests.reduce((s, h) => s + h.count, 0) > 0;
    }).length;
    const successRate = totalHunts > 0 ? Math.round((successfulHunts / totalHunts) * 100) : 0;

    // Unique locations
    const locationNames = new Set(logs.map(l => l.location.name.toLowerCase().trim()));
    const uniqueLocations = locationNames.size;

    // Species aggregation
    const speciesCounts: Record<string, number> = {};
    logs.forEach(log => {
        log.harvests.forEach(h => {
            speciesCounts[h.species] = (speciesCounts[h.species] || 0) + h.count;
        });
    });
    const topSpecies = Object.entries(speciesCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    const uniqueSpecies = Object.keys(speciesCounts).length;

    // Favorite location by visit count
    const locationVisits: Record<string, number> = {};
    logs.forEach(log => {
        const key = log.location.name.trim();
        locationVisits[key] = (locationVisits[key] || 0) + 1;
    });
    const favoriteLocation = Object.entries(locationVisits)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Average rating
    const rated = logs.filter(l => l.rating && l.rating > 0);
    const avgRating = rated.length > 0
        ? Math.round((rated.reduce((s, l) => s + (l.rating || 0), 0) / rated.length) * 10) / 10
        : null;

    // Average party size
    const withParty = logs.filter(l => l.partySize && l.partySize > 0);
    const avgPartySize = withParty.length > 0
        ? Math.round((withParty.reduce((s, l) => s + (l.partySize || 1), 0) / withParty.length) * 10) / 10
        : null;

    return {
        totalHunts, totalHarvest, successRate, uniqueLocations,
        uniqueSpecies, topSpecies, favoriteLocation, avgRating, avgPartySize
    };
}

function bucketTemperature(temp: number): string {
    if (temp < 20) return "Below 20°F";
    if (temp < 35) return "20–35°F";
    if (temp < 50) return "35–50°F";
    return "Above 50°F";
}

function bucketWind(speed: number): string {
    if (speed < 5) return "Calm (0–5)";
    if (speed < 15) return "Light (5–15)";
    if (speed < 25) return "Moderate (15–25)";
    return "Strong (25+)";
}

function computeWeatherBuckets(
    logs: HuntLog[],
    bucketFn: (log: HuntLog) => string
): WeatherBucket[] {
    const groups: Record<string, { hunts: number; totalHarvest: number }> = {};

    logs.forEach(log => {
        const key = bucketFn(log);
        if (!groups[key]) groups[key] = { hunts: 0, totalHarvest: 0 };
        groups[key].hunts++;
        groups[key].totalHarvest += log.harvests.reduce((s, h) => s + h.count, 0);
    });

    return Object.entries(groups).map(([label, data]) => ({
        label,
        hunts: data.hunts,
        totalHarvest: data.totalHarvest,
        avgHarvest: Math.round((data.totalHarvest / data.hunts) * 10) / 10,
    }));
}

function computeWeatherPatterns(logs: HuntLog[]): WeatherPatternsData {
    const temperatureBuckets = computeWeatherBuckets(logs, log => bucketTemperature(log.weather.temperature));
    const windBuckets = computeWeatherBuckets(logs, log => bucketWind(log.weather.windSpeed));
    const skyBuckets = computeWeatherBuckets(logs, log => log.weather.skyCondition);

    // Moon phase buckets
    const moonPhaseBuckets = computeWeatherBuckets(logs,
        log => log.weather.moonPhase || 'Unknown'
    ).filter(b => b.label !== 'Unknown');

    // Sweet spot: best temp + wind + sky combo
    let sweetSpot: WeatherPatternsData['sweetSpot'] = null;
    if (logs.length >= 3) {
        const bestTemp = [...temperatureBuckets].sort((a, b) => b.avgHarvest - a.avgHarvest)[0];
        const bestWind = [...windBuckets].sort((a, b) => b.avgHarvest - a.avgHarvest)[0];
        const bestSky = [...skyBuckets].sort((a, b) => b.avgHarvest - a.avgHarvest)[0];
        if (bestTemp && bestWind && bestSky) {
            const matchingLogs = logs.filter(log =>
                bucketTemperature(log.weather.temperature) === bestTemp.label &&
                bucketWind(log.weather.windSpeed) === bestWind.label &&
                log.weather.skyCondition === bestSky.label
            );
            const avgH = matchingLogs.length > 0
                ? matchingLogs.reduce((s, l) => s + l.harvests.reduce((ss, h) => ss + h.count, 0), 0) / matchingLogs.length
                : (bestTemp.avgHarvest + bestWind.avgHarvest + bestSky.avgHarvest) / 3;
            sweetSpot = {
                temp: bestTemp.label,
                wind: bestWind.label,
                sky: bestSky.label,
                avgHarvest: Math.round(avgH * 10) / 10,
            };
        }
    }

    // Pressure insight
    let pressureInsight: string | null = null;
    const withPressure = logs.filter(l => l.weather.barometricPressure);
    if (withPressure.length >= 3) {
        const lowPressure = withPressure.filter(l => (l.weather.barometricPressure || 0) < 29.8);
        const highPressure = withPressure.filter(l => (l.weather.barometricPressure || 0) >= 29.8);
        const lowAvg = lowPressure.length > 0
            ? lowPressure.reduce((s, l) => s + l.harvests.reduce((ss, h) => ss + h.count, 0), 0) / lowPressure.length : 0;
        const highAvg = highPressure.length > 0
            ? highPressure.reduce((s, l) => s + l.harvests.reduce((ss, h) => ss + h.count, 0), 0) / highPressure.length : 0;
        if (lowAvg > highAvg && lowPressure.length >= 2) {
            pressureInsight = `Falling pressure (below 29.8" Hg) correlates with better harvests — ${lowAvg.toFixed(1)} avg vs ${highAvg.toFixed(1)} avg.`;
        } else if (highAvg > lowAvg && highPressure.length >= 2) {
            pressureInsight = `Higher pressure (above 29.8" Hg) correlates with better harvests — ${highAvg.toFixed(1)} avg vs ${lowAvg.toFixed(1)} avg.`;
        }
    }

    return { temperatureBuckets, windBuckets, skyBuckets, sweetSpot, moonPhaseBuckets, pressureInsight };
}

function computeSpeciesBreakdown(logs: HuntLog[]): SpeciesBreakdownData {
    const speciesMap: Record<string, {
        count: number;
        locations: Record<string, number>;
        drake: number; hen: number; unknown: number;
    }> = {};

    logs.forEach(log => {
        log.harvests.forEach(h => {
            if (!speciesMap[h.species]) {
                speciesMap[h.species] = { count: 0, locations: {}, drake: 0, hen: 0, unknown: 0 };
            }
            const entry = speciesMap[h.species];
            entry.count += h.count;
            const locKey = log.location.name.trim();
            entry.locations[locKey] = (entry.locations[locKey] || 0) + h.count;

            if (h.sexBreakdown) {
                entry.drake += h.sexBreakdown.drake;
                entry.hen += h.sexBreakdown.hen;
                entry.unknown += h.sexBreakdown.unknown;
            } else {
                entry.unknown += h.count;
            }
        });
    });

    const totalBag = Object.values(speciesMap).reduce((s, e) => s + e.count, 0);

    const species: SpeciesStats[] = Object.entries(speciesMap)
        .map(([name, data]) => {
            const bestLocation = Object.entries(data.locations)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
            const speciesData = SPECIES_DATA.find(s => s.name === name);
            const colorHex = speciesData?.colors[0] || '#0B3D2E';

            return {
                name,
                count: data.count,
                percentage: totalBag > 0 ? Math.round((data.count / totalBag) * 100) : 0,
                bestLocation,
                drakeCount: data.drake,
                henCount: data.hen,
                unknownCount: data.unknown,
                colorHex,
            };
        })
        .sort((a, b) => b.count - a.count);

    return {
        species,
        diversityCount: species.length,
        totalAvailableSpecies: SPECIES_DATA.length,
    };
}

function computeLocationIntel(logs: HuntLog[]): LocationIntelData {
    const locMap: Record<string, {
        visits: number;
        totalHarvest: number;
        species: Set<string>;
        lastDate: string;
    }> = {};

    logs.forEach(log => {
        const key = log.location.name.trim();
        if (!locMap[key]) {
            locMap[key] = { visits: 0, totalHarvest: 0, species: new Set(), lastDate: log.date };
        }
        const entry = locMap[key];
        entry.visits++;
        const harvest = log.harvests.reduce((s, h) => s + h.count, 0);
        entry.totalHarvest += harvest;
        log.harvests.forEach(h => entry.species.add(h.species));
        if (log.date > entry.lastDate) entry.lastDate = log.date;
    });

    const locations: LocationStats[] = Object.entries(locMap)
        .map(([name, data]) => ({
            name,
            visits: data.visits,
            totalHarvest: data.totalHarvest,
            avgHarvest: Math.round((data.totalHarvest / data.visits) * 10) / 10,
            uniqueSpecies: data.species.size,
            topSpecies: [...data.species].slice(0, 3),
            lastVisited: data.lastDate,
        }))
        .sort((a, b) => b.avgHarvest - a.avgHarvest);

    return { locations };
}

function computeTimeAnalysis(logs: HuntLog[]): TimeAnalysisData {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts: Record<string, number> = {};
    days.forEach(d => { dayCounts[d] = 0; });

    logs.forEach(log => {
        const dayIndex = new Date(log.date + 'T12:00:00').getDay();
        dayCounts[days[dayIndex]]++;
    });

    const dayOfWeek = days.map(day => ({ day, hunts: dayCounts[day] }));

    // Average duration
    const withDuration = logs.filter(l => l.duration && l.duration > 0);
    const avgDuration = withDuration.length > 0
        ? Math.round(withDuration.reduce((s, l) => s + (l.duration || 0), 0) / withDuration.length)
        : null;

    // Peak start hour
    const withStart = logs.filter(l => l.startTime);
    let peakStartHour: number | null = null;
    if (withStart.length > 0) {
        const hours = withStart.map(l => parseInt(l.startTime!.split(':')[0]));
        const hourCounts: Record<number, number> = {};
        hours.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
        peakStartHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]);
    }

    // Shooting efficiency
    const withShots = logs.filter(l => l.shotsFired && l.shotsFired > 0);
    let shootingEfficiency: number | null = null;
    if (withShots.length > 0) {
        const totalShots = withShots.reduce((s, l) => s + (l.shotsFired || 0), 0);
        const totalBirds = withShots.reduce((s, l) => s + l.harvests.reduce((ss, h) => ss + h.count, 0), 0);
        shootingEfficiency = totalShots > 0 ? Math.round((totalBirds / totalShots) * 100) / 100 : null;
    }

    // Per-hunter average
    const withParty = logs.filter(l => l.partySize && l.partySize > 0);
    let perHunterAvg: number | null = null;
    if (withParty.length > 0) {
        const totalBirds = withParty.reduce((s, l) => s + l.harvests.reduce((ss, h) => ss + h.count, 0), 0);
        const totalHunters = withParty.reduce((s, l) => s + (l.partySize || 1), 0);
        perHunterAvg = totalHunters > 0 ? Math.round((totalBirds / totalHunters) * 10) / 10 : null;
    }

    return { dayOfWeek, avgDuration, peakStartHour, shootingEfficiency, perHunterAvg };
}

// ============================================
// HOOK
// ============================================

export function useInsights(logs: HuntLog[]): InsightsData {
    return useMemo(() => {
        const tier = getTier(logs.length);
        const seasonPulse = computeSeasonPulse(logs);
        const weatherPatterns = computeWeatherPatterns(logs);
        const speciesBreakdown = computeSpeciesBreakdown(logs);
        const locationIntel = computeLocationIntel(logs);
        const timeAnalysis = computeTimeAnalysis(logs);

        return { tier, seasonPulse, weatherPatterns, speciesBreakdown, locationIntel, timeAnalysis };
    }, [logs]);
}
