import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function InsightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.darkBg } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
