# HuntManifest — AI Agent Instructions

## Product Overview

HuntManifest is a mobile-first hunting management app. Users track gear inventory, plan hunts, log completed hunts with weather/harvest data, and get AI-powered insights (via Firebase AI / Gemini).

**Version:** 0.2.0  
**Status:** MVP with Firebase auth + Firestore persistence

## Tech Stack

- **Framework:** Next.js 16.0.7 (App Router, static export)
- **UI:** React 19.2.0, Tailwind CSS 3.x, Framer Motion
- **Backend:** Firebase Auth + Firestore
- **AI:** Firebase AI Logic (Gemini 2.5 Flash Lite)
- **Icons:** Lucide React (no custom SVGs)

## Project Structure

```
app/                     # Next.js App Router
├── page.tsx             # Home dashboard (weather, stats, hunt carousel)
├── layout.tsx           # Root layout with auth/theme providers
├── globals.css          # Tailwind + custom CSS
├── inventory/           # Gear inventory CRUD
├── log/                 # Hunt log CRUD
├── plan/                # Hunt plan CRUD
├── insights/            # Analytics (stub)
├── profile/             # User profile + settings
├── login/               # Auth screen
└── components/          # Shared components
    ├── BottomNav.tsx     # 4-tab bottom navigation
    ├── TopNav.tsx        # Top bar with profile link
    ├── CategoryIcon.tsx  # Lucide icon mapper for categories
    ├── LocationAutocomplete.tsx
    ├── home/             # Dashboard widgets
    ├── inventory/        # Inventory-specific components
    ├── log/              # Hunt log components
    └── onboarding/       # Onboarding flow (5 steps)

lib/                     # Core business logic
├── types.ts             # All TypeScript types & enums
├── storage.ts           # React hooks (useInventory, useHuntLogs, useHuntPlans)
├── firestore.ts         # Firestore CRUD functions
├── firebase.ts          # Firebase app init
├── auth.tsx             # Auth context provider
├── useUserProfile.ts    # Profile hook (Firestore + localStorage fallback)
├── weatherApi.ts        # Open-Meteo weather API
├── geolocation.ts       # Browser geolocation + reverse geocoding
├── gemini.ts            # Firebase AI (Gemini) integration
├── onboarding.ts        # Onboarding state machine
├── brands.ts            # Brand/model data by category
├── inventory-data.ts    # Master inventory seed data
├── formatting.ts        # Unit formatting (temp, wind)
├── haptics.ts           # Vibration feedback
├── motion.ts            # Framer Motion presets
├── schemas/categoryAttributes.ts  # Per-category attribute schemas
└── services/ProductIntelligenceEngine.ts  # Smart product detection
```

## Key Conventions

### 1. Inventory Categories (11 total)
`Firearm | Ammo | Waders | Decoy | Call | Clothing | Blind | Safety | Dog | Vehicle | Other`

### 2. Storage Pattern
All hooks use **Firestore-first with localStorage fallback** for logged-out users.
- `useInventory()` — gear items
- `useHuntLogs()` — completed hunts
- `useHuntPlans()` — planned hunts
- `useUserProfile()` — user preferences

### 3. localStorage Keys (documented in ARCHITECTURE.md ADR-003)
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
ALL icons use **Lucide React**. No custom SVGs. See `CategoryIcon.tsx` for the mapping.

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
npm run dev          # Dev server (default: 0.0.0.0:5000, use -p 3000 if port conflict)
npm run build        # Static export to out/
npm run deploy       # Build + Firebase hosting deploy
npm run lint         # ESLint
```

## Active Sprint Status

See `sprintlist.md` for the full 3-sprint plan. Summary:
- **Sprint 1** (Security): Firestore rules hardening — in progress
- **Sprint 2** (Architecture): Unify data models, resolve lib/firebase vs lib/firestore — not started
- **Sprint 3** (UX): Polish + deployment hygiene — partially done

## Important Notes

- The app uses `output: 'export'` for static hosting on Firebase
- Do NOT create new localStorage keys without adding them to `ARCHITECTURE.md` ADR-003
- Do NOT use custom SVG icons — use Lucide only
- The `Tasks/` folder contains product planning docs (not executable tasks)
- Environment variable: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` for location autocomplete
