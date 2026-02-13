# HuntManifest

A mobile-first hunting management app built with Next.js, Firebase, and AI. Track your gear inventory, plan hunts with weather-aware context, log completed hunts, and get AI-powered insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, static export) |
| UI | React 19, Tailwind CSS, Framer Motion |
| Backend | Firebase Auth + Firestore |
| AI | Firebase AI Logic (Gemini 2.5 Flash Lite) |
| Icons | Lucide React |
| Hosting | Firebase Hosting |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx next dev -p 3000

# Build for production (static export → out/)
npm run build

# Deploy to Firebase Hosting
npm run deploy
```

> **Note:** The default port in `package.json` is 5000, which conflicts with macOS AirPlay. Use port 3000 instead.

## Project Structure

```
app/                  # Next.js App Router pages & components
├── inventory/        # Gear inventory management
├── plan/             # Hunt planning
├── log/              # Hunt log / journal
├── insights/         # Analytics
├── profile/          # User settings
├── login/            # Authentication
└── components/       # Shared UI components

lib/                  # Core business logic
├── types.ts          # TypeScript types & enums
├── storage.ts        # Data hooks (Firestore + localStorage fallback)
├── firestore.ts      # Firestore CRUD layer
├── auth.tsx          # Auth context
├── weatherApi.ts     # Open-Meteo weather integration
├── gemini.ts         # AI features (Gemini)
└── ...               # Geolocation, brands, formatting, etc.

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
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places location autocomplete |

## AI Agent Documentation

This project includes instructions for multiple AI coding platforms:

- **`CLAUDE.md`** — Claude Code project context
- **`AGENTS.md`** — OpenAI Codex project context
- **`.agent/workflows/dev.md`** — Antigravity dev workflow

All three files share the same core information about the project's conventions, architecture, and development workflow.


## Static Export Route Strategy

Because this app uses `output: 'export'`, detail screens avoid dynamic path segments (e.g. `/log/[id]`) and instead use static pages with query parameters:

- `/inventory/item?id=<inventoryId>`
- `/plan/detail?id=<planId>`
- `/log/detail?id=<logId>`

This keeps routes static-export-friendly while still supporting record-specific detail views on the client.

## Architecture Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for documented ADRs covering:
- ADR-001: Single inventory system
- ADR-002: Icon system (Lucide only)
- ADR-003: localStorage key registry
