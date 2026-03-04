import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { hapticLight } from '@/lib/haptics';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(star => (
        <Pressable
          key={star}
          onPress={() => {
            hapticLight();
            onChange(star === value ? 0 : star);
          }}
          style={styles.starButton}
        >
          <Star
            size={32}
            color={star <= value ? Colors.mallardYellow : Colors.darkTextSecondary}
            fill={star <= value ? Colors.mallardYellow : 'transparent'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 4,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
