import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useInventory } from '@/lib/storage';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import { InventoryItem, InventoryCategory, INVENTORY_CATEGORIES } from '@/lib/types';

export default function AddInventoryScreen() {
  const router = useRouter();
  const { addItem } = useInventory();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Firearm');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    hapticMedium();
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      category,
      quantity,
      status: 'READY',
      specs: {},
      notes: notes.trim() || undefined,
      createdAt: new Date(),
    };
    await addItem(item);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={{ color: Colors.darkText, fontSize: 24, fontWeight: '800', flex: 1 }}>Add Gear</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving || !name.trim()}
          style={{
            backgroundColor: name.trim() ? Colors.mallardYellow : Colors.darkCardBorder,
            borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
            flexDirection: 'row', alignItems: 'center',
          }}
        >
          <Save size={16} color={Colors.darkBg} />
          <Text style={{ color: Colors.darkBg, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}>
        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Item Name
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
            color: Colors.darkText, fontSize: 15, marginBottom: 16,
            borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}
          placeholder="e.g. Benelli SBE3"
          placeholderTextColor={Colors.darkTextSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {INVENTORY_CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => { hapticLight(); setCategory(cat); }}
              style={{
                backgroundColor: category === cat ? Colors.mallardGreen : Colors.darkCard,
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8,
                borderWidth: 1, borderColor: category === cat ? Colors.mallardGreenLight : Colors.darkCardBorder,
              }}
            >
              <Text style={{ color: Colors.darkText, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Quantity
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => { if (quantity > 1) { hapticLight(); setQuantity(quantity - 1); }}}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: Colors.darkCard, justifyContent: 'center', alignItems: 'center',
              borderWidth: 1, borderColor: Colors.darkCardBorder,
            }}
          >
            <Minus size={18} color={Colors.darkText} />
          </Pressable>
          <Text style={{ color: Colors.darkText, fontSize: 24, fontWeight: '700', marginHorizontal: 20 }}>
            {quantity}
          </Text>
          <Pressable
            onPress={() => { hapticLight(); setQuantity(quantity + 1); }}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: Colors.mallardGreen, justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Plus size={18} color={Colors.darkText} />
          </Pressable>
        </View>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Notes
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
            color: Colors.darkText, fontSize: 15, minHeight: 80,
            borderWidth: 1, borderColor: Colors.darkCardBorder,
            textAlignVertical: 'top',
          }}
          placeholder="Optional notes"
          placeholderTextColor={Colors.darkTextSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>
    </SafeAreaView>
  );
}
