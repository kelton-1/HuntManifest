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
| **Inventory** | `/inventory`, `/inventory/add` | `lib/storage.ts` | **KEEP THIS ONE** |

**Decision:** Use ONLY the `/inventory` system with `lib/storage.ts` and `lib/types.ts`.

**Categories (Authoritative List):**
1. Firearm
2. Ammo
3. Decoy
4. Call
5. Clothing
6. Blind
7. Safety
8. Dog
9. Vehicle
10. Other

**When adding new inventory features:**
- Use `InventoryCategory` from `lib/types.ts`
- Use `useInventory()` hook from `lib/storage.ts`
- Add icons to `CategoryIcon.tsx` using Lucide icons only

---

## ADR-002: Icon System Standards

**Date:** 2024-12-05  
**Status:** Decided  
**Context:** Icons were previously inconsistent - some used Lucide, some used custom SVGs, some used composites.

**Decision:** ALL icons must use [Lucide React](https://lucide.dev/icons/) icons.

**Rules:**
1. ❌ No custom SVG icons
2. ❌ No composite/stacked icons
3. ✅ All icons should respect the passed `className` prop for sizing
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

## ADR-003: Storage Keys

**Date:** 2024-12-05  
**Status:** Decided  

**localStorage Keys:**
| Key | Purpose | Location |
|-----|---------|----------|
| `timber_inventory` | Gear/inventory items | `lib/storage.ts` |
| `timber_hunt_logs` | Hunt log entries | `lib/storage.ts` |
| `talkin_timber_preferences` | User preferences | `profile/page.tsx` |

**Do NOT create new storage keys without documenting here.**
