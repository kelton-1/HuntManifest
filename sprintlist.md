Sprint Plan (3 Sprints)

Sprint 1 — Security & Data Integrity (Critical Fixes)
Goal: Lock down Firestore and eliminate schema drift risks before further feature work.

Harden Firestore rules with field-level validation

Replace permissive subtree access with explicit collection rules and validation for profile, inventory, huntLogs, huntPlans, plus feedback.

Keep shared collections read-only.

Files: `firestore.rules` and any redundant rules files under attached assets/docs.

Consolidate rules into single authoritative source

Remove any rule drafts or duplicates that could drift from `firestore.rules`.

Audit existing Firestore write paths against the new rules

Ensure shape, required fields, and types match rule constraints.

Write paths: `lib/firestore.ts`, `lib/storage.ts`, `lib/useUserProfile.ts`.

Sprint 2 — Architecture Unification & Drift Removal
Goal: Eliminate split-brain data models and conflicting Firestore access layers.

Choose the canonical domain model

Decide between `lib/types.ts` (TitleCase enums, current UI) and `lib/firebase/models.ts` (lowercase enums, potentially legacy).

Document decision and remove/merge the unused model.

Unify Firestore access

Either migrate all callers to `lib/firebase/*` or remove those modules and keep `lib/firestore.ts` as the single CRUD layer.

~~Resolve client storage key drift and update ADRs~~ DONE

Storage key registry is now maintained in ADR-003 for AsyncStorage-first client persistence, with explicit web localStorage compatibility notes where still applicable.

Sprint 3 — UX Consistency + Mobile Release Hygiene
Goal: Reduce UX friction, finish architectural alignment, and prevent mobile release surprises.

~~Resolve static export mismatch~~ HISTORICAL/NON-RUNTIME

Next.js/Firebase Hosting static-export concerns are retained only as archive context and are no longer part of active Expo runtime delivery.

~~Remove or wire up orphan onboarding screens~~ DONE

Onboarding flow has five active steps and removed orphan screens remain excluded.

~~Replace mock weather data in conditions flows~~ DONE

Hourly forecast uses the real Open-Meteo API via `fetchHourlyForecast` in `lib/weatherApi.ts`.

Assess client-side reverse geocoding

Evaluate moving Nominatim calls server-side or providing a provider-compliant alternative.

References: `lib/geolocation.ts`.

Add release pipeline hardening tasks

- Verify EAS production profile defaults and credential ownership.
- Document App Store Connect/TestFlight handoff checklist.
- Add regression checks before `eas submit`.

Notes on Scope & Sequencing

Sprint 1 must precede 2 & 3, because Firestore rules and data integrity affect every write path.

Sprint 2 reduces architectural risk and enables faster, more reliable feature development.

Sprint 3 closes UX and release gaps and removes confusing historical deployment assumptions.
