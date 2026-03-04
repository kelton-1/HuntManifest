import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bird } from 'lucide-react-native';
import { SpeciesBreakdownData } from '@/lib/useInsights';
import { InsightCard } from '@/components/InsightCard';
import { Colors } from '@/constants/Colors';

interface SpeciesBreakdownProps {
  data: SpeciesBreakdownData;
}

export function SpeciesBreakdown({ data }: SpeciesBreakdownProps) {
  return (
    <InsightCard title="Species Breakdown" icon={Bird}>
      <View style={styles.speciesList}>
        {data.species.map(sp => (
          <View key={sp.name} style={styles.speciesItem}>
            <View style={styles.speciesHeader}>
              <View style={[styles.colorDot, { backgroundColor: sp.colorHex }]} />
              <Text style={styles.speciesName}>{sp.name}</Text>
              <Text style={styles.speciesCount}>{sp.count}</Text>
              <Text style={styles.speciesPercentage}>{sp.percentage}%</Text>
            </View>

            <View style={styles.barContainer}>
              <View
                style={[styles.bar, { width: `${sp.percentage}%`, backgroundColor: sp.colorHex }]}
              />
            </View>

            <View style={styles.detailsRow}>
              {sp.bestLocation && (
                <Text style={styles.detailText}>Best: {sp.bestLocation}</Text>
              )}
              {(sp.drakeCount > 0 || sp.henCount > 0) && (
                <Text style={styles.detailTextBold}>
                  {sp.drakeCount}D / {sp.henCount}H
                  {sp.unknownCount > 0 && ` / ${sp.unknownCount}?`}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.diversityContainer}>
        <Text style={styles.diversityText}>
          <Text style={styles.diversityCount}>{data.diversityCount}</Text>
          {' '}of {data.totalAvailableSpecies} species harvested
        </Text>
      </View>
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  speciesList: {
    gap: 10,
  },
  speciesItem: {
    gap: 6,
  },
  speciesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  speciesName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
    flex: 1,
  },
  speciesCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  speciesPercentage: {
    fontSize: 10,
    color: Colors.darkTextMuted,
    width: 32,
    textAlign: 'right',
  },
  barContainer: {
    height: 8,
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 20,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 20,
  },
  detailText: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
  detailTextBold: {
    fontSize: 10,
    color: Colors.darkTextMuted,
    fontWeight: '500',
  },
  diversityContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${Colors.darkCardBorder}80`,
    alignItems: 'center',
  },
  diversityText: {
    fontSize: 12,
    color: Colors.darkTextMuted,
  },
  diversityCount: {
    fontWeight: '700',
    color: Colors.darkText,
  },
});
