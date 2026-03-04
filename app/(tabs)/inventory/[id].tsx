import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, CheckCircle, Circle, AlertCircle, Crosshair, CircleDot, Footprints, Bird, Volume2, Shirt, Eye, Shield, Heart, Truck, Package, FileText, DollarSign, Tag, Hash } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useInventory } from '@/lib/storage';
import { hapticLight, hapticHeavy } from '@/lib/haptics';
import { ItemStatus, InventoryCategory } from '@/lib/types';

const CATEGORY_ICONS: Record<InventoryCategory, React.ComponentType<any>> = {
  Firearm: Crosshair,
  Ammo: CircleDot,
  Waders: Footprints,
  Decoy: Bird,
  Call: Volume2,
  Clothing: Shirt,
  Blind: Eye,
  Safety: Shield,
  Dog: Heart,
  Vehicle: Truck,
  Other: Package,
};

export default function InventoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory, deleteItem, setItemStatus, updateItem } = useInventory();
  const item = inventory.find(i => i.id === id);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.darkTextMuted, fontSize: 16 }}>Item not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.mallardYellow, fontSize: 15, fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticHeavy();
            deleteItem(item.id);
            router.back();
          },
        },
      ]
    );
  };

  const statuses: { label: string; value: ItemStatus; icon: React.ReactNode }[] = [
    { label: 'Ready', value: 'READY', icon: <Circle size={18} color={Colors.darkTextMuted} /> },
    { label: 'Packed', value: 'PACKED', icon: <CheckCircle size={18} color={Colors.success} /> },
    { label: 'Missing', value: 'MISSING', icon: <AlertCircle size={18} color={Colors.error} /> },
  ];

  const CategoryIconComponent = CATEGORY_ICONS[item.category] || Package;

  const statusColor = item.status === 'READY' ? Colors.skyMorning : item.status === 'PACKED' ? Colors.success : Colors.error;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={Colors.darkText} />
          </Pressable>
          <Text style={{ color: Colors.darkText, fontSize: 20, fontWeight: '700' }}>Gear Detail</Text>
        </View>
        <Pressable onPress={handleDelete}>
          <Trash2 size={20} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
          marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.mallardGreen,
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <CategoryIconComponent size={20} color={Colors.mallardYellow} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.darkText, fontSize: 22, fontWeight: '700' }}>
                {item.name}
              </Text>
              <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>
                {item.category} · Qty: {item.quantity}
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: statusColor + '20',
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
            borderWidth: 1, borderColor: statusColor + '40',
          }}>
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: '600' }}>{item.status}</Text>
          </View>
        </View>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Status
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {statuses.map(s => (
            <Pressable
              key={s.value}
              onPress={() => { hapticLight(); setItemStatus(item.id, s.value); }}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: item.status === s.value ? Colors.mallardGreen : Colors.darkCard,
                borderRadius: 12, paddingVertical: 12, gap: 6,
                borderWidth: 1, borderColor: item.status === s.value ? Colors.mallardGreenLight : Colors.darkCardBorder,
              }}
            >
              {s.icon}
              <Text style={{ color: Colors.darkText, fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {item.specs && Object.keys(item.specs).filter(k => item.specs[k]).length > 0 && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Specs</Text>
            {Object.entries(item.specs).filter(([_, v]) => v).map(([key, value]) => (
              <View key={key} style={{
                flexDirection: 'row', justifyContent: 'space-between',
                paddingVertical: 6,
              }}>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 14, textTransform: 'capitalize' }}>{key}</Text>
                <Text style={{ color: Colors.darkText, fontSize: 14 }}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {item.condition && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Condition</Text>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 14 }}>{item.condition}</Text>
          </View>
        )}

        {(item.purchaseDate || item.purchasePrice || item.serialNumber || item.warranty) && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <DollarSign size={16} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginLeft: 6 }}>Purchase Info</Text>
            </View>
            {item.purchaseDate && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>Date</Text>
                <Text style={{ color: Colors.darkText, fontSize: 14 }}>{item.purchaseDate}</Text>
              </View>
            )}
            {item.purchasePrice != null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>Price</Text>
                <Text style={{ color: Colors.darkText, fontSize: 14 }}>${item.purchasePrice.toFixed(2)}</Text>
              </View>
            )}
            {item.serialNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>Serial #</Text>
                <Text style={{ color: Colors.darkText, fontSize: 14 }}>{item.serialNumber}</Text>
              </View>
            )}
            {item.warranty && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>Warranty</Text>
                <Text style={{ color: Colors.darkText, fontSize: 14 }}>{item.warranty}</Text>
              </View>
            )}
          </View>
        )}

        {item.notes && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <FileText size={16} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginLeft: 6 }}>Notes</Text>
            </View>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, lineHeight: 20 }}>{item.notes}</Text>
          </View>
        )}

        <Pressable
          onPress={handleDelete}
          style={{
            backgroundColor: Colors.error + '15',
            borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            borderWidth: 1, borderColor: Colors.error + '30',
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Trash2 size={18} color={Colors.error} />
            <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600' }}>Delete Item</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
