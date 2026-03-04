import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { hapticLight } from '@/lib/haptics';

interface QuickTagsProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

const PRESET_TAGS = [
  "Public Land",
  "Private Land",
  "Bluebird Day",
  "Foggy Morning",
  "Late Season",
  "Opening Day",
  "Afternoon Hunt",
  "Pass Shooting",
  "Timber",
  "Field Hunt",
  "Layout Blind",
  "Pit Blind",
];

export function QuickTags({ selectedTags, onToggle }: QuickTagsProps) {
  return (
    <View style={styles.container}>
      {PRESET_TAGS.map(tag => {
        const isActive = selectedTags.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => {
              hapticLight();
              onToggle(tag);
            }}
            style={[styles.tag, isActive ? styles.tagActive : styles.tagInactive]}
          >
            <Text style={[styles.tagText, isActive ? styles.tagTextActive : styles.tagTextInactive]}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagActive: {
    backgroundColor: Colors.mallardGreen,
  },
  tagInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextActive: {
    color: Colors.white,
  },
  tagTextInactive: {
    color: Colors.darkTextMuted,
  },
});
