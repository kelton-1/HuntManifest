import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Harvest } from '@/lib/types';
import { SPECIES_DATA } from '@/lib/species-data';
import { hapticLight } from '@/lib/haptics';

interface HarvestEntryProps {
  species: string;
  count: number;
  sexBreakdown?: { drake: number; hen: number; unknown: number };
  onChange: (harvest: Partial<Harvest>) => void;
}

export function HarvestEntry({ species, count, sexBreakdown, onChange }: HarvestEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const speciesData = SPECIES_DATA.find(s => s.name === species);
  const color = speciesData?.colors[0] ?? Colors.mallardGreen;

  const handleIncrement = () => {
    hapticLight();
    const newCount = count + 1;
    const newBreakdown = sexBreakdown
      ? { ...sexBreakdown, unknown: sexBreakdown.unknown + 1 }
      : undefined;
    onChange({ count: newCount, sexBreakdown: newBreakdown });
  };

  const handleDecrement = () => {
    hapticLight();
    if (count <= 0) return;
    const newCount = count - 1;
    const newBreakdown = sexBreakdown
      ? { ...sexBreakdown, unknown: Math.max(0, sexBreakdown.unknown - 1) }
      : undefined;
    onChange({ count: newCount, sexBreakdown: newBreakdown });
  };

  const adjustSex = (field: 'drake' | 'hen' | 'unknown', delta: number) => {
    hapticLight();
    const bd = sexBreakdown || { drake: 0, hen: 0, unknown: count };
    const newBd = { ...bd, [field]: Math.max(0, bd[field] + delta) };
    if (delta > 0 && field !== 'unknown') {
      newBd.unknown = Math.max(0, newBd.unknown - delta);
    }
    if (delta < 0 && field !== 'unknown') {
      newBd.unknown = Math.min(count, newBd.unknown - delta);
    }
    const newTotal = newBd.drake + newBd.hen + newBd.unknown;
    if (newTotal !== count) return;
    onChange({ sexBreakdown: newBd });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Pressable
          style={styles.speciesInfo}
          onPress={() => {
            hapticLight();
            setExpanded(!expanded);
          }}
        >
          <Text style={styles.speciesName}>{species}</Text>
          {sexBreakdown && (
            <Text style={styles.breakdownHint}>
              {sexBreakdown.drake}D {sexBreakdown.hen}H
            </Text>
          )}
          <ChevronDown
            size={14}
            color={Colors.darkTextMuted}
            style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </Pressable>

        <View style={styles.counterRow}>
          <Pressable onPress={handleDecrement} style={styles.counterBtn}>
            <Minus size={16} color={Colors.darkTextMuted} />
          </Pressable>
          <Text style={styles.countText}>{count}</Text>
          <Pressable onPress={handleIncrement} style={styles.counterBtn}>
            <Plus size={16} color={Colors.darkTextMuted} />
          </Pressable>
        </View>
      </View>

      {expanded && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownLabel}>Drake / Hen Breakdown</Text>
          {(['drake', 'hen', 'unknown'] as const).map(sex => {
            const bd = sexBreakdown || { drake: 0, hen: 0, unknown: count };
            return (
              <View key={sex} style={styles.breakdownRow}>
                <Text style={styles.sexLabel}>
                  {sex === 'drake' ? 'Drake' : sex === 'hen' ? 'Hen' : 'Unknown'}
                </Text>
                <View style={styles.breakdownControls}>
                  <Pressable
                    onPress={() => adjustSex(sex, -1)}
                    style={[styles.smallBtn, bd[sex] <= 0 && styles.smallBtnDisabled]}
                    disabled={bd[sex] <= 0}
                  >
                    <Text style={styles.smallBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.sexCount}>{bd[sex]}</Text>
                  <Pressable
                    onPress={() => adjustSex(sex, 1)}
                    style={styles.smallBtn}
                  >
                    <Text style={styles.smallBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  speciesInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speciesName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
  },
  breakdownHint: {
    fontSize: 10,
    color: Colors.mallardGreenLight,
    marginLeft: 'auto',
    marginRight: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.darkCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.mallardYellow,
    minWidth: 24,
    textAlign: 'center',
  },
  breakdownContainer: {
    marginTop: 10,
    marginLeft: 22,
    padding: 12,
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 10,
    color: Colors.darkTextMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sexLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.darkText,
    width: 60,
    textTransform: 'capitalize',
  },
  breakdownControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnDisabled: {
    opacity: 0.3,
  },
  smallBtnText: {
    fontSize: 14,
    color: Colors.darkText,
  },
  sexCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkText,
    minWidth: 16,
    textAlign: 'center',
  },
});
