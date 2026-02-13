# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Overview

HuntManifest is a mobile-first waterfowl hunting management app. Users track gear inventory, plan hunts, log completed hunts with weather/harvest data, and get AI-powered insights.

**Version:** 0.2.0 | **Status:** MVP with Firebase auth + Firestore persistence

## Tech Stack

- **Framework:** Next.js 16 (App Router, `output: 'export'` for static hosting)
- **UI:** React 19, Tailwind CSS 3.x, Framer Motion, Lucide React (no custom SVGs)
- **Backend:** Firebase Auth + Firestore
- **AI:** Firebase AI Logic (Gemini 2.5 Flash Lite) — see `lib/gemini.ts`
- **Weather:** Open-Meteo API (free, no key) — see `lib/weatherApi.ts`
- **Location:** Google Places API via `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

## Development Commands

```bash
npm run dev -- -p 3000   # Dev server (default port 5000 conflicts with macOS AirPlay)
npm run build            # Static export to out/
npm run lint             # ESLint
npm run deploy           # Build + Firebase hosting deploy
```

No test runner is configured. The project has no test suite.

## Architecture

### Data Flow

All data hooks in `lib/storage.ts` use **Firestore-first with localStorage fallback** for unauthenticated users:
- `useInventory()` — gear items
- `useHuntLogs()` — completed hunts
- `useHuntPlans()` — planned hunts
- `useUserProfile()` (in `lib/useUserProfile.ts`) — user preferences

CRUD operations go through `lib/firestore.ts`. Do not create alternate Firestore access paths.

### Firestore Collections

```
users/{uid}/profile/data     — User profile document
users/{uid}/inventory/{id}   — Inventory items
users/{uid}/huntLogs/{id}    — Hunt log entries
users/{uid}/huntPlans/{id}   — Hunt plan entries
feedback/{id}                — User feedback (authenticated)
```

### Authentication (ADR-004)

Adaptive Google sign-in in `lib/auth.tsx`:
- `signInWithRedirect()` for iOS/webview/PWA contexts (more compatible)
- `signInWithPopup()` for desktop browsers (better UX)
- Also supports email/password auth
- Redirect completion handled on login page before routing

### Theming & Design

- Dark mode via `next-themes` with `class` strategy
- **Mallard palette:** green `#0B3D2E`, yellow `#F5B800` (defined in `tailwind.config.js`)
- Dark background: `#0B0E14`

### Motion Presets (`lib/motion.ts`)

- `snappy` (400 stiffness) — buttons, counters
- `smooth` (300 stiffness) — card entries
- `gentle` (200 stiffness) — backgrounds
- `staggerContainer` + `staggerChild` — section reveals

## Key Conventions

### Inventory Categories (11 total)
`Firearm | Ammo | Waders | Decoy | Call | Clothing | Blind | Safety | Dog | Vehicle | Other`

Use `InventoryCategory` enum from `lib/types.ts`. All types and enums live in that file.

### Icons
ALL icons use **Lucide React**. No custom SVGs, no composite icons. See `CategoryIcon.tsx` for the category-to-icon mapping. New icons must be documented there.

### localStorage Keys (ADR-003)

All keys use `timber_` prefix. **Do not create new keys without adding them to `ARCHITECTURE.md` ADR-003.**

| Key | Purpose |
|-----|---------|
| `timber_inventory_v2` | Gear items |
| `timber_hunt_logs` | Hunt logs |
| `timber_hunt_plans` | Hunt plans |
| `timber_user_profile` | User profile |
| `timber_onboarding` | Onboarding state |
| `timber_checklist_shown_at` | Checklist timestamp |
| `timber_weather_cache` | Weather cache (5-min TTL) |

### Haptic Feedback

`lib/haptics.ts` provides `hapticLight()`, `hapticMedium()`, `hapticHeavy()` for mobile vibration on interactions.

## Sprint Status

See `sprintlist.md` for full details. Current state:
- **Sprint 1** (Security): Firestore rules hardening — in progress
- **Sprint 2** (Architecture): Unify data models (`lib/types.ts` vs unused `lib/firebase/models.ts`), consolidate Firestore access — not started
- **Sprint 3** (UX): Mostly done (static export verified, orphan screens removed, real weather data wired up). Remaining: evaluate reverse geocoding approach.

## Important Reminders

- Static export: `output: 'export'` in `next.config.ts` — no server-side features (no API routes, no SSR)
- The `Tasks/` folder contains product planning docs, not executable tasks
- `ARCHITECTURE.md` contains 4 ADRs that must be consulted before changing inventory, icons, storage keys, or auth
- Sprint 1 (Firestore rules) must be completed before Sprint 2 work begins
