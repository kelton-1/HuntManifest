# Routes

**Routing:** Next.js App Router (file-based)
**Layout:** Single root layout (`app/layout.tsx`) wraps all pages with TopNav + BottomNav.

---

| URL Path | File Path | Summary |
|----------|-----------|---------|
| `/` | `app/page.tsx` | Home dashboard — weather card, command center hero, hunt memory carousel, quick actions, forecast widget |
| `/inventory` | `app/inventory/page.tsx` | Inventory list — category filters, search, grid/list toggle, item cards with category icons |
| `/inventory/add` | `app/inventory/add/page.tsx` | Add gear — category selection step → details form step (brand, model, notes, attributes) |
| `/inventory/[id]` | `app/inventory/[id]/page.tsx` | Inventory detail/edit — view and edit a single gear item |
| `/log` | `app/log/page.tsx` | Hunt log list — weather strips, harvest counts, location, date grouped |
| `/log/new` | `app/log/new/page.tsx` | New hunt log — auto-fill GPS/weather, harvest entry (species + count), gear selection |
| `/log/[id]` | `app/log/[id]/page.tsx` | Hunt log detail — full view of a single hunt log with weather, harvest, notes |
| `/plan` | `app/plan/page.tsx` | Hunt plans list — grouped by status (Active / Draft / Completed) |
| `/plan/new` | `app/plan/new/page.tsx` | New plan — multi-step wizard (Context → Gear → Review) |
| `/plan/[id]` | `app/plan/[id]/page.tsx` | Plan detail/edit — view and edit a single hunt plan |
| `/profile` | `app/profile/page.tsx` | User profile — stats overview, preferences (units, name), data management, feedback, logout |
| `/login` | `app/login/page.tsx` | Auth screen — Google sign-in + email/password, redirect flow handling |
| `/insights` | `app/insights/page.tsx` | Analytics dashboard — tiered insights that unlock at 3/5 hunts logged |

---

## Navigation Structure

**Bottom Tab Bar (4 tabs + center FAB):**
- Home (`/`)
- Journal (`/log`)
- **[+] FAB** → Log Hunt (`/log/new`), Add Gear (`/inventory/add`), Plan Hunt (`/plan/new`)
- Gear (`/inventory`)
- Profile (`/profile`)

**Top Nav:**
- Logo + app name (left)
- Theme toggle (right)
