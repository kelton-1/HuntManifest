import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { hapticLight } from '@/lib/haptics';

interface PillSelectorProps {
  options: readonly string[];
  selected: string | undefined;
  onSelect: (value: string) => void;
  label?: string;
}

export function PillSelector({ options, selected, onSelect, label }: PillSelectorProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {options.map(opt => {
          const isActive = selected === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => {
                hapticLight();
                onSelect(opt);
              }}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            >
              <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: Colors.darkTextMuted,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: Colors.mallardGreen,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: Colors.white,
  },
  pillTextInactive: {
    color: Colors.darkTextMuted,
  },
});
