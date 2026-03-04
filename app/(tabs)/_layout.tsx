import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, BarChart3, Plus, BookOpen, Package } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { hapticMedium } from '@/lib/haptics';

function FABButton() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const actions = [
    { label: 'Plan Hunt', icon: '📋', route: '/(tabs)/plan/new' as const },
    { label: 'Add Gear', icon: '🎒', route: '/(tabs)/inventory/add' as const },
    { label: 'Log Hunt', icon: '📝', route: '/(tabs)/log/new' as const },
  ];

  return (
    <View style={styles.fabContainer}>
      {showMenu && (
        <View style={styles.fabMenu}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              style={styles.fabMenuItem}
              onPress={() => {
                hapticMedium();
                setShowMenu(false);
                router.push(action.route);
              }}
            >
              <View style={styles.fabMenuIcon}>
                <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
                  <View><Home size={16} color={Colors.white} /></View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <Pressable
        style={[styles.fab, showMenu && styles.fabActive]}
        onPress={() => {
          hapticMedium();
          setShowMenu(!showMenu);
        }}
      >
        <Plus
          size={28}
          color={Colors.darkBg}
          style={showMenu ? { transform: [{ rotate: '45deg' }] } : undefined}
        />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkCard,
          borderTopColor: Colors.darkCardBorder,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.mallardYellow,
        tabBarInactiveTintColor: Colors.darkTextMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarButton: () => <FABButton />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Gear',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'relative',
    alignItems: 'center',
    top: -20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.mallardYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.mallardYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: Colors.mallardGreenLight,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center',
    gap: 8,
  },
  fabMenuItem: {
    backgroundColor: Colors.darkCard,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  fabMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mallardGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
