import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CloudRain, CloudSun, Sun, Wind, Droplets, CalendarDays } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type ForecastMode = 3 | 5 | 7;

interface DailyForecast {
  day: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  windSpeed: number;
  precipChance: number;
}

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
      precipChance: Math.floor(Math.random() * 60),
    };
  });
};

function getIcon(condition: string) {
  switch (condition) {
    case 'Rain':
      return <CloudRain size={20} color="#60A5FA" />;
    case 'Cloudy':
      return <CloudSun size={20} color="#9CA3AF" />;
    default:
      return <Sun size={20} color="#F59E0B" />;
  }
}

export function WeatherForecastWidget() {
  const [mode, setMode] = useState<ForecastMode>(3);
  const forecast = useMemo(() => generateForecast(mode), [mode]);

  const cycleMode = () => {
    if (mode === 3) setMode(5);
    else if (mode === 5) setMode(7);
    else setMode(3);
  };

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CalendarDays size={16} color={Colors.darkTextMuted} />
          <Text style={styles.sectionTitle}>Forecast</Text>
        </View>
        <Pressable onPress={cycleMode} style={styles.modeButton}>
          <Text style={styles.modeText}>{mode}-Day View</Text>
        </Pressable>
      </View>

      <Pressable onPress={cycleMode} style={styles.container}>
        {mode === 3 ? (
          forecast.map((day) => (
            <View key={day.day} style={styles.detailedRow}>
              <View style={styles.detailedLeft}>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <View style={styles.iconWrap}>{getIcon(day.condition)}</View>
                <View>
                  <View style={styles.tempRow}>
                    <Text style={styles.tempHigh}>{day.tempHigh}°</Text>
                    <Text style={styles.tempLow}>/ {day.tempLow}°</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailedRight}>
                <View style={styles.metaItem}>
                  <Wind size={14} color={Colors.darkTextMuted} />
                  <Text style={styles.metaText}>{day.windSpeed} mph</Text>
                </View>
                <View style={styles.metaItem}>
                  <Droplets size={14} color="#60A5FA" />
                  <Text style={styles.metaText}>{day.precipChance}%</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.compactGrid}>
            {forecast.map((day) => (
              <View key={day.day} style={styles.compactItem}>
                <Text style={styles.compactDay}>{day.day}</Text>
                {getIcon(day.condition)}
                <Text style={styles.compactHigh}>{day.tempHigh}°</Text>
                <Text style={styles.compactLow}>{day.tempLow}°</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.tapHint}>Tap to cycle view</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.darkTextMuted,
  },
  modeButton: {
    backgroundColor: 'rgba(245, 184, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mallardYellow,
  },
  container: {
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    borderRadius: 16,
    padding: 16,
  },
  detailedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(30, 38, 51, 0.3)',
    marginBottom: 8,
  },
  detailedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayLabel: {
    width: 32,
    fontWeight: '700',
    color: Colors.darkTextMuted,
    fontSize: 13,
  },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  tempHigh: {
    fontWeight: '700',
    fontSize: 18,
    color: Colors.darkText,
  },
  tempLow: {
    fontSize: 12,
    color: Colors.darkTextMuted,
    marginBottom: 2,
  },
  detailedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.darkTextMuted,
  },
  compactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactItem: {
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(30, 38, 51, 0.3)',
    flex: 1,
    marginHorizontal: 2,
  },
  compactDay: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.darkTextMuted,
    textTransform: 'uppercase',
  },
  compactHigh: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.darkText,
  },
  compactLow: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
  tapHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.darkTextSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
