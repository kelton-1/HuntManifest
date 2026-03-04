import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Bird, ChevronRight } from 'lucide-react-native';
import { HuntLog } from '@/lib/types';
import { hapticLight } from '@/lib/haptics';
import { Colors } from '@/constants/Colors';

interface HuntMemoryCarouselProps {
  logs: HuntLog[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_MARGIN = 8;

function getCardBg(index: number): string {
  const bgs = [
    Colors.mallardGreen,
    Colors.skyDawn,
    Colors.mallardGreenLight,
    Colors.mallardGreen,
  ];
  return bgs[index % bgs.length];
}

export function HuntMemoryCarousel({ logs }: HuntMemoryCarouselProps) {
  const router = useRouter();
  const displayLogs = logs.slice(0, 6);

  if (logs.length === 0) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Hunt Memories</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No hunt memories yet</Text>
          <Text style={styles.emptySubtitle}>Tap + to record your first hunt</Text>
        </View>
      </View>
    );
  }

  const renderCard = ({ item, index }: { item: HuntLog; index: number }) => {
    const harvestCount = item.harvests.reduce((sum, h) => sum + h.count, 0);
    const dateStr = new Date(item.date).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <Pressable
        onPress={() => {
          hapticLight();
          router.push(`/(tabs)/log/${item.id}`);
        }}
        style={[styles.card, { backgroundColor: getCardBg(index) }]}
      >
        <View style={styles.cardTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dateStr}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.weather.temperature}°F</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.locationRow}>
            <MapPin size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location.name}
            </Text>
          </View>
          <View style={styles.harvestBadge}>
            <Bird size={14} color={Colors.mallardYellow} />
            <Text style={styles.harvestCount}>{harvestCount}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Hunt Memories</Text>
        <Pressable
          onPress={() => {
            hapticLight();
            router.push('/(tabs)/log');
          }}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={12} color={Colors.mallardYellow} />
        </Pressable>
      </View>
      <FlatList
        data={displayLogs}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.darkTextMuted,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.mallardYellow,
  },
  card: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  harvestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  harvestCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyCard: {
    backgroundColor: Colors.darkCard,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.darkCardBorder,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkText,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.darkTextMuted,
    marginTop: 4,
  },
});
