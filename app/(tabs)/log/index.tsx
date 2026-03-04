import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, BookOpen, MapPin, Cloud } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntLogs } from '@/lib/storage';
import { hapticLight } from '@/lib/haptics';
import { format } from 'date-fns';

export default function LogListScreen() {
  const router = useRouter();
  const { logs, loading } = useHuntLogs();

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: Colors.darkText, fontSize: 28, fontWeight: '800' }}>Journal</Text>
        <Pressable
          onPress={() => { hapticLight(); router.push('/(tabs)/log/new'); }}
          style={{
            backgroundColor: Colors.mallardYellow, borderRadius: 20,
            paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
          }}
        >
          <Plus size={16} color={Colors.darkBg} />
          <Text style={{ color: Colors.darkBg, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>Log Hunt</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {sortedLogs.length === 0 ? (
          <View style={{
            backgroundColor: Colors.darkCard, borderRadius: 16, padding: 40,
            alignItems: 'center', borderWidth: 1, borderColor: Colors.darkCardBorder,
          }}>
            <BookOpen size={40} color={Colors.darkTextMuted} />
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
              No hunts logged yet
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Tap the + button to log your first hunt
            </Text>
          </View>
        ) : (
          sortedLogs.map((log) => {
            const totalBirds = log.harvests.reduce((s, h) => s + h.count, 0);
            return (
              <Pressable
                key={log.id}
                style={{
                  backgroundColor: Colors.darkCard, borderRadius: 12, padding: 16,
                  marginBottom: 8, borderWidth: 1, borderColor: Colors.darkCardBorder,
                }}
                onPress={() => router.push(`/(tabs)/log/${log.id}`)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600' }}>
                      {log.location?.name || 'Unknown Location'}
                    </Text>
                    <Text style={{ color: Colors.darkTextMuted, fontSize: 12, marginTop: 2 }}>
                      {format(new Date(log.date), 'EEEE, MMM d, yyyy')}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: totalBirds > 0 ? Colors.mallardGreen : Colors.darkCardBorder,
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                  }}>
                    <Text style={{ color: Colors.darkText, fontSize: 13, fontWeight: '700' }}>
                      {totalBirds} {totalBirds === 1 ? 'bird' : 'birds'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  {log.weather && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Cloud size={12} color={Colors.darkTextSecondary} />
                      <Text style={{ color: Colors.darkTextSecondary, fontSize: 12, marginLeft: 4 }}>
                        {log.weather.temperature}° {log.weather.skyCondition}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
