import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ClipboardList, Calendar, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntPlans } from '@/lib/storage';
import { hapticLight } from '@/lib/haptics';
import { format } from 'date-fns';

export default function PlanListScreen() {
  const router = useRouter();
  const { plans, loading } = useHuntPlans();

  const activePlans = plans.filter(p => p.status === 'ACTIVE' || p.status === 'DRAFT');
  const completedPlans = plans.filter(p => p.status === 'COMPLETED');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: Colors.darkText, fontSize: 28, fontWeight: '800' }}>Plans</Text>
        <Pressable
          onPress={() => { hapticLight(); router.push('/(tabs)/plan/new'); }}
          style={{
            backgroundColor: Colors.mallardYellow, borderRadius: 20,
            paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
          }}
        >
          <Plus size={16} color={Colors.darkBg} />
          <Text style={{ color: Colors.darkBg, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>New Plan</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {plans.length === 0 ? (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 40,
            alignItems: 'center', borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <ClipboardList size={40} color={Colors.darkTextMuted} />
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
              No plans yet
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Plan your next hunt with gear lists and location
            </Text>
          </View>
        ) : (
          <>
            {activePlans.length > 0 && (
              <>
                <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Active
                </Text>
                {activePlans.map(plan => (
                  <Pressable
                    key={plan.id}
                    style={{
                      backgroundColor: Colors.darkCard, borderRadius: 12, padding: 16,
                      marginBottom: 8, borderWidth: 1, borderColor: Colors.darkCardBorder,
                    }}
                    onPress={() => router.push(`/(tabs)/plan/${plan.id}`)}
                  >
                    <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600' }}>{plan.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Calendar size={12} color={Colors.darkTextSecondary} />
                        <Text style={{ color: Colors.darkTextSecondary, fontSize: 12, marginLeft: 4 }}>
                          {format(new Date(plan.date), 'MMM d')}
                        </Text>
                      </View>
                      {plan.location?.name && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MapPin size={12} color={Colors.darkTextSecondary} />
                          <Text style={{ color: Colors.darkTextSecondary, fontSize: 12, marginLeft: 4 }}>
                            {plan.location.name}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                      <View style={{
                        backgroundColor: plan.status === 'ACTIVE' ? Colors.mallardGreen : Colors.darkCardBorder,
                        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
                      }}>
                        <Text style={{ color: Colors.darkText, fontSize: 11, fontWeight: '600' }}>{plan.status}</Text>
                      </View>
                      <View style={{
                        backgroundColor: Colors.darkCardBorder,
                        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
                      }}>
                        <Text style={{ color: Colors.darkTextMuted, fontSize: 11, fontWeight: '600' }}>
                          {plan.gear.length} items
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
