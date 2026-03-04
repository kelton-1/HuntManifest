import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Save, Clock, Users } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useHuntLogs } from '@/lib/storage';
import { useGeolocation } from '@/lib/geolocation';
import { useWeather } from '@/lib/weatherApi';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import { HuntLog, Harvest, HuntType, WaterCondition, BirdActivity } from '@/lib/types';
import { format } from 'date-fns';
import { SpeciesTapGrid } from '@/components/log/SpeciesTapGrid';
import { StarRating } from '@/components/log/StarRating';
import { QuickTags } from '@/components/log/QuickTags';
import { PillSelector } from '@/components/log/PillSelector';

const HUNT_TYPES: readonly string[] = ['Waterfowl', 'Upland', 'Turkey', 'Deer', 'Other'];
const WATER_CONDITIONS: readonly string[] = ['Flooded Timber', 'Open Water', 'Sheet Water', 'Marsh', 'Dry Field', 'River'];
const BIRD_ACTIVITIES: readonly string[] = ['None', 'Low', 'Moderate', 'High', 'Heavy'];

export default function NewLogScreen() {
  const router = useRouter();
  const { addLog } = useHuntLogs();
  const { getCurrentPosition } = useGeolocation();
  const { getWeather } = useWeather();

  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [huntType, setHuntType] = useState<string | undefined>(undefined);
  const [waterCondition, setWaterCondition] = useState<string | undefined>(undefined);
  const [birdActivity, setBirdActivity] = useState<string | undefined>(undefined);
  const [partySize, setPartySize] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const addHarvest = (species: string) => {
    hapticLight();
    const existing = harvests.find(h => h.species === species);
    if (existing) {
      setHarvests(harvests.map(h => h.species === species ? { ...h, count: h.count + 1 } : h));
    } else {
      setHarvests([...harvests, { species, count: 1 }]);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    hapticMedium();

    let weather = undefined;
    let lat = undefined;
    let lng = undefined;

    try {
      const pos = await getCurrentPosition();
      if (pos) {
        lat = pos.latitude;
        lng = pos.longitude;
        const result = await getWeather(pos.latitude, pos.longitude);
        if (result.success) weather = result.data;
      }
    } catch {}

    const log: HuntLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      huntType: huntType as HuntType | undefined,
      location: {
        name: locationName || 'Unknown Location',
        latitude: lat,
        longitude: lng,
      },
      weather: weather || {
        temperature: 0,
        windSpeed: 0,
        windDirection: 'N',
        skyCondition: 'Clear',
      },
      harvests,
      notes,
      rating: rating > 0 ? rating : undefined,
      tags: tags.length > 0 ? tags : undefined,
      waterCondition: waterCondition as WaterCondition | undefined,
      birdActivity: birdActivity as BirdActivity | undefined,
      partySize: partySize ? parseInt(partySize, 10) : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      createdAt: new Date(),
    };

    await addLog(log);
    setSaving(false);
    router.back();
  };

  const totalBirds = harvests.reduce((s, h) => s + h.count, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={{ color: Colors.darkText, fontSize: 24, fontWeight: '800', flex: 1 }}>Log Hunt</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: Colors.mallardYellow, borderRadius: 20,
            paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save size={16} color={Colors.darkBg} />
          <Text style={{ color: Colors.darkBg, fontSize: 13, fontWeight: '700', marginLeft: 4 }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 40 }}>
        <Text style={sectionLabel}>Date</Text>
        <View style={cardStyle}>
          <Text style={{ color: Colors.darkText, fontSize: 15 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        <Text style={sectionLabel}>Hunt Type</Text>
        <View style={{ marginBottom: 16 }}>
          <PillSelector options={HUNT_TYPES} selected={huntType} onSelect={setHuntType} />
        </View>

        <Text style={sectionLabel}>Location</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: Colors.darkCard, borderRadius: 12,
          borderWidth: 1, borderColor: Colors.darkCardBorder,
          paddingHorizontal: 14, marginBottom: 16,
        }}>
          <MapPin size={18} color={Colors.darkTextMuted} />
          <TextInput
            style={{ flex: 1, color: Colors.darkText, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 }}
            placeholder="Hunt location"
            placeholderTextColor={Colors.darkTextSecondary}
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        <Text style={sectionLabel}>Start / End Time</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: Colors.darkCard, borderRadius: 12,
            borderWidth: 1, borderColor: Colors.darkCardBorder, paddingHorizontal: 14,
          }}>
            <Clock size={16} color={Colors.darkTextMuted} />
            <TextInput
              style={{ flex: 1, color: Colors.darkText, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 }}
              placeholder="Start (e.g. 5:30 AM)"
              placeholderTextColor={Colors.darkTextSecondary}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: Colors.darkCard, borderRadius: 12,
            borderWidth: 1, borderColor: Colors.darkCardBorder, paddingHorizontal: 14,
          }}>
            <Clock size={16} color={Colors.darkTextMuted} />
            <TextInput
              style={{ flex: 1, color: Colors.darkText, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 }}
              placeholder="End (e.g. 11:00 AM)"
              placeholderTextColor={Colors.darkTextSecondary}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        <Text style={sectionLabel}>Party Size</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: Colors.darkCard, borderRadius: 12,
          borderWidth: 1, borderColor: Colors.darkCardBorder,
          paddingHorizontal: 14, marginBottom: 16,
        }}>
          <Users size={16} color={Colors.darkTextMuted} />
          <TextInput
            style={{ flex: 1, color: Colors.darkText, fontSize: 15, paddingVertical: 14, paddingHorizontal: 10 }}
            placeholder="Number of hunters"
            placeholderTextColor={Colors.darkTextSecondary}
            value={partySize}
            onChangeText={setPartySize}
            keyboardType="number-pad"
          />
        </View>

        <Text style={sectionLabel}>Water Condition</Text>
        <View style={{ marginBottom: 16 }}>
          <PillSelector options={WATER_CONDITIONS} selected={waterCondition} onSelect={setWaterCondition} />
        </View>

        <Text style={sectionLabel}>Bird Activity</Text>
        <View style={{ marginBottom: 16 }}>
          <PillSelector options={BIRD_ACTIVITIES} selected={birdActivity} onSelect={setBirdActivity} />
        </View>

        <Text style={sectionLabel}>Harvest ({totalBirds} total)</Text>
        <View style={{ marginBottom: 16 }}>
          <SpeciesTapGrid
            harvests={harvests}
            onTap={addHarvest}
            onUpdate={setHarvests}
          />
        </View>

        <Text style={sectionLabel}>Hunt Rating</Text>
        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
          marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
          alignItems: 'center',
        }}>
          <StarRating value={rating} onChange={setRating} />
        </View>

        <Text style={sectionLabel}>Quick Tags</Text>
        <View style={{
          backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
          marginBottom: 16, borderWidth: 1, borderColor: Colors.darkCardBorder,
        }}>
          <QuickTags selectedTags={tags} onToggle={toggleTag} />
        </View>

        <Text style={sectionLabel}>Notes</Text>
        <TextInput
          style={{
            backgroundColor: Colors.darkCard, borderRadius: 12, padding: 14,
            color: Colors.darkText, fontSize: 15, minHeight: 100,
            borderWidth: 1, borderColor: Colors.darkCardBorder,
            textAlignVertical: 'top',
          }}
          placeholder="How was the hunt?"
          placeholderTextColor={Colors.darkTextSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const sectionLabel = {
  color: Colors.darkTextMuted,
  fontSize: 12,
  fontWeight: '600' as const,
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
};

const cardStyle = {
  backgroundColor: Colors.darkCard,
  borderRadius: 12,
  padding: 14,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: Colors.darkCardBorder,
};
