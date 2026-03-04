import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TrendingUp, MapPin } from 'lucide-react-native';
import { useCountUp } from '@/lib/useCountUp';
import { SeasonPulseData } from '@/lib/useInsights';
import { SPECIES_DATA } from '@/lib/species-data';
import { InsightCard } from '@/components/InsightCard';
import { Colors } from '@/constants/Colors';

interface SeasonPulseProps {
  data: SeasonPulseData;
}

function StatTile({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>
        {animated}{suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SeasonPulse({ data }: SeasonPulseProps) {
  return (
    <InsightCard title="Season Pulse" icon={TrendingUp}>
      <View style={styles.statGrid}>
        <StatTile label="Total Hunts" value={data.totalHunts} />
        <StatTile label="Total Harvest" value={data.totalHarvest} />
        <StatTile label="Success Rate" value={data.successRate} suffix="%" />
        <StatTile label="Locations" value={data.uniqueLocations} />
      </View>

      {data.topSpecies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Top Species</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.speciesRow}>
              {data.topSpecies.map(sp => {
                const speciesInfo = SPECIES_DATA.find(s => s.name === sp.name);
                const color = speciesInfo?.colors[0] || Colors.mallardGreen;
                return (
                  <View key={sp.name} style={styles.speciesPill}>
                    <View style={[styles.speciesDot, { backgroundColor: color }]} />
                    <Text style={styles.speciesName}>{sp.name}</Text>
                    <Text style={styles.speciesCount}>{sp.count}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {data.favoriteLocation && (
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.mallardGreen} />
          <Text style={styles.locationLabel}>Favorite:</Text>
          <Text style={styles.locationName} numberOfLines={1}>{data.favoriteLocation}</Text>
        </View>
      )}
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    fontWeight: '500',
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speciesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: `${Colors.darkCardBorder}80`,
  },
  speciesDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  speciesName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.darkText,
  },
  speciesCount: {
    fontSize: 10,
    color: Colors.darkTextMuted,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: Colors.darkTextMuted,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkText,
    flex: 1,
  },
});
