import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Package, CheckCircle, AlertCircle, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useInventory } from '@/lib/storage';
import { hapticLight } from '@/lib/haptics';
import { InventoryCategory, INVENTORY_CATEGORIES } from '@/lib/types';

export default function InventoryListScreen() {
  const router = useRouter();
  const { inventory, loading, toggleStatus } = useInventory();
  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const [filterCategory, setFilterCategory] = useState<InventoryCategory | null>(null);

  const filtered = filterCategory
    ? inventory.filter(i => i.category === filterCategory)
    : inventory;

  const packedCount = inventory.filter(i => i.status === 'PACKED').length;
  const readyCount = inventory.filter(i => i.status === 'READY').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: Colors.darkText, fontSize: 28, fontWeight: '800' }}>Gear</Text>
        <Pressable
          onPress={() => { hapticLight(); router.push('/(tabs)/inventory/add'); }}
          style={{
            backgroundColor: Colors.mallardYellow, borderRadius: 20,
            paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
          }}
        >
          <Plus size={16} color={Colors.darkBg} />
          <Text style={{ color: Colors.darkBg, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>Add</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{
          backgroundColor: Colors.mallardGreen, borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ color: Colors.darkText, fontSize: 12, fontWeight: '600' }}>
            {packedCount} packed
          </Text>
        </View>
        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 4,
          borderWidth: 1, borderColor: Colors.darkCardBorder,
        }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600' }}>
            {readyCount} ready
          </Text>
        </View>
        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 4,
          borderWidth: 1, borderColor: Colors.darkCardBorder,
        }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600' }}>
            {inventory.length} total
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, paddingHorizontal: 16, marginBottom: 8 }}>
        <Pressable
          onPress={() => setFilterCategory(null)}
          style={{
            backgroundColor: !filterCategory ? Colors.mallardGreen : Colors.darkCard,
            borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
            borderWidth: 1, borderColor: !filterCategory ? Colors.mallardGreen : Colors.darkCardBorder,
          }}
        >
          <Text style={{ color: Colors.darkText, fontSize: 12, fontWeight: '600' }}>All</Text>
        </Pressable>
        {INVENTORY_CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
            style={{
              backgroundColor: filterCategory === cat ? Colors.mallardGreen : Colors.darkCard,
              borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
              borderWidth: 1, borderColor: filterCategory === cat ? Colors.mallardGreen : Colors.darkCardBorder,
            }}
          >
            <Text style={{ color: Colors.darkText, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {filtered.length === 0 ? (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 40,
            alignItems: 'center', borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <Package size={40} color={Colors.darkTextMuted} />
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
              No gear yet
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Add your hunting gear to get started
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <Pressable
              key={item.id}
              style={{
                backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
                marginBottom: 6, borderWidth: 1, borderColor: Colors.darkCardBorder,
                flexDirection: 'row', alignItems: 'center',
              }}
              onPress={() => router.push(`/(tabs)/inventory/${item.id}`)}
            >
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  hapticLight();
                  toggleStatus(item.id, item.status);
                }}
                style={{ marginRight: 12 }}
              >
                {item.status === 'PACKED' ? (
                  <CheckCircle size={22} color={Colors.success} />
                ) : item.status === 'MISSING' ? (
                  <AlertCircle size={22} color={Colors.error} />
                ) : (
                  <View style={{
                    width: 22, height: 22, borderRadius: 11,
                    borderWidth: 2, borderColor: Colors.darkTextMuted,
                  }} />
                )}
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.darkText, fontSize: 15, fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 12 }}>
                  {item.category} · Qty: {item.quantity}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
