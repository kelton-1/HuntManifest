# Page Dependency Trees

Complete import traces for key pages. Every file in a page's tree MUST be passed as `--context-file` when designing that page, plus `app/globals.css`, `tailwind.config.js`, and `.superdesign/design-system.md`.

---

## / (Home Dashboard)
Entry: `app/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
    - lib/firebase.ts
  - lib/firestore.ts
    - lib/firebase.ts
- lib/weatherApi.ts
  - lib/types.ts
- lib/geolocation.ts
- lib/types.ts
- lib/useUserProfile.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/formatting.ts
- app/components/home/AtmosphericCard.tsx
  - lib/types.ts
  - lib/huntingSuitability.ts
    - lib/types.ts
  - app/components/home/WindRose.tsx
- app/components/home/HuntMemoryCarousel.tsx
  - lib/types.ts
- app/components/home/CommandCenterHero.tsx
  - lib/types.ts
  - lib/huntingSuitability.ts
  - lib/useUserProfile.ts
- app/components/home/WeatherForecastWidget.tsx
  - lib/motion.ts
- app/components/home/QuickActions.tsx
  - lib/haptics.ts
  - lib/motion.ts
  - lib/types.ts

**Global layout files (always include):**
- app/layout.tsx
- app/components/TopNav.tsx
- app/components/BottomNav.tsx
- app/components/AppWrapper.tsx

---

## /inventory (Inventory List)
Entry: `app/inventory/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- app/components/CategoryIcon.tsx
  - lib/types.ts
- app/components/StaggerAnimation.tsx

---

## /inventory/add (Add Gear)
Entry: `app/inventory/add/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- lib/brands.ts
- lib/schemas/categoryAttributes.ts
- app/components/CategoryIcon.tsx
  - lib/types.ts

---

## /inventory/[id] (Gear Detail/Edit)
Entry: `app/inventory/[id]/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- lib/brands.ts
- lib/schemas/categoryAttributes.ts
- app/components/CategoryIcon.tsx

---

## /log (Hunt Log List)
Entry: `app/log/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/useUserProfile.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/formatting.ts
- app/components/StaggerAnimation.tsx
- app/components/log/SpeciesIcon.tsx

---

## /log/new (New Hunt Log)
Entry: `app/log/new/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- lib/weatherApi.ts
- lib/geolocation.ts
- lib/useUserProfile.ts
- lib/formatting.ts
- app/components/LocationAutocomplete.tsx
  - lib/geolocation.ts
- app/components/MapPickerModal.tsx
  - lib/geolocation.ts
- app/components/log/HarvestEntry.tsx
- app/components/log/SpeciesIcon.tsx
- app/components/CategoryIcon.tsx

---

## /plan (Hunt Plans List)
Entry: `app/plan/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts

---

## /plan/new (New Plan Wizard)
Entry: `app/plan/new/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- lib/weatherApi.ts
- lib/geolocation.ts
- app/components/LocationAutocomplete.tsx
- app/components/MapPickerModal.tsx
- app/components/CategoryIcon.tsx

---

## /profile (User Profile)
Entry: `app/profile/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/auth.tsx
  - lib/firebase.ts
- lib/useUserProfile.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/firestore.ts
  - lib/firebase.ts
- lib/useCountUp.ts

---

## /login (Auth Screen)
Entry: `app/login/page.tsx`
Dependencies:
- lib/auth.tsx
  - lib/firebase.ts

---

## /insights (Analytics Dashboard)
Entry: `app/insights/page.tsx`
Dependencies:
- lib/storage.ts
  - lib/types.ts
  - lib/auth.tsx
  - lib/firestore.ts
- lib/types.ts
- lib/gemini.ts
