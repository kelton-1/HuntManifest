import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, MapPin, CheckSquare, Square, Target } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntPlans, useInventory } from '@/lib/storage';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import { HuntPlan, PlanGearItem, WATERFOWL_SPECIES } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function NewPlanScreen() {
  const router = useRouter();
  const { addPlan } = useHuntPlans();
  const { inventory } = useInventory();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedGearIds, setSelectedGearIds] = useState<Set<string>>(new Set());
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());

  const toggleGear = (itemId: string) => {
    hapticLight();
    setSelectedGearIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSpecies = (species: string) => {
    hapticLight();
    setSelectedSpecies(prev => {
      const next = new Set(prev);
      if (next.has(species)) {
        next.delete(species);
      } else {
        next.add(species);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    hapticMedium();

    const gearItems: PlanGearItem[] = inventory
      .filter(item => selectedGearIds.has(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        checked: false,
      }));

    const plan: HuntPlan = {
      id: `plan-${Date.now()}`,
      userId: user?.uid || 'local',
      title: title.trim(),
      date: new Date().toISOString(),
      location: { name: location || 'TBD' },
      gear: gearItems,
      species: Array.from(selectedSpecies),
      status: 'DRAFT',
      notes: notes.trim() || undefined,
      createdAt: new Date(),
    };
    await addPlan(plan);
    setSaving(false);
    router.back();
  };

  const groupedInventory = inventory.reduce<Record<string, typeof inventory>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={{ color: Colors.darkText, fontSize: 24, fontWeight: '800', flex: 1 }}>New Plan</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving || !title.trim()}
          style={{
            backgroundColor: title.trim() ? Colors.mallardYellow : Colors.darkCardBorder,
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
          Hunt Title
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
            color: Colors.darkText, fontSize: 15, marginBottom: 16,
            borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}
          placeholder="e.g. Opening Day at Chariton"
          placeholderTextColor={Colors.darkTextSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Location
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: Colors.darkCard, borderRadius: 12,
          borderWidth: 1, borderColor: Colors.darkCardBorder,
          paddingHorizontal: 14, marginBottom: 16,
        }}>
          <MapPin size={18} color={Colors.darkTextMuted} />
          <TextInput
            style={{ flex: 1, color: Colors.darkText, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 }}
            placeholder="Where are you hunting?"
            placeholderTextColor={Colors.darkTextSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Notes
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
            color: Colors.darkText, fontSize: 15, minHeight: 80,
            borderWidth: 1, borderColor: Colors.darkCardBorder,
            textAlignVertical: 'top', marginBottom: 20,
          }}
          placeholder="Game plan, notes, reminders..."
          placeholderTextColor={Colors.darkTextSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Target size={16} color={Colors.mallardYellow} />
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 6 }}>
            Target Species
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {WATERFOWL_SPECIES.map((species) => {
            const isSelected = selectedSpecies.has(species);
            return (
              <Pressable
                key={species}
                onPress={() => toggleSpecies(species)}
                style={{
                  backgroundColor: isSelected ? Colors.mallardGreen : Colors.darkCard,
                  borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                  borderWidth: 1, borderColor: isSelected ? Colors.mallardGreenLight : Colors.darkCardBorder,
                }}
              >
                <Text style={{
                  color: isSelected ? Colors.mallardYellowLight : Colors.darkTextMuted,
                  fontSize: 13, fontWeight: isSelected ? '600' : '400',
                }}>
                  {species}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
            Gear Selection ({selectedGearIds.size} selected)
          </Text>
        </View>

        {Object.keys(groupedInventory).length === 0 ? (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 20,
            borderWidth: 1, borderColor: Colors.darkCardBorder, alignItems: 'center',
          }}>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>No inventory items available</Text>
          </View>
        ) : (
          Object.entries(groupedInventory).map(([category, items]) => (
            <View key={category} style={{ marginBottom: 12 }}>
              <Text style={{ color: Colors.darkTextSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 4 }}>
                {category}
              </Text>
              <View style={{
                backgroundColor: Colors.darkCard, borderRadius: 12,
                borderWidth: 1, borderColor: Colors.darkCardBorder, overflow: 'hidden',
              }}>
                {items.map((item, i) => {
                  const isSelected = selectedGearIds.has(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleGear(item.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', padding: 12,
                        borderBottomWidth: i < items.length - 1 ? 1 : 0,
                        borderBottomColor: Colors.darkCardBorder,
                        backgroundColor: isSelected ? Colors.mallardGreen + '15' : 'transparent',
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} color={Colors.success} />
                      ) : (
                        <Square size={18} color={Colors.darkTextMuted} />
                      )}
                      <Text style={{
                        color: isSelected ? Colors.darkText : Colors.darkTextSecondary,
                        fontSize: 14, marginLeft: 10, flex: 1,
                      }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: Colors.darkTextMuted, fontSize: 12 }}>
                        Qty: {item.quantity}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
