# HuntManifest

A mobile-first waterfowl hunting management app built with React Native/Expo and Firebase.

## Tech Stack

- **Framework:** React Native 0.76.9 with Expo SDK 52, Expo Router (file-based routing)
- **UI:** NativeWind (Tailwind for RN), Lucide React Native, react-native-svg, react-native-reanimated
- **Backend:** Firebase Auth (email/password) + Firestore (config in `lib/firebase.ts`)
- **AI:** Firebase AI Logic (Gemini 2.5 Flash Lite) — `lib/gemini.ts`
- **Weather:** Open-Meteo API (free, no key) — `lib/weatherApi.ts`
- **Storage:** AsyncStorage for local persistence, Firestore for authenticated users

## Project Structure

- `app/` — Expo Router screens and layouts
  - `app/_layout.tsx` — Root layout with AuthProvider
  - `app/(tabs)/_layout.tsx` — Bottom tab navigation (Home, Insights, FAB, Journal, Gear)
  - `app/(tabs)/index.tsx` — Home dashboard
  - `app/(tabs)/insights/` — Insights with AI Coach
  - `app/(tabs)/log/` — Hunt journal (list, new, detail)
  - `app/(tabs)/inventory/` — Gear management (list, add, detail)
  - `app/(tabs)/plan/` — Hunt plans (list, new, detail)
  - `app/login.tsx` — Email/password authentication
  - `app/profile.tsx` — Profile, stats, data management
- `components/` — Shared React Native components
  - `components/home/` — AtmosphericCard, CommandCenterHero, HuntMemoryCarousel, QuickActions, SeasonGoalsRing, WeatherForecastWidget, WindRose
  - `components/insights/` — AICoach, LocationIntel, SeasonPulse, SpeciesBreakdown, WeatherPatterns
  - `components/log/` — HarvestEntry, PillSelector, QuickTags, SpeciesTapGrid, StarRating
  - `components/InsightCard.tsx` — Reusable insight section wrapper
  - `components/GlowCard.tsx` — Card with shadow glow effect
  - `components/CategoryIcon.tsx` — Category-to-icon mapper
- `lib/` — Shared utilities, hooks, Firebase config, types
- `constants/Colors.ts` — Dark theme color palette (mallard green/yellow)
- `web-archive/` — Original Next.js web app (reference only)

## Development

- **Dev server:** `npx expo start --web --port 5000`
- **Workflow:** "Start application" configured for Expo dev server

## Key Conventions

- All types in `lib/types.ts`
- All icons use lucide-react-native
- AsyncStorage keys use `timber_` prefix
- Firestore data access goes through `lib/firestore.ts`
- Color constants defined in `constants/Colors.ts`
- Components use StyleSheet.create() for styling
- Auth persistence via AsyncStorage (no web localStorage)
- Bundle identifier: `com.huntmanifest.app`
