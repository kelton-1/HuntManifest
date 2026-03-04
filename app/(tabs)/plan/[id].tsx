import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Trash2, Package, CheckSquare, Square, Play, CheckCircle, FileText, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntPlans } from '@/lib/storage';
import { hapticLight, hapticMedium, hapticHeavy } from '@/lib/haptics';
import { format } from 'date-fns';
import { PlanStatus } from '@/lib/types';

const STATUS_CONFIG: Record<PlanStatus, { color: string; label: string }> = {
  DRAFT: { color: Colors.darkTextMuted, label: 'Draft' },
  ACTIVE: { color: Colors.mallardYellow, label: 'Active' },
  COMPLETED: { color: Colors.success, label: 'Completed' },
  ARCHIVED: { color: Colors.darkTextSecondary, label: 'Archived' },
};

const STATUS_FLOW: PlanStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED'];

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, deletePlan, updatePlan } = useHuntPlans();
  const plan = plans.find(p => p.id === id);

  if (!plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.darkTextMuted, fontSize: 16 }}>Plan not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.mallardYellow, fontSize: 15, fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticHeavy();
            deletePlan(plan.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatus: PlanStatus) => {
    hapticMedium();
    updatePlan({ ...plan, status: newStatus });
  };

  const handleToggleGearCheck = (gearIndex: number) => {
    hapticLight();
    const updatedGear = [...plan.gear];
    updatedGear[gearIndex] = { ...updatedGear[gearIndex], checked: !updatedGear[gearIndex].checked };
    updatePlan({ ...plan, gear: updatedGear });
  };

  const handleConvertToLog = () => {
    hapticMedium();
    router.push({
      pathname: '/(tabs)/log/new',
      params: {
        planId: plan.id,
        prefillTitle: plan.title,
        prefillLocation: plan.location?.name || '',
        prefillDate: plan.date,
      },
    });
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(plan.status);
  const nextStatus = currentStatusIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIndex + 1] : null;
  const statusConfig = STATUS_CONFIG[plan.status];
  const checkedCount = plan.gear.filter(g => g.checked).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={Colors.darkText} />
          </Pressable>
          <Text style={{ color: Colors.darkText, fontSize: 20, fontWeight: '700' }}>Plan Detail</Text>
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
          <Text style={{ color: Colors.darkText, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
            {plan.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={14} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                {format(new Date(plan.date), 'MMM d, yyyy')}
              </Text>
            </View>
            {plan.location?.name && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={14} color={Colors.mallardYellow} />
                <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                  {plan.location.name}
                </Text>
              </View>
            )}
          </View>
          <View style={{
            backgroundColor: statusConfig.color + '20',
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 12,
            borderWidth: 1, borderColor: statusConfig.color + '40',
          }}>
            <Text style={{ color: statusConfig.color, fontSize: 12, fontWeight: '600' }}>{statusConfig.label}</Text>
          </View>
        </View>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Status Management
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {STATUS_FLOW.map((status) => {
            const config = STATUS_CONFIG[status];
            const isActive = plan.status === status;
            return (
              <Pressable
                key={status}
                onPress={() => handleStatusChange(status)}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isActive ? config.color + '25' : Colors.darkCard,
                  borderRadius: 12, paddingVertical: 12,
                  borderWidth: 1, borderColor: isActive ? config.color : Colors.darkCardBorder,
                }}
              >
                <Text style={{ color: isActive ? config.color : Colors.darkTextMuted, fontSize: 12, fontWeight: '600' }}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
          marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Package size={18} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                Gear ({plan.gear.length} items)
              </Text>
            </View>
            {plan.gear.length > 0 && (
              <Text style={{ color: Colors.darkTextMuted, fontSize: 12 }}>
                {checkedCount}/{plan.gear.length} checked
              </Text>
            )}
          </View>
          {plan.gear.length === 0 ? (
            <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>No gear added to this plan</Text>
          ) : (
            plan.gear.map((gearItem, i) => (
              <Pressable
                key={i}
                onPress={() => handleToggleGearCheck(i)}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 10, borderBottomWidth: i < plan.gear.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.darkCardBorder,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {gearItem.checked ? (
                    <CheckSquare size={18} color={Colors.success} />
                  ) : (
                    <Square size={18} color={Colors.darkTextMuted} />
                  )}
                  <Text style={{
                    color: gearItem.checked ? Colors.darkTextMuted : Colors.darkText,
                    fontSize: 14, marginLeft: 10,
                    textDecorationLine: gearItem.checked ? 'line-through' : 'none',
                  }}>
                    {gearItem.name}
                  </Text>
                </View>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 12 }}>{gearItem.category}</Text>
              </Pressable>
            ))
          )}
        </View>

        {plan.species && plan.species.length > 0 && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Target Species</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {plan.species.map((species) => (
                <View key={species} style={{
                  backgroundColor: Colors.mallardGreen + '30',
                  borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
                  borderWidth: 1, borderColor: Colors.mallardGreen + '50',
                }}>
                  <Text style={{ color: Colors.mallardYellowLight, fontSize: 13 }}>{species}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {plan.notes && (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 20,
            marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <FileText size={16} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '700', marginLeft: 6 }}>Notes</Text>
            </View>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, lineHeight: 20 }}>{plan.notes}</Text>
          </View>
        )}

        <Pressable
          onPress={handleConvertToLog}
          style={{
            backgroundColor: Colors.mallardGreen,
            borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            borderWidth: 1, borderColor: Colors.mallardGreenLight,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowRight size={18} color={Colors.mallardYellow} />
            <Text style={{ color: Colors.darkText, fontSize: 15, fontWeight: '600' }}>Convert to Hunt Log</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={{
            backgroundColor: Colors.error + '15',
            borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            borderWidth: 1, borderColor: Colors.error + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Trash2 size={18} color={Colors.error} />
            <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600' }}>Delete Plan</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
