---
description: How to run, build, and deploy HuntManifest
---

## Run Development Server

// turbo
1. Install dependencies (if needed):
```bash
npm install
```

// turbo
2. Start the dev server:
```bash
npx next dev -p 3000
```

3. Open http://localhost:3000 in your browser. The app should load with an auth screen.

> **Note:** Port 5000 is the default in package.json but conflicts with macOS AirPlay Receiver. Use port 3000 instead.

## Build for Production

// turbo
4. Build the static export:
```bash
npm run build
```

The output goes to `out/`. This is a static export (`output: 'export'` in `next.config.ts`).

## Deploy to Firebase Hosting

5. Deploy (requires Firebase CLI and authentication):
```bash
npm run deploy
```

This runs `npm run build && firebase deploy --only hosting`.

## Lint

// turbo
6. Run ESLint:
```bash
npm run lint
```

## Key Conventions

- **Types:** All types live in `lib/types.ts`
- **Storage:** Use hooks from `lib/storage.ts` (Firestore-first, localStorage fallback)
- **Icons:** Use Lucide React only — no custom SVGs
- **New localStorage keys:** Document in `ARCHITECTURE.md` ADR-003
- **Categories:** 11 inventory categories — see `InventoryCategory` in `lib/types.ts`
