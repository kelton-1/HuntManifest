import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, NotebookPen, Package, BarChart3 } from 'lucide-react-native';
import { hapticLight } from '@/lib/haptics';
import { Colors } from '@/constants/Colors';
import { WeatherConditions, InventoryItem, HuntPlan } from '@/lib/types';
import { getHuntingSuitability } from '@/lib/huntingSuitability';

interface QuickActionsProps {
  weather: WeatherConditions | null;
  inventory: InventoryItem[];
  plans: HuntPlan[];
}

export function QuickActions({ weather, inventory, plans }: QuickActionsProps) {
  const router = useRouter();

  const suitability = weather ? getHuntingSuitability(weather) : null;
  const hasActivePlan = plans.some((p) => p.status === 'ACTIVE');

  const planSublabel =
    suitability?.level === 'GOOD'
      ? 'Conditions look good'
      : hasActivePlan
        ? 'Continue planning'
        : 'Set up your next hunt';

  const actions = [
    { icon: Calendar, label: 'Plan Hunt', sublabel: planSublabel, href: '/(tabs)/plan/new' as const, primary: true },
    { icon: NotebookPen, label: 'Log Hunt', sublabel: 'Record your day', href: '/(tabs)/log/new' as const, primary: false },
    { icon: Package, label: 'Inventory', sublabel: `${inventory.length} items`, href: '/(tabs)/inventory' as const, primary: false },
    { icon: BarChart3, label: 'Insights', sublabel: 'Season trends', href: '/(tabs)/insights' as const, primary: false },
  ];

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.href}
          style={styles.card}
          onPress={() => {
            hapticLight();
            router.push(action.href);
          }}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: action.primary ? 'rgba(245, 184, 0, 0.1)' : 'rgba(148, 163, 184, 0.1)' },
            ]}
          >
            <action.icon
              size={20}
              color={action.primary ? Colors.mallardYellow : Colors.darkText}
            />
          </View>
          <Text
            style={[
              styles.label,
              { color: action.primary ? Colors.mallardYellow : Colors.darkText },
            ]}
          >
            {action.label}
          </Text>
          <Text style={styles.sublabel}>{action.sublabel}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
});
