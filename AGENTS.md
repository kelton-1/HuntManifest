# HuntManifest — AI Agent Instructions

## Product Overview

HuntManifest is a mobile-first hunting management app. Users track gear inventory, plan hunts, log completed hunts with weather/harvest data, and get AI-powered insights (via Firebase AI / Gemini).

**Version:** 0.2.0  
**Status:** MVP with Firebase auth + Firestore persistence

## Tech Stack

- **Framework:** Expo SDK 54 + Expo Router
- **UI:** React Native, React Native Web, NativeWind, Framer Motion (where applicable)
- **Backend:** Firebase Auth + Firestore
- **AI:** Firebase AI Logic (Gemini 2.5 Flash Lite)
- **Icons:** Lucide React Native (no custom SVGs)

## Project Structure

```
app/                     # Expo Router routes
├── _layout.tsx          # Root layout with auth/theme providers
├── login.tsx            # Auth screen
├── profile.tsx          # User profile + settings
└── (tabs)/              # Bottom tab route group
    ├── _layout.tsx      # Tab navigator definition
    ├── index.tsx        # Home dashboard (weather, stats, hunt carousel)
    ├── inventory/       # Gear inventory CRUD routes
    ├── log/             # Hunt log CRUD routes
    ├── plan/            # Hunt plan CRUD routes
    └── insights/        # Analytics (stub)

components/              # Shared components
lib/                     # Core business logic
├── types.ts             # All TypeScript types & enums
├── storage.ts           # React hooks (useInventory, useHuntLogs, useHuntPlans)
├── firestore.ts         # Firestore CRUD functions
├── firebase.ts          # Firebase app init + RN auth persistence
├── auth.tsx             # Auth context provider
├── useUserProfile.ts    # Profile hook (Firestore + web localStorage compatibility path)
├── weatherApi.ts        # Open-Meteo weather API
├── geolocation.ts       # Geolocation + reverse geocoding
├── gemini.ts            # Firebase AI (Gemini) integration
├── onboarding.ts        # Onboarding state machine
├── brands.ts            # Brand/model data by category
├── inventory-data.ts    # Master inventory seed data
├── formatting.ts        # Unit formatting (temp, wind)
├── haptics.ts           # Haptics feedback
├── motion.ts            # Motion presets
├── schemas/categoryAttributes.ts  # Per-category attribute schemas
└── services/ProductIntelligenceEngine.ts  # Smart product detection
```

## Key Conventions

### 1. Inventory Categories (11 total)
`Firearm | Ammo | Waders | Decoy | Call | Clothing | Blind | Safety | Dog | Vehicle | Other`

### 2. Storage Pattern
All hooks use **Firestore-first with client storage fallback/cache**.
- Primary native client storage: **AsyncStorage**
- Web compatibility paths may use **localStorage** where implemented.

Core hooks:
- `useInventory()` — gear items
- `useHuntLogs()` — completed hunts
- `useHuntPlans()` — planned hunts
- `useUserProfile()` — user preferences

### 3. Client Storage Keys (documented in ARCHITECTURE.md ADR-003)
| Key | Purpose |
|-----|---------|
| `timber_inventory_v2` | Gear items |
| `timber_hunt_logs` | Hunt logs |
| `timber_hunt_plans` | Hunt plans |
| `timber_user_profile` | User profile |
| `timber_onboarding` | Onboarding state |
| `timber_checklist_shown_at` | Checklist timestamp |
| `timber_weather_cache` | Weather cache (5-min TTL) |

### 4. Icons
ALL icons use **Lucide**. No custom SVGs. See `CategoryIcon.tsx` for the mapping.

### 5. Firestore Collections
```
users/{uid}/profile/data     — User profile document
users/{uid}/inventory/{id}   — Inventory items
users/{uid}/huntLogs/{id}    — Hunt log entries
users/{uid}/huntPlans/{id}   — Hunt plan entries
feedback/{id}                — User feedback (authenticated)
```

## Development Commands

```bash
npm run dev          # Expo dev server (web)
npm run ios          # Expo iOS simulator target
npm run android      # Expo Android emulator/device target
npm run build        # Expo web export
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

## Active Sprint Status

See `sprintlist.md` for the full 3-sprint plan. Summary:
- **Sprint 1** (Security): Firestore rules hardening — in progress
- **Sprint 2** (Architecture): Unify data models, resolve `lib/firebase` vs `lib/firestore` — not started
- **Sprint 3** (UX + Release): Polish + mobile release hygiene — partially done

## Important Notes

- Runtime app architecture is Expo Router mobile-first.
- Any Next.js/Firebase Hosting references in repo docs should be treated as historical archive context only.
- Do NOT create new storage keys without adding them to `ARCHITECTURE.md` ADR-003.
- Do NOT use custom SVG icons — use Lucide only.
- The `Tasks/` folder contains product planning docs (not executable tasks).
- Environment variable: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` for location autocomplete.
