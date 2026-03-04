import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { SPECIES_DATA } from '@/lib/species-data';
import { LocationIntelData } from '@/lib/useInsights';
import { InsightCard } from '@/components/InsightCard';
import { Colors } from '@/constants/Colors';

interface LocationIntelProps {
  data: LocationIntelData;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LocationIntel({ data }: LocationIntelProps) {
  return (
    <InsightCard title="Location Intel" icon={MapPin}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          {data.locations.map((loc, idx) => (
            <View key={loc.name} style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.locationName} numberOfLines={2}>{loc.name}</Text>
                {idx === 0 && data.locations.length > 1 && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#1</Text>
                  </View>
                )}
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Visits</Text>
                  <Text style={styles.statValue}>{loc.visits}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Avg Bag</Text>
                  <Text style={styles.statValue}>{loc.avgHarvest}</Text>
                </View>
              </View>
              {loc.topSpecies.length > 0 && (
                <View style={styles.speciesDots}>
                  {loc.topSpecies.map(sp => {
                    const info = SPECIES_DATA.find(s => s.name === sp);
                    return (
                      <View
                        key={sp}
                        style={[styles.speciesDot, { backgroundColor: info?.colors[0] || Colors.mallardGreen }]}
                      />
                    );
                  })}
                </View>
              )}
              <Text style={styles.lastVisited}>Last: {formatDate(loc.lastVisited)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {data.locations.length > 1 && (
        <View style={styles.rankedSection}>
          <Text style={styles.rankedTitle}>Ranked by Avg Harvest</Text>
          {data.locations.map((loc, idx) => (
            <View key={loc.name} style={styles.rankedRow}>
              <Text style={styles.rankedIndex}>{idx + 1}.</Text>
              <Text style={styles.rankedName} numberOfLines={1}>{loc.name}</Text>
              <Text style={styles.rankedValue}>{loc.avgHarvest}</Text>
              <Text style={styles.rankedUnit}>avg</Text>
            </View>
          ))}
        </View>
      )}
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  locationCard: {
    width: 176,
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkText,
    flex: 1,
    lineHeight: 18,
  },
  rankBadge: {
    backgroundColor: `${Colors.mallardGreen}1A`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.mallardGreen,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.darkTextMuted,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkText,
  },
  speciesDots: {
    flexDirection: 'row',
    gap: 4,
  },
  speciesDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  lastVisited: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
  rankedSection: {
    gap: 6,
    paddingTop: 8,
  },
  rankedTitle: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    fontWeight: '500',
  },
  rankedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankedIndex: {
    fontSize: 11,
    color: Colors.darkTextMuted,
    width: 20,
    textAlign: 'right',
    fontWeight: '700',
  },
  rankedName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkText,
    flex: 1,
  },
  rankedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  rankedUnit: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
});
