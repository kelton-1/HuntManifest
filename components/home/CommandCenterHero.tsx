import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, ArrowRight, User } from 'lucide-react-native';
import { WeatherConditions, HuntLog, HuntPlan } from '@/lib/types';
import { getHuntingSuitability } from '@/lib/huntingSuitability';
import { Colors } from '@/constants/Colors';

interface CommandCenterHeroProps {
  weather?: WeatherConditions | null;
  logs: HuntLog[];
  plans: HuntPlan[];
  hunterName: string;
}

type HeroContent = {
  mode: 'upcoming' | 'favorable' | 'default';
  greeting: string;
  name: string;
  subtitle: string;
  cta?: { label: string; href: string };
  planTitle?: string;
  planLocation?: string;
  daysAway?: number;
};

function getHeroContent(
  hunterName: string,
  totalHunts: number,
  plans: HuntPlan[],
  weather: WeatherConditions | null | undefined,
): HeroContent {
  const name = hunterName || 'Hunter';

  const now = Date.now();
  const in48h = now + 48 * 60 * 60 * 1000;
  const upcomingPlan = plans
    .filter(
      (p) =>
        p.status === 'ACTIVE' &&
        new Date(p.date).getTime() <= in48h &&
        new Date(p.date).getTime() >= now,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (upcomingPlan) {
    const daysAway = Math.ceil(
      (new Date(upcomingPlan.date).getTime() - now) / (1000 * 60 * 60 * 24),
    );
    return {
      mode: 'upcoming',
      greeting: 'Upcoming Hunt',
      name,
      subtitle:
        daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`,
      cta: { label: 'View Plan', href: `/(tabs)/plan/${upcomingPlan.id}` },
      planTitle: upcomingPlan.title,
      planLocation: upcomingPlan.location?.name,
      daysAway,
    };
  }

  if (weather) {
    const suitability = getHuntingSuitability(weather);
    if (suitability.level === 'GOOD') {
      return {
        mode: 'favorable',
        greeting: 'Good conditions today',
        name,
        subtitle: 'Conditions look good for hunting',
        cta: { label: 'Plan a Hunt', href: '/(tabs)/plan/new' },
      };
    }
  }

  const huntText =
    totalHunts === 1 ? '1 hunt recorded' : `${totalHunts} hunts recorded`;
  return {
    mode: 'default',
    greeting: 'Welcome back',
    name,
    subtitle: totalHunts > 0 ? `Season: ${huntText}` : 'Ready when you are',
  };
}

export function CommandCenterHero({
  weather,
  logs,
  plans,
  hunterName,
}: CommandCenterHeroProps) {
  const router = useRouter();
  const totalHunts = logs.length;
  const hero = getHeroContent(hunterName, totalHunts, plans, weather);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{hero.greeting}</Text>
          <Text style={styles.name}>{hero.name}</Text>
          <Text style={styles.subtitle}>{hero.subtitle}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          style={styles.profileButton}
        >
          <User size={20} color={Colors.darkTextMuted} />
        </Pressable>
      </View>

      {hero.mode === 'upcoming' && hero.cta && (
        <View style={styles.upcomingCard}>
          <View style={styles.upcomingLeft}>
            <View style={styles.calendarIcon}>
              <Calendar size={20} color={Colors.mallardYellow} />
            </View>
            <View>
              <Text style={styles.planTitle}>{hero.planTitle}</Text>
              {hero.planLocation && (
                <View style={styles.locationRow}>
                  <MapPin size={12} color={Colors.darkTextMuted} />
                  <Text style={styles.locationText}>{hero.planLocation}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={() => router.push(hero.cta!.href as any)}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>{hero.cta.label}</Text>
            <ArrowRight size={14} color={Colors.mallardYellow} />
          </Pressable>
        </View>
      )}

      {hero.mode === 'favorable' && hero.cta && (
        <View style={styles.favorableRow}>
          <Pressable
            onPress={() => router.push(hero.cta!.href as any)}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>{hero.cta.label}</Text>
            <ArrowRight size={14} color={Colors.mallardYellow} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.darkTextMuted,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkText,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.mallardYellow,
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 38, 51, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calendarIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 184, 0, 0.1)',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.darkTextMuted,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 184, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mallardYellow,
  },
  favorableRow: {
    marginTop: 16,
  },
});
