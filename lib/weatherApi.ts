import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherConditions } from "./types";

const WEATHER_CACHE_KEY = "timber_weather_cache";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface WeatherCache {
  data: WeatherConditions;
  timestamp: number;
  lat: number;
  lng: number;
}

async function getWeatherFromCache(lat: number, lng: number): Promise<WeatherConditions | null> {
  try {
    const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;
    const cache: WeatherCache = JSON.parse(cached);
    if (Date.now() - cache.timestamp > CACHE_TTL_MS) return null;
    if (Math.abs(cache.lat - lat) > 0.01 || Math.abs(cache.lng - lng) > 0.01) return null;
    return cache.data;
  } catch {
    return null;
  }
}

async function saveWeatherToCache(lat: number, lng: number, data: WeatherConditions): Promise<void> {
  try {
    const cache: WeatherCache = { data, timestamp: Date.now(), lat, lng };
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    relative_humidity_2m: number;
    surface_pressure: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

function weatherCodeToSkyCondition(code: number): WeatherConditions['skyCondition'] {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 99) return 'Rain';
  return 'Overcast';
}

function degreesToDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9 / 5) + 32);
}

function msToMph(ms: number): number {
  return Math.round(ms * 2.237);
}

function hpaToInHg(hpa: number): number {
  return Math.round(hpa * 0.02953 * 100) / 100;
}

function formatTime(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export type WeatherResult =
  | { success: true; data: WeatherConditions; fromCache?: boolean }
  | { success: false; error: string };

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherResult> {
  const cached = await getWeatherFromCache(latitude, longitude);
  if (cached) {
    return { success: true, data: cached, fromCache: true };
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&daily=sunrise,sunset&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `Weather API error: ${response.status}` };
    }
    const data: OpenMeteoResponse = await response.json();
    const weather: WeatherConditions = {
      temperature: celsiusToFahrenheit(data.current.temperature_2m),
      windSpeed: msToMph(data.current.wind_speed_10m),
      windDirection: degreesToDirection(data.current.wind_direction_10m),
      skyCondition: weatherCodeToSkyCondition(data.current.weather_code),
      humidity: data.current.relative_humidity_2m,
      barometricPressure: hpaToInHg(data.current.surface_pressure),
      sunrise: data.daily?.sunrise?.[0] ? formatTime(data.daily.sunrise[0]) : undefined,
      sunset: data.daily?.sunset?.[0] ? formatTime(data.daily.sunset[0]) : undefined,
    };
    await saveWeatherToCache(latitude, longitude, weather);
    return { success: true, data: weather };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { success: false, error: 'Failed to fetch weather data' };
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeather = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    const result = await fetchWeather(latitude, longitude);
    if (result.success) {
      setWeather(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result;
  };

  return { weather, loading, error, getWeather };
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  skyCondition: WeatherConditions['skyCondition'];
}

interface OpenMeteoHourlyResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}

export type HourlyForecastResult =
  | { success: true; data: HourlyForecast[] }
  | { success: false; error: string };

export async function fetchHourlyForecast(
  latitude: number,
  longitude: number,
  hours: number = 6
): Promise<HourlyForecastResult> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=ms&forecast_hours=${hours}`;
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `Weather API error: ${response.status}` };
    }
    const data: OpenMeteoHourlyResponse = await response.json();
    const hourlyData: HourlyForecast[] = data.hourly.time.slice(0, hours).map((time, index) => ({
      time: index === 0 ? "Now" : `${index}h`,
      temperature: celsiusToFahrenheit(data.hourly.temperature_2m[index]),
      windSpeed: msToMph(data.hourly.wind_speed_10m[index]),
      weatherCode: data.hourly.weather_code[index],
      skyCondition: weatherCodeToSkyCondition(data.hourly.weather_code[index]),
    }));
    return { success: true, data: hourlyData };
  } catch (error) {
    console.error('Hourly forecast fetch error:', error);
    return { success: false, error: 'Failed to fetch hourly forecast' };
  }
}
