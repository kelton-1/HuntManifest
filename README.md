# HuntManifest

A mobile-first hunting management app built with Expo, Firebase, and AI. Track your gear inventory, plan hunts with weather-aware context, log completed hunts, and get AI-powered insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + Expo Router |
| UI | React Native, React Native Web, NativeWind |
| Backend | Firebase Auth + Firestore |
| AI | Firebase AI Logic (Gemini 2.5 Flash Lite) |
| Icons | Lucide React Native |
| Mobile Delivery | EAS Build + EAS Submit |

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server (web)
npm run dev

# Start Expo dev server for native targets
npm run ios
npm run android

# Export web bundle (if needed)
npm run build

# Build and submit mobile binaries with EAS
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

> **Note:** `npm run dev` starts Expo Web on port `5000` by default. Override with `npx expo start --web --port <port>` if needed.

## Project Structure

```
app/                    # Expo Router routes
├── _layout.tsx         # Root providers + stack wiring
├── login.tsx           # Authentication screen
├── profile.tsx         # Profile/settings screen
└── (tabs)/             # Bottom tab shell
    ├── _layout.tsx     # Tab navigator configuration
    ├── index.tsx       # Home dashboard
    ├── inventory/      # Gear inventory routes (index/add/[id])
    ├── plan/           # Hunt planning routes (index/new/[id])
    ├── log/            # Hunt log routes (index/new/[id])
    └── insights/       # Analytics routes

components/             # Shared React Native components
lib/                    # Core business logic
├── types.ts            # TypeScript types & enums
├── storage.ts          # Data hooks (Firestore + AsyncStorage fallback)
├── firestore.ts        # Firestore CRUD layer
├── auth.tsx            # Auth context
├── weatherApi.ts       # Open-Meteo weather integration
├── gemini.ts           # AI features (Gemini)
└── ...                 # Geolocation, brands, formatting, etc.

Tasks/                # Product planning documents
ARCHITECTURE.md       # Architecture Decision Records
sprintlist.md         # Sprint plan & progress
```

## Firebase Collections

```
users/{uid}/profile/data     — User profile
users/{uid}/inventory/{id}   — Gear items
users/{uid}/huntLogs/{id}    — Hunt logs
users/{uid}/huntPlans/{id}   — Hunt plans
feedback/{id}                — User feedback
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places location autocomplete |

## Mobile Release Workflow (iOS)

1. Ensure Apple Developer provisioning is configured for the EAS project.
2. Build a production iOS binary:

   ```bash
   npx eas build --platform ios --profile production
   ```

3. Submit the build to App Store Connect/TestFlight:

   ```bash
   npx eas submit --platform ios --profile production
   ```

4. In App Store Connect, assign the build to internal/external TestFlight testers.
5. Promote to App Store release after QA sign-off.

For Android, use the equivalent EAS build/submit commands with `--platform android`.

## Historical Web Archive (Non-Runtime)

Some repository docs and notes still mention the previous Next.js/Firebase Hosting implementation. Treat those references as historical migration context only—they are not part of the active Expo runtime architecture.

## AI Agent Documentation

This project includes instructions for multiple AI coding platforms:

- **`CLAUDE.md`** — Claude Code project context
- **`AGENTS.md`** — OpenAI Codex project context
- **`.agent/workflows/dev.md`** — Antigravity dev workflow

All three files share the same core information about the project's conventions, architecture, and development workflow.

## Architecture Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for documented ADRs covering:
- ADR-001: Single inventory system
- ADR-002: Icon system (Lucide only)
- ADR-003: client storage key registry (AsyncStorage + web localStorage compatibility)
