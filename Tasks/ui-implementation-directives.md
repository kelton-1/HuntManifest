# UI Implementation Directives

This document provides concrete implementation instructions for the HuntManifest UI redesign. It covers three priority areas: navigation restructure, home dashboard overhaul, and hunt planning flow. Each section specifies which files to modify, what to add, and how new components should behave.

Read `CLAUDE.md` and `ARCHITECTURE.md` before starting any work. All conventions documented there (Lucide-only icons, `timber_` localStorage prefix, Firestore-first storage, static export constraints) remain in effect.

---

## Phase 1: Navigation Restructure

### Goal
Replace the current 2-item bottom nav (Home + Insights) with a 4-tab dock + center FAB. The current FAB speed-dial stays but the surrounding nav items change.

### Current State
- `app/components/BottomNav.tsx` has: Home (left), FAB center (+), Insights (right)
- FAB already opens a speed-dial with: Log Hunt → `/log/new`, Add Gear → `/inventory/add`, Plan Hunt → `/plan/new`
- `app/components/TopNav.tsx` has: logo (left), theme toggle + profile icon (right)
- Profile is accessed only from TopNav icon
- Layout in `app/layout.tsx`: TopNav at top, BottomNav at bottom, content in between

### Changes Required

#### `app/components/BottomNav.tsx`
Replace `navItems` and `rightItems` arrays with four tabs plus the existing center FAB:

```
Left side:  Home (Home icon, href="/")  |  Journal (NotebookPen icon, href="/log")
Center:     FAB (+) — keep existing speed-dial behavior unchanged
Right side: Gear (Package icon, href="/inventory")  |  Profile (User icon, href="/profile")
```

Implementation details:
- Move profile out of TopNav and into the bottom nav as the rightmost tab
- Use the same `isActive` matching logic already in place. Journal should use `pathname.startsWith("/log")`. Gear should use `pathname.startsWith("/inventory")`
- Keep the existing `layoutId="navActiveBackground"` animated indicator for the active tab
- Keep the existing `glass-nav` class, rounded-2xl shape, and floating position
- The FAB speed-dial actions, animation variants (`staggerContainer`, `staggerChild`), overlay, and click-outside dismiss logic should remain exactly as-is
- All haptic calls (`hapticLight` on tab tap, `hapticMedium` on FAB toggle) remain

#### `app/components/TopNav.tsx`
- Remove the profile `<Link>` and its `User` icon — profile moves to bottom nav
- Keep the logo, brand name, subtitle, theme toggle, and scroll-hide behavior
- The TopNav becomes: logo + brand (left), theme toggle only (right)

#### `app/layout.tsx`
- No structural changes needed. TopNav and BottomNav render in the same positions
- Verify `pb-24` on `<main>` still provides enough clearance for the 4-tab dock

### Behavior Spec
- Active tab: `text-primary` with the animated background pill (existing pattern)
- Inactive tab: `text-muted-foreground` with `hover:text-foreground`
- Tab label: 10px font, `font-semibold tracking-wide` (matches current)
- FAB: remains `bg-primary text-primary-foreground`, 56px (h-14 w-14), elevated -20px above dock
- Speed-dial dismiss: on route change, on click outside, on overlay tap (all existing)

---

## Phase 2: Home Dashboard Overhaul

### Goal
Rebuild the home screen as an adaptive command center that surfaces the most important context first, uses color-coded conditions, and frames stats as progress instead of outcomes.

### Current State
- `app/page.tsx` renders: CommandCenterHero → AtmosphericCard → WeatherForecastWidget → HuntMemoryCarousel
- `app/components/home/CommandCenterHero.tsx` — hero section with greeting
- `app/components/home/AtmosphericCard.tsx` — weather display with animated conditions
- `app/components/home/WeatherForecastWidget.tsx` — hourly forecast strip
- `app/components/home/HuntMemoryCarousel.tsx` — horizontal scroll of past hunt cards
- `app/components/home/SeasonGoalsRing.tsx` — exists but is not currently rendered (was replaced by CommandCenterHero)
- `app/components/home/WindRose.tsx` — wind direction visualization

### Changes Required

#### `app/components/home/CommandCenterHero.tsx` — Modify
Rewrite the hero card to show an adaptive "one big thing" based on context:

**Data sources needed:**
- `useHuntLogs()` — for `logs.length` (total hunts) and total harvest count
- `useHuntPlans()` — for upcoming/active plans
- `useUserProfile()` — for `profile.hunterName`
- Weather data passed as props from parent

**Adaptive logic (implement as a function that returns hero content):**
1. If there is an active plan (`status === 'ACTIVE'`) with a date within 48 hours → show "Upcoming Hunt" card with plan title, location, and a "View Plan" link
2. If current weather is loaded and conditions are favorable (temp 20-45°F, wind 5-20mph, overcast/partly cloudy) → show "Conditions look good" with a "Plan a Hunt" CTA
3. Default → show season progress greeting: "Welcome back, {hunterName}" with "Season: {totalHunts} hunts recorded"

**Visual spec:**
- Card uses `glass-card` class with `rounded-2xl p-5`
- Greeting line: `text-xs uppercase tracking-widest text-muted-foreground`
- Name: `text-2xl font-bold` using heading font (`font-heading` / Outfit)
- Subtitle: `text-sm text-primary font-medium`
- If a CTA is shown: use a `bg-primary/10 text-primary rounded-xl px-4 py-2 text-sm font-semibold` pill button

**Do NOT show:**
- "0 birds bagged" or any zero-count harvest stats
- Negative or pressure-oriented language
- Use "hunts recorded" not "hunts logged"

#### `app/components/home/AtmosphericCard.tsx` — Modify
Add a hunting suitability indicator to the existing weather card:

**Suitability logic (new function: `getHuntingSuitability`):**
- `GOOD` (green): temp 20-45°F, wind 8-20mph, overcast or light precip
- `FAIR` (amber): temp 15-55°F, wind 5-25mph, any sky
- `POOR` (red): temp below 10°F or above 60°F, wind above 30mph, or heavy precip

**Display:**
- Add a small badge in the top-right corner of the weather card
- Badge: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`
- Colors: green uses `bg-green-500/15 text-green-400`, amber uses `bg-amber-500/15 text-amber-400`, red uses `bg-red-500/15 text-red-400`
- Label: "GOOD", "FAIR", or "POOR"

Keep all existing atmospheric animations (rain, snow, fog, cloud-drift), wind rose, and weather data display exactly as they are.

#### `app/components/home/QuickActions.tsx` — New Component
Create a 2x2 action grid below the weather card, above the hunt carousel:

```tsx
// Four action cards in a 2-column grid
[
  { icon: Calendar,     label: "Plan Hunt",  sublabel: dynamic, href: "/plan/new",       primary: true },
  { icon: NotebookPen,  label: "Log Hunt",   sublabel: "Record your day", href: "/log/new",  primary: false },
  { icon: Package,      label: "Inventory",  sublabel: `${itemCount} items`, href: "/inventory", primary: false },
  { icon: BarChart3,    label: "Insights",   sublabel: "Season trends",  href: "/insights",  primary: false },
]
```

**Dynamic sublabel for "Plan Hunt":**
- If suitability is GOOD: "Conditions look good"
- If there's an active plan: "Continue planning"
- Default: "Set up your next hunt"

**Visual spec:**
- Container: `grid grid-cols-2 gap-3`
- Each card: `glass-card rounded-xl p-4 flex flex-col items-center gap-1 tap-highlight`
- Icon: 20px, centered, with a subtle background circle (`w-10 h-10 rounded-full flex items-center justify-center`)
- Label: `text-sm font-semibold`
- Sublabel: `text-[10px] text-muted-foreground`
- Primary card: icon background uses `bg-primary/10`, label uses `text-primary`
- Non-primary: icon background uses `bg-muted`, label uses default `text-foreground`
- Wrap each in `<Link>` with `hapticLight()` on click

#### `app/page.tsx` — Modify
Update the render order to insert QuickActions:

```tsx
<CommandCenterHero />
<AtmosphericCard ... />
<WeatherForecastWidget />
<QuickActions weather={weather} />     // NEW — insert here
<HuntMemoryCarousel ... />
```

Pass weather data to QuickActions so it can compute the suitability-based sublabel.

---

## Phase 3: Hunt Planning Flow Upgrade

### Goal
Improve the hunt planning experience with predictive pre-fill, progressive disclosure, and inline weather context. The data model (`HuntPlan` in `lib/types.ts`) and storage hooks (`useHuntPlans` in `lib/storage.ts`) already support everything needed — this is purely a UI/UX improvement.

### Current State
- `app/plan/page.tsx` — lists existing plans
- `app/plan/new/` — plan creation flow (multi-step or form)
- `app/plan/[id]/` — plan detail/edit
- `HuntPlan` type already has: `title`, `date`, `location` (GeoLocation), `weather` (WeatherConditions), `gear` (PlanGearItem[]), `status` (PlanStatus), `notes`
- `PlanGearItem` has: `id`, `name`, `category`, `quantity`, `checked`
- Plans already link to logs via `resultLogId`

### Changes Required

#### `app/plan/new/` — Rewrite Plan Creation
Replace the current plan creation with a stepped flow. Use client-side state (no new localStorage keys) to track the current step.

**Step 1: Hunt Context**
- Title input: text field, placeholder "e.g., Late Season Goose Field"
- Date picker: standard date input. On date selection, auto-fetch weather forecast using `fetchWeather()` from `lib/weatherApi.ts` for that date's location (if location is already set) or user's current location via `useGeolocation()`
- Location: use the existing `LocationAutocomplete` component from `app/components/LocationAutocomplete.tsx`
- Species selector: multi-select from `WATERFOWL_SPECIES` array in `lib/types.ts`
- Show a weather preview card inline if forecast data is available — use the same visual style as AtmosphericCard but simplified (temp, wind, sky condition, suitability badge)

**Pre-fill logic:**
- If the user has previous plans (`useHuntPlans()`), pre-populate location from the most recent plan
- If weather data loads, auto-populate the `weather` field on the plan

**Step 2: Gear Selection**
- Display the user's inventory via `useInventory()` in a selection mode
- Group items by category using `InventoryCategory`
- Each item row: category icon (via `CategoryIcon`), name, brand (from `specs.brand`), quantity selector
- Tapping an item toggles it as selected (adds to `gear[]` array on the plan)
- Selected items show a checkmark and highlighted border (`border-primary/30 bg-primary/5`)
- Add a filter bar at top: "All" plus buttons for each category that has items
- Show a sticky summary footer: "{N} items selected" with a "Next" button

**Step 3: Plan Review**
- Summary card showing: title, date, location name, weather preview, suitability badge
- Gear list grouped by category with quantities
- Notes text area (optional, expandable)
- Non-blocking suggestion line: if gear has no ammo items, show "Most plans include ammo — add some?" as a subtle amber text link that scrolls back to Step 2
- "Save Plan" button: calls `addPlan()` from `useHuntPlans()` (the hook returns `{ plans, loading, addPlan, updatePlan, deletePlan }`)

**Step navigation:**
- Use a horizontal step indicator at the top: three dots or labels ("Context", "Gear", "Review")
- Active step: `bg-primary` dot. Completed: `bg-primary/50`. Upcoming: `bg-muted`
- Steps should be tappable to jump back (but not forward past incomplete steps)
- Animate step transitions with `smooth` spring from `lib/motion.ts`
- Use `AnimatePresence` with `mode="wait"` for step content transitions

#### `app/plan/page.tsx` — Improve Plan List
- Group plans by status: Active plans first, then Draft, then Completed/Archived
- Each plan card should show: title, date, location name, gear count, status badge
- Status badges: ACTIVE = green, DRAFT = amber, COMPLETED = `text-muted-foreground`
- Add a "Log from this plan" action on ACTIVE plans — navigates to `/log/new?planId={id}` (see below)

#### `app/log/new/` — Support Plan-to-Log Bridge
When the URL contains a `planId` query parameter:
- Load the plan using `useHuntPlans()`
- Auto-fill the log form with: `location` from plan, `weather` from plan, `gear` from plan's selected gear, `date` from plan's date, `planId` set on the log
- User only needs to add: harvests, notes, rating
- Show a banner at top: "Logging from plan: {plan.title}" with a dismiss option

This pre-fill logic should live in the log creation page and check for the query param on mount.

---

## Design Token Reference

These tokens are already defined and should be used consistently. Do not introduce new color variables.

### Colors (from `globals.css` and `tailwind.config.js`)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `#0B3D2E` (mallard-green) | `#F5B800` (mallard-yellow) | Primary actions, active states |
| `--background` | `#fafbfc` | `#0B0E14` | Page background |
| `--card` | `#ffffff` | `#141820` | Card surfaces |
| `--muted-foreground` | `#64748b` | `#7B8794` | Secondary text, labels |
| `--border` | `#e2e8f0` | `#1E2536` | Card borders, dividers |

### Glass Classes (from `globals.css`)
| Class | Usage |
|-------|-------|
| `glass-nav` | Bottom navigation bar only |
| `glass-card` | Standard elevated cards |
| `glass-subtle` | Lighter frosted effect |
| `glass-section` | Section backgrounds with green tint (dark) |
| `stat-tile` | Compact metric cards |

### Motion Presets (from `lib/motion.ts`)
| Preset | Usage |
|--------|-------|
| `snappy` (400/30) | Button presses, toggles, counters |
| `smooth` (300/28) | Card entries, step transitions, section reveals |
| `gentle` (200/25) | Weather card, background animations |
| `staggerContainer` + `staggerChild` | Lists, grid reveals |

### Typography (from `app/layout.tsx`)
| Variable | Font | Usage |
|----------|------|-------|
| `--font-heading` | Outfit | h1-h6, brand name, hero text |
| `--font-body` | Plus Jakarta Sans | Body text, labels, inputs |

### Utility Classes (from `globals.css`)
| Class | Effect |
|-------|--------|
| `text-gradient-mallard` | Green gradient text (light mode) |
| `text-gradient-gold` | Gold gradient text (dark mode) |
| `tap-highlight` | Scale-down + opacity on `:active` for touch targets |
| `card-hover` | Translate-up + shadow on hover |
| `animate-shimmer` | Loading skeleton shimmer |
| `animate-glow-pulse` | FAB glow ring animation |

---

## Component Conventions

### File Placement
- Shared components: `app/components/`
- Feature-specific components: `app/components/{feature}/` (home, inventory, log, onboarding)
- New components for planning UI should go in `app/components/plan/`

### Component Pattern
All components should:
- Use `"use client"` directive (static export, no server components)
- Import icons from `lucide-react`
- Import motion presets from `@/lib/motion`
- Import haptics from `@/lib/haptics` for interactive elements
- Use Tailwind classes — no inline styles except for dynamic values (gradients, transforms)
- Wrap animated content in `<motion.div>` with appropriate preset

### Data Access
- Inventory: `useInventory()` from `@/lib/storage`
- Hunt logs: `useHuntLogs()` from `@/lib/storage`
- Hunt plans: `useHuntPlans()` from `@/lib/storage`
- User profile: `useUserProfile()` from `@/lib/useUserProfile`
- Weather: `fetchWeather()` from `@/lib/weatherApi`
- Geolocation: `useGeolocation()` from `@/lib/geolocation`
- Never create alternate Firestore access paths — use the existing hooks

---

## Implementation Order

1. **BottomNav restructure** — quickest win, changes how the whole app feels
2. **TopNav simplification** — remove profile icon (now in bottom nav)
3. **QuickActions component** — new, add to home page
4. **CommandCenterHero adaptive logic** — modify existing component
5. **AtmosphericCard suitability badge** — small addition to existing component
6. **Plan creation stepped flow** — largest change, rewrite of `/plan/new`
7. **Plan list improvements** — modify `/plan/page.tsx`
8. **Plan-to-log bridge** — modify `/log/new` to accept `planId` query param

Each step should be a separate commit. Test in the browser after each step since there is no test suite.
