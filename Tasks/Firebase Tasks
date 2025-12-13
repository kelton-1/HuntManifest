Data model overview

You have 3 core domains:

Inventory (source of truth): what the user owns

Plan (intent): what the user is preparing for a specific hunt

Hunt (record): what actually happened

Key rule: Plans and Hunts reference Inventory items by ID and snapshot key fields at time-of-use (so logs remain accurate even if inventory changes later).

1) Entities and relationships
A. User

User 1—N InventoryItem

User 1—N HuntPlan

User 1—N HuntLog

User 1—N LocationSaved (optional)

Fields

id

displayName

units (temp, distance, wind)

homeLocationId?

createdAt, updatedAt

B. InventoryItem (the item you own)

Represents a specific gear record, not necessarily a “product SKU.” Example: “GHG Canada Goose Full-Body (24)”.

Fields

id

userId

category (enum)

name (display name, e.g. “Canada Goose Full-Bodies”)

brand? (string or reference)

quantityOwned (number)

unitType (enum: each, dozen, box, case, pair, etc.)

attributes (JSON by category; see below)

status (enum: active, archived)

notes?

createdAt, updatedAt

Category enum (example)

decoy, firearm, ammo, call, clothing, blind, safety, dog, vehicle, other

C. InventoryItemAttributes (category-specific)

Store as a JSON object keyed by category. This keeps the core table clean.

Examples:

DecoyAttributes

species (enum/string: “Canada Goose”)

decoyType (enum: full_body, silhouette, shell, floater, motion, field)

finish? (enum: flocked, painted, sleeved)

rigging? (enum: texas_rig, longline, none)

seasonTags? (array: early, late)

AmmoAttributes

gauge (e.g. 12)

shellLength (e.g. 3.0)

shotType (steel/bismuth/tss)

shotSize (#2, BB)

brandLine?

FirearmAttributes

gauge

model?

barrelLength?

chokeSystem?

D. HuntPlan (the planning object)

A plan is a container for intent + chosen items + context.

Fields

id

userId

title? (e.g. “Late Season Goose Field”)

status (enum: draft, scheduled, active, completed, canceled, archived)

startAt?, endAt? (optional)

locationId? (references saved location) OR locationSnapshot (inline)

conditionsSnapshot? (weather + wind at planning time; optional)

participants? (optional future)

notes?

tags? (array: “field”, “river”, “layout”, etc.)

createdAt, updatedAt

Relationships:

HuntPlan 1—N PlanGearSelection

HuntPlan 1—N PlanTask (optional, for non-gear planning items)

E. PlanGearSelection (join: plan ↔ inventory items)

This is the core: “what I intend to bring/use”.

Fields

id

planId

inventoryItemId (FK)

quantityPlanned (number)

unitType (copied from inventory at time of selection)

role? (enum: must_have, nice_to_have, optional)

notes?

sortOrder

itemSnapshot (JSON snapshot of key fields at time-of-plan)

createdAt, updatedAt

Why snapshot?
If the user edits Inventory later (renames, changes brand, splits quantities), the plan remains readable.

Snapshot should include:

name, category, brand?, and relevant attributes (species/type/gauge)

F. PlanTask (optional, but recommended)

Because planning isn’t just gear.
Examples: “Buy ice”, “Charge Mojo battery”, “Confirm permission”.

Fields

id

planId

title

status (open, done)

type? (admin, prep, travel, food, dog, etc.)

createdAt, updatedAt

This replaces “checklist” with planning tasks that aren’t tied to inventory.

G. HuntLog (the record of what happened)

A hunt log can be created:

from scratch, or

generated “from plan” (preferred)

Fields

id

userId

planId? (nullable, if derived from a plan)

startAt, endAt?

locationSnapshot (inline, immutable for history)

conditionsSnapshot (immutable)

outcome (JSON)

notes?

createdAt, updatedAt

Relationships:

HuntLog 1—N HuntGearUsage

HuntLog 1—N HarvestEntry

HuntLog 1—N MediaAsset (optional)

H. HuntGearUsage (join: hunt ↔ inventory items)

What was actually used/brought. Often starts as a copy of plan selections, then user adjusts.

Fields

id

huntId

inventoryItemId? (nullable if item not in inventory; allow ad-hoc)

quantityUsed (number)

unitType

source (enum: from_plan, manual_add)

itemSnapshot (JSON)

createdAt, updatedAt

Allow inventoryItemId to be null to support:

borrowed gear

guide-provided gear

one-off items user doesn’t want in inventory

I. HarvestEntry (results)

Fields

id

huntId

species (enum/string)

count

sex? (optional)

notes?

createdAt, updatedAt

Also store aggregated summary in HuntLog.outcome for quick list rendering:

totalBirds

speciesBreakdown

J. LocationSaved (optional but highly useful)

Fields

id

userId

name

lat, lng

region?

type? (field, marsh, river, etc.)

createdAt, updatedAt

In logs and plans, store snapshots:

locationSnapshot: {name?, lat, lng, region?}

K. ConditionsSnapshot (embedded object)

You don’t need a table unless you want caching. Store inline in Plan/Hunt.

Schema

temp

windSpeed

windDirection

sky

precip

humidity?

source (provider)

observedAt

2) Core workflows supported by the model
A. Add Inventory Item

Create InventoryItem

No planning logic attached

B. Create a Hunt Plan

Create HuntPlan

Add PlanGearSelection[] referencing InventoryItem.id

Optionally add PlanTask[]

C. Log a Hunt from a Plan

Create HuntLog with planId

Copy PlanGearSelection → HuntGearUsage (source=from_plan)

User edits actual gear used, adds harvest, notes

D. Inventory edits after planning

Plans/Hunts remain stable due to snapshots

Optional: show “Inventory changed since this plan” banner if InventoryItem.updatedAt > PlanGearSelection.createdAt

3) Constraints and validations (important)
Inventory quantity vs plan usage

For simplicity early:

Allow planning quantities that exceed owned quantity, but surface a warning:

“Planned 36, you own 24”

For later:

Add reservation logic (see “Advanced add-ons”).

Unique item naming

Do not force unique names; use IDs. Names are display-only.

Soft delete

Use status=archived on inventory items instead of hard delete to preserve historical logs.

4) Suggested enums (practical set)

Plan status

draft, scheduled, active, completed, canceled, archived

Item unitType

each, dozen, box, case, pair, lb, oz

Gear selection role

must_have, nice_to_have, optional

5) Minimal SQL-style schema (implementable)
inventory_items

id (pk)

user_id

category

name

brand

quantity_owned

unit_type

attributes_json

status

notes

created_at

updated_at

hunt_plans

id

user_id

title

status

start_at

end_at

location_snapshot_json

conditions_snapshot_json

notes

tags_json

created_at

updated_at

plan_gear_selections

id

plan_id

inventory_item_id

quantity_planned

unit_type

role

notes

sort_order

item_snapshot_json

created_at

updated_at

plan_tasks

id

plan_id

title

status

type

created_at

updated_at

hunt_logs

id

user_id

plan_id (nullable)

start_at

end_at

location_snapshot_json

conditions_snapshot_json

outcome_json

notes

created_at

updated_at

hunt_gear_usage

id

hunt_id

inventory_item_id (nullable)

quantity_used

unit_type

source

item_snapshot_json

created_at

updated_at

harvest_entries

id

hunt_id

species

count

sex

notes

created_at

updated_at

6) Advanced add-ons (optional, but future-proofing)
A. Reservations / “Packed” without checklists

If you want planning to feel like real packing without clicking checkboxes:

Add inventory_reservations tied to a plan:

reserves quantities across plans to prevent double-booking

B. Templates

Allow HuntPlan to be marked isTemplate=true

Duplicating a template creates a new plan with new selections.

C. Team hunting

Later:

PlanParticipant table with roles

Split gear responsibilities without forcing inventory ownership sharing.


Use **Cloud Firestore** (Firebase). Below is an exact, implementable Firestore data model (collections, document shapes, subcollections), plus the key rules you need for snapshots, denormalization, indexing, and security.

---

## 0) Firestore structure (recommended)

Firestore works best when you:

* keep user-owned data scoped under `/users/{uid}/...`
* store “child lists” as **subcollections** (plans → selections, hunts → gear, hunts → harvest)
* snapshot display fields to avoid joins
* denormalize “list screen” summaries to avoid many reads

Top-level:

```
/users/{uid}
  /inventory/{itemId}
  /plans/{planId}
    /selections/{selectionId}
    /tasks/{taskId}
  /hunts/{huntId}
    /gear/{gearUsageId}
    /harvest/{harvestId}
  /locations/{locationId}         (optional)
```

Optional shared/global collections (later):

```
/taxonomy/species
/taxonomy/gearCategories
```

---

## 1) Inventory

### Collection

`/users/{uid}/inventory/{itemId}`

### Document shape (InventoryItem)

```js
{
  id: "auto",                 // also in doc id; storing is optional
  category: "decoy",          // enum string
  name: "Canada Goose Full-Bodies",
  brand: "GHG",               // optional
  quantityOwned: 24,
  unitType: "each",           // each|dozen|box|case|pair
  attributes: {               // category-specific (flexible JSON)
    species: "Canada Goose",
    decoyType: "full_body",   // full_body|silhouette|shell|floater|motion|field
    finish: "standard",       // optional
    rigging: "none"           // optional
  },
  status: "active",           // active|archived
  notes: "",                  // optional
  usage: {                    // denormalized rollups (optional but valuable)
    lastUsedAt: Timestamp|null,
    huntsUsedCount: 0
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Why this works

* fast inventory list (single collection query)
* flexible per-category attributes without schema churn
* supports “heavy inventory” users cleanly

---

## 2) Plans (Planning experience)

### Collection

`/users/{uid}/plans/{planId}`

### Document shape (HuntPlan)

```js
{
  title: "Late Season Goose Field",    // optional
  status: "draft",                    // draft|scheduled|active|completed|canceled|archived
  startAt: Timestamp|null,
  endAt: Timestamp|null,

  // Snapshotted location (even if also saved as a location doc)
  location: {
    name: "Saint Charles",
    lat: 38.78,
    lng: -90.48,
    region: "Saint Charles County",
    type: "field"                     // optional
  },

  // Optional weather snapshot at planning time
  conditions: {
    tempF: 34,
    windMph: 6,
    windDir: "W",
    sky: "Partly Cloudy",
    source: "openweather",
    observedAt: Timestamp
  },

  tags: ["field", "geese"],           // optional
  notes: "",

  // Denormalized summary for plan list screens
  summary: {
    gearLineCount: 4,                 // number of selected lines, not total qty
    gearKey: ["Decoys", "Ammo"],      // quick chips
    lastEditedAt: Timestamp
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subcollection: Plan selections

`/users/{uid}/plans/{planId}/selections/{selectionId}`

This is the core join between plan and inventory.

```js
{
  inventoryItemId: "abc123",          // reference by ID
  quantityPlanned: 24,
  unitType: "each",                   // snapshot from inventory at time of selection
  role: "must_have",                  // must_have|nice_to_have|optional
  notes: "",

  // Snapshot for stable display even if inventory changes later
  itemSnapshot: {
    category: "decoy",
    name: "Canada Goose Full-Bodies",
    brand: "GHG",
    attributes: {
      species: "Canada Goose",
      decoyType: "full_body"
    }
  },

  sortOrder: 10,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subcollection: Plan tasks (optional but recommended)

`/users/{uid}/plans/{planId}/tasks/{taskId}`

```js
{
  title: "Charge Mojo batteries",
  status: "open",              // open|done
  type: "prep",                // prep|travel|food|admin|dog|other
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 3) Hunts (Logs)

### Collection

`/users/{uid}/hunts/{huntId}`

### Document shape (HuntLog)

```js
{
  planId: "plan_456" || null,         // set if created from a plan
  startAt: Timestamp,
  endAt: Timestamp|null,

  location: {                          // immutable snapshot
    name: "Saint Charles",
    lat: 38.78,
    lng: -90.48,
    region: "Saint Charles County",
    type: "field"
  },

  conditions: {                        // immutable snapshot
    tempF: 46,
    windMph: 18,
    windDir: "SW",
    sky: "Partly Cloudy",
    source: "openweather",
    observedAt: Timestamp
  },

  outcome: {                           // denormalized quick stats for list cards
    totalBirds: 0,
    speciesBreakdown: { "Mallard": 0, "Canada Goose": 0 }
  },

  notes: "",

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subcollection: Hunt gear usage

`/users/{uid}/hunts/{huntId}/gear/{gearUsageId}`

```js
{
  inventoryItemId: "abc123" || null,  // null allowed for borrowed / one-off gear
  quantityUsed: 24,
  unitType: "each",
  source: "from_plan",                // from_plan|manual_add

  itemSnapshot: {                     // snapshot for stable history
    category: "decoy",
    name: "Canada Goose Full-Bodies",
    brand: "GHG",
    attributes: { species: "Canada Goose", decoyType: "full_body" }
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subcollection: Harvest entries

`/users/{uid}/hunts/{huntId}/harvest/{harvestId}`

```js
{
  species: "Mallard",
  count: 2,
  sex: "drake" || null,              // optional
  notes: "",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 4) Locations (optional but useful)

### Collection

`/users/{uid}/locations/{locationId}`

```js
{
  name: "River Bend Field",
  lat: 38.78,
  lng: -90.48,
  region: "Saint Charles County",
  type: "field",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Plans/hunts should still store **location snapshots** so history doesn’t change if user renames a saved location.

---

## 5) Snapshot + denormalization rules (non-negotiable)

### Rule A — Always snapshot for Plans and Hunts

Whenever you attach an inventory item to a plan or hunt:

* store `inventoryItemId`
* store `itemSnapshot` (name/category/brand/attributes)

This prevents breakage when:

* user edits item name
* user changes brand
* user archives item
* user splits inventory entries

### Rule B — Keep list screens cheap

Plan list and hunt list should render from the parent doc:

* plan.summary
* hunt.outcome
  This avoids reading every selection/harvest doc for the card UI.

Update those rollups on:

* selection add/remove
* harvest add/remove

---

## 6) Suggested indexes (Firestore composite)

You’ll likely query:

### Inventory

* `status == active` order by `updatedAt desc`
* `category == decoy` + `status == active` order by `name`
* text search is not native (use prefix search or Algolia later)

### Plans

* `status in [draft, scheduled, active]` order by `startAt`
* `updatedAt desc` for “recent plans”

### Hunts

* order by `startAt desc`
* filter by `startAt >= seasonStart`

Firestore will prompt you to create composite indexes as needed. Expect to add:

* `plans: status + startAt`
* `inventory: status + category + updatedAt` (if you do both)

---

## 7) Security rules (baseline)

Keep it simple: users can only access their own subtree.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Later, if you add “team hunts,” you’ll expand rules to allow shared access by membership.

---

## 8) Implementation notes (Firebase gotchas)

### Timestamps

Use `serverTimestamp()` for created/updated.
Maintain both `createdAt` and `updatedAt`.

### Writes

When creating a hunt “from plan”:

1. create `hunt` doc (with planId + snapshots)
2. copy `plan/selections` into `hunt/gear` in a batch
3. set `hunt.outcome.totalBirds = 0`
4. update inventory usage rollups (optional)

Use a **batched write** or **transaction** to keep it consistent.

### ID strategy

Use Firestore auto IDs. Store ID inside doc only if your client code benefits from it.

---

## 9) Minimal v1 (what to build first)

Must-have:

* `/inventory`
* `/plans` + `/plans/{id}/selections`
* `/hunts` + `/hunts/{id}/gear` + `/hunts/{id}/harvest`
* snapshot logic

Nice-to-have:

* `/plans/{id}/tasks`
* inventory usage rollups (`usage.huntsUsedCount`, `usage.lastUsedAt`)

---

If you tell me whether you’re using React Native, Flutter, or web (or just prototyping screens), I can provide the exact CRUD functions for Firestore (createPlan, addSelection, logHuntFromPlan, updateRollups) in your stack.
