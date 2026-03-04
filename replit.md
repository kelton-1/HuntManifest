# HuntManifest

A mobile-first waterfowl hunting management app built with Next.js and Firebase.

## Tech Stack

- **Framework:** Next.js 16 (App Router, `output: 'export'` for static hosting)
- **UI:** React 19, Tailwind CSS 3.x, Framer Motion, Lucide React
- **Backend:** Firebase Auth + Firestore (hosted externally, config in `lib/firebase.ts`)
- **AI:** Firebase AI Logic (Gemini 2.5 Flash Lite) — `lib/gemini.ts`
- **Weather:** Open-Meteo API (free, no key) — `lib/weatherApi.ts`
- **Location:** Google Places API via `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `lib/` — Shared utilities, hooks, Firebase config, types
- `public/` — Static assets (icons, manifest)

## Development

- **Dev server:** `npm run dev` (runs on `0.0.0.0:5000`)
- **Build:** `npm run build` (static export to `out/`)
- **Lint:** `npm run lint`

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `out/`

## Key Conventions

- All types in `lib/types.ts`
- All icons use Lucide React only
- localStorage keys use `timber_` prefix (see ARCHITECTURE.md ADR-003)
- Firestore data access goes through `lib/firestore.ts`
- No API routes or SSR (static export constraint)
