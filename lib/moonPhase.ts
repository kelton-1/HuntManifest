import { MoonPhase } from "./types";

// Known new moon: January 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();
const SYNODIC_PERIOD = 29.53058770576; // days

/**
 * Compute the moon phase for a given date using the synodic period method.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
    const diffMs = date.getTime() - KNOWN_NEW_MOON;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const phase = ((diffDays % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;

    if (phase < 1.85) return "New";
    if (phase < 7.38) return "Waxing Crescent";
    if (phase < 9.23) return "First Quarter";
    if (phase < 14.77) return "Waxing Gibbous";
    if (phase < 16.61) return "Full";
    if (phase < 22.15) return "Waning Gibbous";
    if (phase < 23.99) return "Last Quarter";
    if (phase < 27.68) return "Waning Crescent";
    return "New";
}
