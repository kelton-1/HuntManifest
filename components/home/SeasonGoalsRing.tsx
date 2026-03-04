import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Trophy, Bird, TrendingUp } from 'lucide-react-native';
import { useCountUp } from '@/lib/useCountUp';
import { Colors } from '@/constants/Colors';

interface SeasonGoalsRingProps {
  totalHunts: number;
  totalHarvest: number;
  hunterName: string;
}

type MetricType = 'hunts' | 'harvest' | 'average';

export function SeasonGoalsRing({ totalHunts, totalHarvest, hunterName }: SeasonGoalsRingProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('hunts');

  const seasonGoals = {
    hunts: 20,
    harvest: 50,
  };

  const avgPerHunt = totalHunts > 0 ? (totalHarvest / totalHunts).toFixed(1) : '0';

  const getMetricData = () => {
    switch (activeMetric) {
      case 'hunts':
        return {
          value: totalHunts,
          goal: seasonGoals.hunts,
          label: 'Hunts',
          sublabel: `of ${seasonGoals.hunts} goal`,
          progress: Math.min((totalHunts / seasonGoals.hunts) * 100, 100),
          Icon: Bird,
          iconColor: Colors.mallardGreenLight,
          gradientId: 'grad-hunts',
        };
      case 'harvest':
        return {
          value: totalHarvest,
          goal: seasonGoals.harvest,
          label: 'Harvest',
          sublabel: `of ${seasonGoals.harvest} goal`,
          progress: Math.min((totalHarvest / seasonGoals.harvest) * 100, 100),
          Icon: Trophy,
          iconColor: Colors.mallardYellow,
          gradientId: 'grad-harvest',
        };
      case 'average':
        return {
          value: avgPerHunt,
          goal: 5,
          label: 'Avg/Hunt',
          sublabel: 'birds per outing',
          progress: Math.min((parseFloat(avgPerHunt) / 5) * 100, 100),
          Icon: TrendingUp,
          iconColor: Colors.waterBlue,
          gradientId: 'grad-avg',
        };
    }
  };

  const metric = getMetricData();
  const animatedValue = useCountUp(
    typeof metric.value === 'number' ? metric.value : parseFloat(metric.value as string)
  );
  const displayValue =
    activeMetric === 'average' ? (animatedValue / 10).toFixed(1) : animatedValue;

  const svgSize = 160;
  const strokeWidth = 12;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metric.progress / 100) * circumference;

  const MetricIcon = metric.Icon;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <Svg width={svgSize} height={svgSize} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Defs>
              <LinearGradient id="grad-hunts" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#166653" />
                <Stop offset="100%" stopColor="#2DD4BF" />
              </LinearGradient>
              <LinearGradient id="grad-harvest" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#F5B800" />
                <Stop offset="100%" stopColor="#FB923C" />
              </LinearGradient>
              <LinearGradient id="grad-avg" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#0EA5E9" />
                <Stop offset="100%" stopColor="#6366F1" />
              </LinearGradient>
            </Defs>
            <Circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
            />
            <Circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              stroke={`url(#${metric.gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          </Svg>
          <View style={styles.centerContent}>
            <MetricIcon size={20} color={metric.iconColor} style={{ marginBottom: 4 }} />
            <Text style={styles.valueText}>{displayValue}</Text>
            <Text style={styles.labelText}>{metric.label}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.welcomeText} numberOfLines={1}>
            Welcome, {hunterName}
          </Text>
          <Text style={styles.progressText}>
            You're {Math.round(metric.progress)}% of the way to your {metric.label.toLowerCase()}{' '}
            goal.
          </Text>

          <View style={styles.pillContainer}>
            {(['hunts', 'harvest', 'average'] as MetricType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setActiveMetric(type)}
                style={[styles.pill, activeMetric === type && styles.pillActive]}
              >
                <Text
                  style={[styles.pillText, activeMetric === type && styles.pillTextActive]}
                >
                  {type === 'average' ? 'AVG' : type.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalHunts}</Text>
          <Text style={styles.statLabel}>HUNTS</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={[styles.statValue, { color: Colors.mallardYellow }]}>{totalHarvest}</Text>
          <Text style={styles.statLabel}>HARVEST</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.waterBlue }]}>{avgPerHunt}</Text>
          <Text style={styles.statLabel}>AVG/HUNT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.darkTextMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoSection: {
    flex: 1,
    gap: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkText,
  },
  progressText: {
    fontSize: 13,
    color: Colors.darkTextMuted,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: Colors.darkBg,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.darkTextMuted,
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: Colors.darkText,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.darkCardBorder,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkText,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.darkTextMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
