# HuntManifest Design System

## Product Context

**Product:** HuntManifest — Mobile-first waterfowl hunting management app
**Platform:** PWA (Progressive Web App), optimized for iOS/Android browsers
**Key Pages:** Home dashboard, Inventory management, Hunt logging, Hunt planning, Profile, Insights
**Target Users:** Waterfowl hunters who want to track gear, plan hunts, log results, and get AI insights

### Key Features / JTBD
- Track and organize hunting gear inventory by category
- Plan upcoming hunts with location, date, weather forecast, and gear checklists
- Log completed hunts with weather, harvest data (species + count), and notes
- View real-time weather conditions with hunting suitability scoring
- Get AI-powered insights on hunting patterns and performance

---

## Branding & Color Palette

### Brand Identity: "Mallard Palette"
Inspired by the mallard duck — deep greens and warm golds/yellows.

### Core Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `mallard-green` | `#0B3D2E` | Primary in light mode, brand green |
| `mallard-green-light` | `#166653` | Green gradient end, hover states |
| `mallard-yellow` | `#F5B800` | Primary in dark mode, accent gold |
| `mallard-yellow-light` | `#FFD54F` | Yellow gradient end, highlights |

### Nature / Sky Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `sky-dawn` | `#1e3a5f` | Dark sky gradient base |
| `sky-morning` | `#3b82f6` | Sky gradient blue |
| `water-blue` | `#0ea5e9` | Water/weather accents |

### Semantic UI Tokens (CSS variables)

**Light Mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#fafbfc` | Page background |
| `--foreground` | `#0f172a` | Text color |
| `--card` | `#ffffff` | Card background |
| `--primary` | `mallard-green (#0B3D2E)` | Buttons, links, active states |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#f1f5f9` | Secondary backgrounds |
| `--muted` | `#f1f5f9` | Muted backgrounds |
| `--muted-foreground` | `#64748b` | Secondary text |
| `--accent` | `#ecfdf5` | Accent backgrounds |
| `--border` | `#e2e8f0` | Border color |
| `--destructive` | `#dc2626` | Error/danger |

**Dark Mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0B0E14` | Deep dark background |
| `--foreground` | `#E8ECF1` | Light text |
| `--card` | `#141820` | Card background |
| `--primary` | `mallard-yellow (#F5B800)` | Buttons, links, active states |
| `--primary-foreground` | `#0a0f1a` | Dark text on gold |
| `--secondary` | `#1C2030` | Secondary backgrounds |
| `--muted` | `#1C2030` | Muted backgrounds |
| `--muted-foreground` | `#7B8794` | Secondary text |
| `--accent` | `#162420` | Accent backgrounds |
| `--border` | `#1E2536` | Border color |
| `--destructive` | `#991b1b` | Error/danger |

---

## Typography

### Font Families
- **Headings:** Outfit (Google Font) — `var(--font-heading)`
- **Body:** Plus Jakarta Sans (Google Font) — `var(--font-body)`
- **Monospace:** Geist Mono — `var(--font-geist-mono)`

### Conventions
- Heading elements (`h1`-`h6`) use `font-heading`
- Body text uses `font-body`
- Labels/captions: `text-[10px] uppercase tracking-wider text-muted-foreground`
- Bold values: `font-bold tabular-nums`

---

## Spacing & Layout

### Base Radius
- `--radius: 0.75rem` (12px)
- Derived: `sm` = 8px, `md` = 10px, `lg` = 12px, `xl` = 16px, `2xl` = 20px

### Layout Constraints
- **Mobile-first:** Max content width = `max-w-md` (448px), centered
- **Page padding:** `px-4 pt-4 pb-24` (bottom padding for nav)
- **Bottom nav height:** 68px + safe area + 20px margin
- **Top nav height:** 64px (h-16)

### Common Spacing
- Card padding: `p-3` to `p-5`
- Section gaps: `space-y-4` to `space-y-6`
- Grid gaps: `gap-3`

---

## Shadows

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-sm` | Subtle 1px | Deeper 1px |
| `--shadow` | Standard | Deeper standard |
| `--shadow-md` | Medium elevation | Deep medium |
| `--shadow-lg` | High elevation | Deep high |
| `--shadow-glow` | Green glow (0.15) | Gold glow (0.12) |

Custom glows:
- `shadow-glow`: `0 0 20px rgba(11, 61, 46, 0.15)` (green)
- `shadow-glow-yellow`: `0 0 20px rgba(245, 184, 0, 0.15)` (gold)

---

## Glassmorphism Effects

Key visual motif — used throughout for cards, navigation, weather widgets.

| Class | Effect |
|-------|--------|
| `.glass` | `backdrop-blur(12px)`, white/dark bg at ~85% opacity |
| `.glass-nav` | `backdrop-blur(24px) saturate(1.8)`, floating nav bar |
| `.glass-card` | `backdrop-blur(16px)`, elevated card with subtle border |
| `.glass-weather` | `backdrop-blur(12px)`, weather strip with inner shadow |
| `.glass-section` | `backdrop-blur(12px)`, section containers |

Dark mode adds subtle `inset 0 1px 0 rgba(255,255,255,0.04)` highlight on top edge.

---

## Component Patterns

### Buttons
- **Primary:** `.btn-primary` — green gradient (`bg-gradient-mallard`), white text, rounded-xl, shadow
- **Ghost/Secondary:** `bg-secondary text-foreground` or `bg-primary/10 text-primary`
- **Pill Actions:** `rounded-full` with icon + text

### Cards
- **Standard:** `.card` — `bg-card rounded-xl border border-border shadow-sm`
- **Glass:** `.glass-card` — glassmorphism with backdrop blur
- **Stat Tile:** `.stat-tile` — compact metric card

### Inputs
- `.input` — `rounded-xl border border-input bg-background px-4 py-3`
- Focus: green glow ring (light) / gold glow ring (dark), slight lift

### Badges
- `.badge-primary` / `.badge-success` / `.badge-warning` / `.badge-danger`
- Pill shape: `rounded-full px-2.5 py-1 text-xs font-medium`

---

## Motion & Animation

### Framer Motion Spring Presets
| Preset | Stiffness | Damping | Use Case |
|--------|-----------|---------|----------|
| `snappy` | 400 | 30 | Button presses, counters |
| `smooth` | 300 | 28 | Card entries, reveals |
| `gentle` | 200 | 25 | Weather cards, backgrounds |

### Stagger Pattern
- Container: `staggerChildren: 0.05`
- Child: slide up 24px + fade in, `smooth` spring

### CSS Animations
- `pulse-soft` — opacity oscillation (3s)
- `float` — translateY oscillation (4s)
- `glow` — box-shadow oscillation (2s)
- `slide-up` — entrance from 10px below (0.4s)
- `fade-in` — opacity entrance (0.3s)
- `shimmer` — loading skeleton gradient sweep
- `glow-pulse` — FAB glow pulse (3s)

### Weather Animations
- `rain` — falling drops
- `snow` — falling + rotating snowflakes
- `fog` — lateral drift
- `cloud-drift` — horizontal cloud movement

---

## Dark Mode Specifics

- Noise texture overlay at 3% opacity (SVG fractalNoise)
- Mesh gradient ambient layer with subtle green/gold/blue radial gradients
- Primary color flips: green (light) → gold (dark)
- Cards get slightly different opacity values
- All shadows deepen significantly

---

## Icons

**ALL icons use Lucide React.** No custom SVGs, no composite icons.

Category icon mapping (CategoryIcon.tsx):
- Firearm → Crosshair
- Ammo → Flame
- Decoy → Bird
- Call → Volume2
- Clothing → Shirt
- Blind → EyeOff
- Safety → LifeBuoy
- Vehicle → Truck
- Other → Box
- Default → Package

### Brand Logo
- File: `/public/logo.png` (9x9 rendered, PNG)
- Used in TopNav and loading splash

---

## Haptic Feedback
- Light: 10ms vibration (tab switches, minor taps)
- Medium: 25ms vibration (FAB toggle, confirmations)
- Heavy: [30, 20, 30]ms pattern (destructive actions)
