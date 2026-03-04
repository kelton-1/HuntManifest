import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CloudSun, Zap, Moon } from 'lucide-react-native';
import { WeatherPatternsData, WeatherBucket } from '@/lib/useInsights';
import { InsightCard } from '@/components/InsightCard';
import { Colors } from '@/constants/Colors';

interface WeatherPatternsProps {
  data: WeatherPatternsData;
}

function MiniBarChart({ buckets, label }: { buckets: WeatherBucket[]; label: string }) {
  const maxAvg = Math.max(...buckets.map(b => b.avgHarvest), 0.1);

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chartRows}>
        {buckets.map(bucket => {
          const widthPercent = (bucket.avgHarvest / maxAvg) * 100;
          return (
            <View key={bucket.label} style={styles.chartRow}>
              <Text style={styles.bucketLabel} numberOfLines={1}>{bucket.label}</Text>
              <View style={styles.barOuter}>
                <View style={[styles.barInner, { width: `${widthPercent}%` }]} />
              </View>
              <Text style={styles.barValue}>{bucket.avgHarvest}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function WeatherPatterns({ data }: WeatherPatternsProps) {
  return (
    <InsightCard title="Weather Patterns" icon={CloudSun}>
      {data.sweetSpot && (
        <View style={styles.sweetSpot}>
          <View style={styles.sweetSpotHeader}>
            <Zap size={14} color={Colors.mallardGreen} />
            <Text style={styles.sweetSpotTitle}>SWEET SPOT</Text>
          </View>
          <Text style={styles.sweetSpotText}>
            {data.sweetSpot.temp}, {data.sweetSpot.wind} wind, {data.sweetSpot.sky}
          </Text>
          <Text style={styles.sweetSpotSub}>
            Avg {data.sweetSpot.avgHarvest} birds/hunt in these conditions
          </Text>
        </View>
      )}

      {data.temperatureBuckets.length > 0 && (
        <MiniBarChart buckets={data.temperatureBuckets} label="By Temperature" />
      )}

      {data.windBuckets.length > 0 && (
        <MiniBarChart buckets={data.windBuckets} label="By Wind Speed" />
      )}

      {data.skyBuckets.length > 0 && (
        <MiniBarChart buckets={data.skyBuckets} label="By Sky Condition" />
      )}

      {data.moonPhaseBuckets.length > 0 && (
        <View style={styles.moonSection}>
          <View style={styles.moonHeader}>
            <Moon size={12} color={Colors.darkTextMuted} />
            <Text style={styles.chartLabel}>Moon Phase</Text>
          </View>
          <View style={styles.moonPills}>
            {data.moonPhaseBuckets.map(bucket => (
              <View key={bucket.label} style={styles.moonPill}>
                <Text style={styles.moonPillLabel}>{bucket.label}</Text>
                <Text style={styles.moonPillValue}>{bucket.avgHarvest} avg</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.pressureInsight && (
        <View style={styles.pressureBox}>
          <Text style={styles.pressureText}>{data.pressureInsight}</Text>
        </View>
      )}
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  sweetSpot: {
    backgroundColor: `${Colors.mallardGreen}1A`,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  sweetSpotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sweetSpotTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mallardGreen,
    letterSpacing: 1,
  },
  sweetSpotText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkText,
  },
  sweetSpotSub: {
    fontSize: 12,
    color: Colors.darkTextMuted,
  },
  chartSection: {
    gap: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    fontWeight: '500',
  },
  chartRows: {
    gap: 6,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bucketLabel: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    width: 96,
  },
  barOuter: {
    flex: 1,
    height: 20,
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    backgroundColor: `${Colors.mallardGreen}B3`,
    borderRadius: 10,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.darkText,
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  moonSection: {
    gap: 8,
  },
  moonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moonPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: `${Colors.darkCardBorder}80`,
  },
  moonPillLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.darkText,
  },
  moonPillValue: {
    fontSize: 11,
    color: Colors.darkTextMuted,
  },
  pressureBox: {
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 12,
    padding: 12,
  },
  pressureText: {
    fontSize: 12,
    color: Colors.darkTextMuted,
    fontStyle: 'italic',
  },
});
