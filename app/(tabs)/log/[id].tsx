import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Cloud, Wind, Droplets, Trash2, Star, Tag, Clock, Users, Waves, Bird, Gauge } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntLogs } from '@/lib/storage';
import { hapticHeavy } from '@/lib/haptics';
import { SPECIES_DATA } from '@/lib/species-data';
import { format } from 'date-fns';

export default function LogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logs, deleteLog } = useHuntLogs();
  const log = logs.find(l => l.id === id);

  if (!log) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.darkTextMuted, fontSize: 16 }}>Hunt not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.mallardYellow, fontSize: 15, fontWeight: '600' }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const totalBirds = log.harvests.reduce((s, h) => s + h.count, 0);

  const getSpeciesColor = (species: string) => {
    const data = SPECIES_DATA.find(s => s.name === species);
    return data?.colors[0] ?? Colors.mallardGreen;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Hunt Log',
      'Are you sure you want to delete this hunt log? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticHeavy();
            deleteLog(log.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={Colors.darkText} />
          </Pressable>
          <Text style={{ color: Colors.darkText, fontSize: 20, fontWeight: '700' }}>Hunt Detail</Text>
        </View>
        <Pressable onPress={handleDelete} style={{ padding: 8 }}>
          <Trash2 size={20} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color={Colors.mallardYellow} />
            <Text style={{ color: Colors.darkText, fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>
              {log.location?.name || 'Unknown Location'}
            </Text>
          </View>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>
            {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          {log.huntType && (
            <View style={{ marginTop: 8 }}>
              <View style={{
                alignSelf: 'flex-start', backgroundColor: Colors.mallardGreen,
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
              }}>
                <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '600' }}>{log.huntType}</Text>
              </View>
            </View>
          )}
        </View>

        {(log.startTime || log.endTime || log.partySize) && (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Hunt Info</Text>
            <View style={{ gap: 10 }}>
              {(log.startTime || log.endTime) && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={16} color={Colors.darkTextMuted} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 8 }}>
                    {log.startTime || '—'} → {log.endTime || '—'}
                  </Text>
                </View>
              )}
              {log.partySize !== undefined && log.partySize > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={16} color={Colors.darkTextMuted} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 8 }}>
                    {log.partySize} {log.partySize === 1 ? 'hunter' : 'hunters'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {log.weather && (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Conditions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Cloud size={16} color={Colors.waterBlue} />
                <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                  {log.weather.temperature}° {log.weather.skyCondition}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Wind size={16} color={Colors.darkTextMuted} />
                <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                  {log.weather.windSpeed} mph {log.weather.windDirection}
                </Text>
              </View>
              {log.weather.humidity !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Droplets size={16} color={Colors.darkTextMuted} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                    {log.weather.humidity}% humidity
                  </Text>
                </View>
              )}
              {log.weather.barometricPressure !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Gauge size={16} color={Colors.darkTextMuted} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 6 }}>
                    {log.weather.barometricPressure} inHg
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {(log.waterCondition || log.birdActivity || log.huntingPressure) && (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Field Conditions</Text>
            <View style={{ gap: 10 }}>
              {log.waterCondition && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Waves size={16} color={Colors.waterBlue} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 8 }}>
                    {log.waterCondition}
                  </Text>
                </View>
              )}
              {log.birdActivity && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Bird size={16} color={Colors.mallardGreenLight} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 8 }}>
                    Bird Activity: {log.birdActivity}
                  </Text>
                </View>
              )}
              {log.huntingPressure && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Gauge size={16} color={Colors.darkTextMuted} />
                  <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, marginLeft: 8 }}>
                    Hunting Pressure: {log.huntingPressure}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={cardStyle}>
          <Text style={sectionTitle}>
            Harvest ({totalBirds} total)
          </Text>
          {log.harvests.length === 0 ? (
            <Text style={{ color: Colors.darkTextMuted, fontSize: 14 }}>No harvest recorded</Text>
          ) : (
            log.harvests.map((h, i) => (
              <View key={i} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 10, borderBottomWidth: i < log.harvests.length - 1 ? 1 : 0,
                borderBottomColor: Colors.darkCardBorder,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: getSpeciesColor(h.species), marginRight: 10,
                  }} />
                  <Text style={{ color: Colors.darkText, fontSize: 15 }}>{h.species}</Text>
                </View>
                <Text style={{ color: Colors.mallardYellow, fontSize: 16, fontWeight: '700' }}>{h.count}</Text>
              </View>
            ))
          )}
        </View>

        {log.rating !== undefined && log.rating > 0 && (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Rating</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={24}
                  color={s <= log.rating! ? Colors.mallardYellow : Colors.darkTextSecondary}
                  fill={s <= log.rating! ? Colors.mallardYellow : 'transparent'}
                />
              ))}
            </View>
          </View>
        )}

        {log.tags && log.tags.length > 0 && (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {log.tags.map((tag) => (
                <View key={tag} style={{
                  backgroundColor: Colors.mallardGreen,
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                }}>
                  <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '500' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {log.notes ? (
          <View style={cardStyle}>
            <Text style={sectionTitle}>Notes</Text>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 14, lineHeight: 20 }}>{log.notes}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleDelete}
          style={{
            marginTop: 16, backgroundColor: Colors.error + '1A', borderRadius: 12,
            padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.error + '33',
          }}
        >
          <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600' }}>Delete Hunt Log</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const sectionTitle = {
  color: Colors.darkText,
  fontSize: 16,
  fontWeight: '700' as const,
  marginBottom: 12,
};

const cardStyle = {
  backgroundColor: Colors.darkCard,
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: Colors.darkCardBorder,
};
