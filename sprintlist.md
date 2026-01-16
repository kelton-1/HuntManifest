Sprint Plan (3 Sprints)
Sprint 1 — Security & Data Integrity (Critical Fixes)
Goal: Lock down Firestore and eliminate schema drift risks before further feature work.

Harden Firestore rules with field-level validation

Replace permissive subtree access with explicit collection rules and validation for profile, inventory, huntLogs, huntPlans, plus feedback.

Keep shared collections read-only.

Files: firestore.rules and any redundant rules files under attached_assets.

References: current rules and duplicate draft for comparison.

Consolidate rules into single authoritative source

Remove any rule drafts or duplicates that could drift from firestore.rules.

Reference file: attached_assets/Pasted-rules-version-2-service-cloud-firestore-match-databases_1768536168332.txt.

Audit existing Firestore write paths against the new rules

Ensure shape, required fields, and types match rule constraints.

Write paths: lib/firestore.ts, lib/storage.ts, lib/useUserProfile.ts.

References: Firestore access layer and hooks.

Sprint 2 — Architecture Unification & Drift Removal
Goal: Eliminate split-brain data models and conflicting Firestore access layers.

Choose the canonical domain model

Decide between lib/types.ts (TitleCase enums, current UI) and lib/firebase/models.ts (lowercase enums, unused).

Document decision and remove/merge the unused model.

References: both schema definitions.

Unify Firestore access

Either migrate all callers to lib/firebase/* or remove those modules and keep lib/firestore.ts as the single CRUD layer.

References: active hooks and alternate Firestore modules.

Resolve localStorage key drift and update ADRs

Align ARCHITECTURE.md storage key list with actual usage (timber_inventory_v2, timber_hunt_plans, timber_user_profile).

References: storage hook and profile hook keys + ADR doc.

Sprint 3 — UX Consistency + Deployment Hygiene
Goal: Reduce UX friction, finish architectural alignment, and prevent deploy surprises.

Resolve static export mismatch

Align replit.md claim of static export with next.config.ts and Firebase Hosting configuration.

References: Next config + Firebase hosting + docs.

Remove or wire up orphan onboarding screens

Decide whether to reintroduce GearSetupScreen and AhaMomentScreen into the flow or remove them.

References: Onboarding flow + unused screens.

Replace mock weather data in Conditions

Remove mock hourly forecast or replace with real data source.

Reference: app/conditions/page.tsx.

Assess client-side reverse geocoding

Evaluate moving Nominatim calls server-side or providing a provider-compliant alternative.

References: lib/geolocation.ts.

Notes on Scope & Sequencing
Sprint 1 must precede 2 & 3, because Firestore rules and data integrity affect every write path.

Sprint 2 reduces architectural risk and enables faster, more reliable feature development.

Sprint 3 closes UX and deployment gaps and removes confusing or misleading user experiences.

