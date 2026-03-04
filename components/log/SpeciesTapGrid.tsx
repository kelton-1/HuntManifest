import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { WATERFOWL_SPECIES, Harvest } from '@/lib/types';
import { hapticLight, hapticMedium } from '@/lib/haptics';

interface SpeciesTapGridProps {
  harvests: Harvest[];
  onTap: (species: string) => void;
  onUpdate?: (harvests: Harvest[]) => void;
}

const SPECIES_EMOJI: Record<string, string> = {
  'Mallard': '🦆',
  'Wood Duck': '🪶',
  'Teal (Green-winged)': '🟢',
  'Teal (Blue-winged)': '🔵',
  'Pintail': '📌',
  'Wigeon': '🍃',
  'Gadwall': '🪿',
  'Canvasback': '🔴',
  'Redhead': '🟤',
  'Ring-necked Duck': '⚫',
  'Scaup': '🌊',
  'Canada Goose': '🇨🇦',
  'Snow Goose': '⬜',
  'Specklebelly (White-fronted)': '🟠',
  'Other': '🐦',
};

export function SpeciesTapGrid({ harvests, onTap, onUpdate }: SpeciesTapGridProps) {
  const getCount = (species: string) => {
    const h = harvests.find(h => h.species === species);
    return h?.count ?? 0;
  };

  const handleTap = (species: string) => {
    hapticMedium();
    onTap(species);
  };

  const handleIncrement = (species: string) => {
    if (!onUpdate) return;
    hapticLight();
    onUpdate(harvests.map(h =>
      h.species === species ? { ...h, count: h.count + 1 } : h
    ));
  };

  const handleDecrement = (species: string) => {
    if (!onUpdate) return;
    hapticLight();
    const current = getCount(species);
    if (current <= 1) {
      onUpdate(harvests.filter(h => h.species !== species));
    } else {
      onUpdate(harvests.map(h =>
        h.species === species ? { ...h, count: h.count - 1 } : h
      ));
    }
  };

  const handleRemove = (species: string) => {
    if (!onUpdate) return;
    hapticLight();
    onUpdate(harvests.filter(h => h.species !== species));
  };

  return (
    <View style={styles.grid}>
      {WATERFOWL_SPECIES.map(species => {
        const count = getCount(species);
        const isSelected = count > 0;

        return (
          <Pressable
            key={species}
            onPress={() => handleTap(species)}
            style={[styles.cell, isSelected && styles.cellSelected]}
          >
            {isSelected && <View style={styles.selectedBorder} />}

            {isSelected && onUpdate && (
              <Pressable onPress={() => handleRemove(species)} style={styles.removeButton}>
                <X size={10} color={Colors.error} />
              </Pressable>
            )}

            <Text style={styles.emoji}>{SPECIES_EMOJI[species] || '🐦'}</Text>

            <Text style={[styles.speciesName, isSelected && styles.speciesNameSelected]} numberOfLines={2}>
              {species}
            </Text>

            {isSelected && (
              <View style={styles.countControls}>
                {onUpdate && (
                  <Pressable onPress={() => handleDecrement(species)} style={styles.counterBtn}>
                    <Minus size={14} color={Colors.darkTextMuted} />
                  </Pressable>
                )}

                <Text style={styles.countText}>{count}</Text>

                {onUpdate && (
                  <Pressable onPress={() => handleIncrement(species)} style={styles.counterBtn}>
                    <Plus size={14} color={Colors.darkTextMuted} />
                  </Pressable>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '31%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.darkCard + '80',
  },
  cellSelected: {
    backgroundColor: Colors.darkCard,
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.mallardYellow,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.error + '1A',
    zIndex: 10,
  },
  emoji: {
    fontSize: 28,
  },
  speciesName: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Colors.darkTextMuted,
  },
  speciesNameSelected: {
    color: Colors.mallardYellow,
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.darkCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.mallardYellow,
    minWidth: 28,
    textAlign: 'center',
  },
});
