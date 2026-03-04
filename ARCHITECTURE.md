# Architecture Decision Records

This document captures important architectural decisions to prevent accidental regressions or duplications.

---

## ADR-001: Single Inventory System

**Date:** 2024-12-05  
**Status:** Decided  
**Context:** The application previously had two separate gear/inventory management systems that caused confusion:

| System | Location | Storage | Issue |
|--------|----------|---------|-------|
| ~~Gear~~ | `/gear`, `/gear/new` | `app/utils/storage.ts` | Removed |
| **Inventory** | `app/(tabs)/inventory/*` | `lib/storage.ts` | **KEEP THIS ONE** |

**Decision:** Use ONLY the inventory system with `lib/storage.ts` and `lib/types.ts`.

**Categories (Authoritative List):**
1. Firearm
2. Ammo
3. Waders
4. Decoy
5. Call
6. Clothing
7. Blind
8. Safety
9. Dog
10. Vehicle
11. Other

**When adding new inventory features:**
- Use `InventoryCategory` from `lib/types.ts`
- Use `useInventory()` hook from `lib/storage.ts`
- Add icons to `CategoryIcon.tsx` using Lucide icons only

---

## ADR-002: Icon System Standards

**Date:** 2024-12-05  
**Status:** Decided  
**Context:** Icons were previously inconsistent - some used Lucide, some used custom SVGs, some used composites.

**Decision:** ALL icons must use [Lucide](https://lucide.dev/icons/) icons via `lucide-react-native`.

**Rules:**
1. ❌ No custom SVG icons
2. ❌ No composite/stacked icons
3. ✅ All icons should respect the passed size/className props for sizing
4. ✅ Document new icons in `CategoryIcon.tsx` component

**Current Icon Mapping:**
| Category | Icon |
|----------|------|
| Firearm | `Crosshair` |
| Ammo | `Disc` |
| Decoy | `Bird` |
| Call | `Megaphone` |
| Clothing | `Shirt` |
| Blind | `Tent` |
| Safety | `LifeBuoy` |
| Dog | `Dog` |
| Vehicle | `Sailboat` |
| Other | `Box` |
| (default) | `Package` |

---

## ADR-003: Client Storage Keys

**Date:** 2024-12-05  
**Status:** Decided  

HuntManifest uses **Firestore-first persistence** with a client-side fallback/cache layer.

- **Native runtime (iOS/Android):** `AsyncStorage`
- **Web compatibility paths (where implemented):** `localStorage`

| Key | Purpose | Primary Location | Runtime Backend |
|-----|---------|------------------|-----------------|
| `timber_inventory_v2` | Gear/inventory items | `lib/storage.ts` | AsyncStorage |
| `timber_hunt_logs` | Hunt log entries | `lib/storage.ts` | AsyncStorage |
| `timber_hunt_plans` | Hunt plan entries | `lib/storage.ts` | AsyncStorage |
| `timber_user_profile` | User preferences (unified) | `lib/useUserProfile.ts` | localStorage (web compatibility path) |
| `timber_onboarding` | Onboarding flow state & checklist | `lib/onboarding.ts` | AsyncStorage |
| `timber_checklist_shown_at` | Getting-started checklist auto-dismiss timestamp | onboarding/checklist UI code | AsyncStorage |
| `timber_weather_cache` | Weather API response cache (5-min TTL) | `lib/weatherApi.ts` | AsyncStorage |
| `talkin_timber_preferences` | Legacy read-only migration source (never written) | `lib/useUserProfile.ts` | localStorage (migration-only) |

**Do NOT create new storage keys without documenting here.**

---

## ADR-004: Adaptive Google Auth Flow (Popup + Redirect)

**Date:** 2026-02-13  
**Status:** Decided  
**Context:** `signInWithPopup()` is unreliable in iOS Safari/WebKit-driven webviews and app-wrapper contexts where popup windows are blocked or not persisted. This caused Google auth to fail on mobile wrappers even when desktop browser auth worked.

**Decision:** Use an adaptive Google sign-in strategy in `lib/auth.tsx`:
- Prefer `signInWithRedirect()` for iOS, webview-like user agents, and standalone/PWA-style contexts.
- Keep `signInWithPopup()` for desktop browsers where popup auth has better UX.
- Complete redirect auth on the login screen before rendering normal idle state so users get clean post-auth routing back to `/profile`.

**Why this is required:** Redirect-based OAuth is the most compatible path for iOS/app-wrapper environments because it does not depend on popup window APIs that are often blocked, sandboxed, or inconsistently implemented.

---

## ADR-005: Mobile Release Workflow via EAS + TestFlight

**Date:** 2026-03-04  
**Status:** Decided  
**Context:** The project now ships as an Expo app and requires a repeatable native release process (build, signing, submission, and tester rollout).

**Decision:** iOS release workflow is standardized as:
1. Build with EAS (`eas build --platform ios --profile production`)
2. Submit with EAS (`eas submit --platform ios --profile production`)
3. Validate in App Store Connect and distribute through TestFlight
4. Promote to production release after QA and product approval

**Implications:**
- Provisioning/signing should be maintained through Apple Developer + EAS credentials management.
- Release checklists should reference TestFlight as the pre-production gate.
- Web static export references are historical and not part of runtime mobile delivery.
