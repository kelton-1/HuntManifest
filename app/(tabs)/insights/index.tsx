import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';
import { useHuntLogs } from '@/lib/storage';
import { useInsights } from '@/lib/useInsights';
import { InsightsSummary } from '@/lib/gemini';
import { SeasonPulse } from '@/components/insights/SeasonPulse';
import { WeatherPatterns } from '@/components/insights/WeatherPatterns';
import { SpeciesBreakdown } from '@/components/insights/SpeciesBreakdown';
import { LocationIntel } from '@/components/insights/LocationIntel';
import { AICoach } from '@/components/insights/AICoach';

export default function InsightsScreen() {
  const { user } = useAuth();
  const { logs, loading } = useHuntLogs();
  const insights = useInsights(logs);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Lock size={48} color={Colors.darkTextMuted} />
          <Text style={{ color: Colors.darkText, fontSize: 20, fontWeight: '700', marginTop: 16 }}>
            Sign in to unlock Insights
          </Text>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Log hunts and track your progress over time
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.mallardGreen} />
        </View>
      </SafeAreaView>
    );
  }

  const { tier, seasonPulse, weatherPatterns, speciesBreakdown, locationIntel, timeAnalysis } = insights;

  const aiSummary: InsightsSummary = {
    totalHunts: seasonPulse.totalHunts,
    successRate: seasonPulse.successRate,
    totalHarvest: seasonPulse.totalHarvest,
    topSpecies: seasonPulse.topSpecies,
    favoriteLocation: seasonPulse.favoriteLocation,
    sweetSpot: weatherPatterns.sweetSpot,
    uniqueLocations: seasonPulse.uniqueLocations,
    avgRating: seasonPulse.avgRating,
    shootingEfficiency: timeAnalysis.shootingEfficiency,
    perHunterAvg: timeAnalysis.perHunterAvg,
  };

  if (tier === 'none') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: Colors.darkText, fontSize: 28, fontWeight: '800', marginBottom: 20 }}>
            Insights
          </Text>
          <View style={{
            backgroundColor: Colors.darkCard,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.darkCardBorder,
          }}>
            <BarChart3 size={40} color={Colors.darkTextMuted} />
            <Text style={{ color: Colors.darkText, fontSize: 16, fontWeight: '600', marginTop: 12 }}>
              No data yet
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              Log your first hunt to start seeing insights
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ color: Colors.darkText, fontSize: 28, fontWeight: '800' }}>
          Insights
        </Text>

        <SeasonPulse data={seasonPulse} />

        {(tier === 'growing' || tier === 'full') && (
          <WeatherPatterns data={weatherPatterns} />
        )}

        {tier === 'full' && (
          <>
            <SpeciesBreakdown data={speciesBreakdown} />
            <LocationIntel data={locationIntel} />
            <AICoach summary={aiSummary} logCount={logs.length} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
