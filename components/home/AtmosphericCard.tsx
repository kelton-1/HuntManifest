import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Thermometer, Droplets, CloudSun } from 'lucide-react-native';
import { WindRose } from './WindRose';
import { WeatherConditions } from '@/lib/types';
import { getHuntingSuitability } from '@/lib/huntingSuitability';
import { Colors } from '@/constants/Colors';

interface AtmosphericCardProps {
  weather: WeatherConditions | null;
  loading: boolean;
  formatTemperature?: (temp: number, unit: 'F' | 'C') => string;
  formatWindSpeed?: (speed: number, unit: 'mph' | 'kph') => string;
  temperatureUnit?: 'F' | 'C';
  windSpeedUnit?: 'mph' | 'kph';
}

const defaultFormatTemp = (temp: number, unit: 'F' | 'C') => `${Math.round(temp)}°${unit}`;
const defaultFormatWind = (speed: number, unit: 'mph' | 'kph') => `${Math.round(speed)} ${unit}`;

export function AtmosphericCard({
  weather,
  loading,
  formatTemperature = defaultFormatTemp,
  formatWindSpeed = defaultFormatWind,
  temperatureUnit = 'F',
  windSpeedUnit = 'mph',
}: AtmosphericCardProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.mallardGreenLight} />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyIcon}>
          <CloudSun size={24} color={Colors.darkTextMuted} />
        </View>
        <Text style={styles.emptyTitle}>Weather Unavailable</Text>
        <Text style={styles.emptySubtitle}>
          Enable location access to compare conditions with your past hunts.
        </Text>
      </View>
    );
  }

  const suit = getHuntingSuitability(weather);
  const suitBadgeColor =
    suit.level === 'GOOD'
      ? { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' }
      : suit.level === 'FAIR'
        ? { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' }
        : { bg: 'rgba(239,68,68,0.15)', text: '#f87171' };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.suitBadge, { backgroundColor: suitBadgeColor.bg }]}>
        <Text style={[styles.suitText, { color: suitBadgeColor.text }]}>{suit.level}</Text>
      </View>

      <View style={styles.windCard}>
        <View style={styles.windInfo}>
          <Text style={styles.microLabel}>WIND DIRECTION</Text>
          <View style={styles.windValues}>
            <Text style={styles.windDir}>{weather.windDirection}</Text>
            <Text style={styles.windSpeed}>
              {formatWindSpeed(weather.windSpeed, windSpeedUnit)}
            </Text>
          </View>
        </View>
        <WindRose direction={weather.windDirection} speed={weather.windSpeed} size={80} />
      </View>

      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <View style={styles.tileIconWrap}>
            <Thermometer size={20} color={Colors.mallardYellow} />
          </View>
          <Text style={styles.microLabel}>TEMP</Text>
          <Text style={styles.tileValue}>
            {formatTemperature(weather.temperature, temperatureUnit)}
          </Text>
        </View>

        <View style={styles.tile}>
          <View style={styles.tileIconWrap}>
            <CloudSun size={20} color={Colors.waterBlue} />
          </View>
          <Text style={styles.microLabel}>SKY</Text>
          <Text style={styles.tileLabelValue} numberOfLines={2}>
            {weather.skyCondition}
          </Text>
        </View>
      </View>

      {weather.humidity != null && (
        <View style={styles.humidityRow}>
          <View style={styles.humidityLeft}>
            <Droplets size={18} color="#60a5fa" />
            <Text style={styles.humidityLabel}>Humidity</Text>
          </View>
          <Text style={styles.humidityValue}>{weather.humidity}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Colors.darkTextMuted,
    fontSize: 13,
    marginTop: 8,
  },
  emptyIcon: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.darkText,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.darkTextMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  outerContainer: {
    gap: 10,
  },
  suitBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  suitText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  windCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  windInfo: {
    flex: 1,
  },
  microLabel: {
    fontSize: 10,
    color: Colors.darkTextMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  windValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  windDir: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  windSpeed: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkTextMuted,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 12,
  },
  tileIconWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.5,
  },
  tileValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  tileLabelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkText,
    marginTop: 8,
  },
  humidityRow: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  humidityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  humidityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkText,
  },
  humidityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
});
