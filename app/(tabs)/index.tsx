import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';
import { useGeolocation } from '@/lib/geolocation';
import { useWeather } from '@/lib/weatherApi';
import { useHuntLogs, useHuntPlans, useInventory } from '@/lib/storage';
import { CommandCenterHero } from '@/components/home/CommandCenterHero';
import { AtmosphericCard } from '@/components/home/AtmosphericCard';
import { SeasonGoalsRing } from '@/components/home/SeasonGoalsRing';
import { QuickActions } from '@/components/home/QuickActions';
import { HuntMemoryCarousel } from '@/components/home/HuntMemoryCarousel';
import { WeatherForecastWidget } from '@/components/home/WeatherForecastWidget';

export default function HomeScreen() {
  const { user } = useAuth();
  const { getCurrentPosition } = useGeolocation();
  const { weather, loading: weatherLoading, getWeather } = useWeather();
  const { logs } = useHuntLogs();
  const { plans } = useHuntPlans();
  const { inventory } = useInventory();

  const totalHarvest = logs.reduce((sum, log) =>
    sum + log.harvests.reduce((s, h) => s + h.count, 0), 0
  );

  const hunterName = user?.displayName || user?.email?.split('@')[0] || 'Hunter';

  useEffect(() => {
    const loadWeather = async () => {
      const pos = await getCurrentPosition();
      if (pos) {
        await getWeather(pos.latitude, pos.longitude);
      }
    };
    loadWeather();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <CommandCenterHero
          weather={weather}
          logs={logs}
          plans={plans}
          hunterName={hunterName}
        />

        <AtmosphericCard
          weather={weather}
          loading={weatherLoading}
        />

        <SeasonGoalsRing
          totalHunts={logs.length}
          totalHarvest={totalHarvest}
          hunterName={hunterName}
        />

        <QuickActions
          weather={weather}
          inventory={inventory}
          plans={plans}
        />

        {logs.length > 0 && (
          <HuntMemoryCarousel logs={logs} />
        )}

        <WeatherForecastWidget />
      </ScrollView>
    </SafeAreaView>
  );
}
