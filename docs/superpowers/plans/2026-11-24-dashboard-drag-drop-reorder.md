# Dashboard Drag-and-Drop Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin drag-and-drop to reorder services within their category group, and to reorder steps within a service, in `/dashboard`.

**Architecture:** Two new server actions in `src/lib/actions.ts` persist a whole reordered list in one write (`bulkWrite` for services, one array `$set` for steps). Two UI call sites in `src/components/dashboard/DashboardClient.tsx` add native HTML5 drag handlers (no new dependency) that compute the new order client-side and call the matching action through the existing `run()`/`useTransition` pattern.

**Tech Stack:** Next.js 14 Server Actions, MongoDB (`mongodb` driver), native HTML5 Drag and Drop API, Tailwind. No new npm dependencies.

**Spec:** This plan's design was agreed inline in conversation (brainstorming skill), not written to a separate spec file. Summary below in Global Constraints.

## Global Constraints

- No new npm dependencies — native HTML5 `draggable`/`onDragStart`/`onDragOver`/`onDrop` only.
- Desktop only — no touch/pointer-event polyfill, no mobile support required.
- Services reorder is bounded to the service's current category group (same boundary `moveServiceInGroup` already uses); steps reorder is bounded to their own service. No cross-category drag.
- No changes to the Categories tab.
- Persist via one write per drop (bulk/array-replace), not repeated adjacent-swap calls.
- Reuse the existing `run()` / `startTransition` + `revalidatePath` pattern already used by every other mutation in `DashboardClient.tsx` — no new local optimistic-reorder state.
- Keep the existing up/down arrow buttons unchanged, as a fallback.
- No test framework exists in this repo (no Jest/Vitest, no existing `*.test.*` files, and none of `actions.ts`'s existing mutators — `moveService`, `moveSubService`, etc. — have unit tests). Verification here is `npx tsc --noEmit`, `npm run lint`, and precise manual dev-server checks, matching how the rest of `actions.ts` was built and verified.

## Review Focus

- Dropping an item onto itself must no-op — must not call the server action or scramble order.
- A group/list with 0 or 1 members must not throw (no `-1` index used in a splice).
- Starting a new drag while a previous reorder's server round-trip is still pending (`isPending`) must be prevented, to avoid two overlapping writes racing on `sortOrder`.
- Dragging a service row must only ever reorder within the section (group) it started in — the drop handler must use the same filtered `group` array the row was rendered from, never the full services list, so a drag can't silently move a service into a different category's section.
- `reorderSubServices` must guard against a stale/mismatched `orderedIds` list (e.g. length mismatch against the current `subServices`) by skipping the write rather than silently dropping steps.

---

## Task 1: `reorderServicesInGroup` server action

**Files:**
- Modify: `src/lib/actions.ts:107-121` (insert new function immediately after `moveServiceInGroup`)

**Interfaces:**
- Produces: `reorderServicesInGroup(categoryId: string | null, orderedIds: string[]): Promise<void>`, exported from `src/lib/actions.ts`. `orderedIds` is the new top-to-bottom order of service `_id`s within one category group (or the uncategorized group when `categoryId` is `null`).

- [ ] **Step 1: Implement `reorderServicesInGroup` in `src/lib/actions.ts`**

Mirror `moveServiceInGroup`'s group-matching query (categoryId match, or `$or` on missing/null for uncategorized) to fetch the group's current ids, then only bulk-write `sortOrder` for ids that are actually in that group (defends against a stale/bogus id list), skipping the write if the filtered list is empty:

```ts
export async function reorderServicesInGroup(categoryId: string | null, orderedIds: string[]) {
  const col = await getServicesCollection();
  const query = categoryId
    ? { categoryId }
    : { $or: [{ categoryId: { $exists: false } }, { categoryId: null }] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = await col.find(query as any).toArray();
  const groupIds = new Set(group.map((s) => s._id));

  const ops = orderedIds
    .filter((id) => groupIds.has(id))
    .map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
    }));
  if (ops.length === 0) return;

  await col.bulkWrite(ops);
  refresh();
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions.ts
git commit -m "Add reorderServicesInGroup server action"
```

---

## Task 2: `reorderSubServices` server action

**Files:**
- Modify: `src/lib/actions.ts:209-222` (insert new function immediately after `moveSubService`)

**Interfaces:**
- Produces: `reorderSubServices(serviceId: string, orderedIds: string[]): Promise<void>`, exported from `src/lib/actions.ts`. `orderedIds` is the new top-to-bottom order of sub-service `id`s within one service's `subServices` array.

- [ ] **Step 1: Implement `reorderSubServices` in `src/lib/actions.ts`**

Reorder the embedded array in memory and `$set` it back as one update. Guard on a length mismatch (stale list) by skipping the write rather than writing a truncated array:

```ts
export async function reorderSubServices(serviceId: string, orderedIds: string[]) {
  const col = await getServicesCollection();
  const service = await col.findOne({ _id: serviceId });
  if (!service) return;

  const byId = new Map(service.subServices.map((ss) => [ss.id, ss]));
  const reordered = orderedIds.map((id) => byId.get(id)).filter((ss): ss is typeof service.subServices[number] => !!ss);
  if (reordered.length !== service.subServices.length) return;

  await col.updateOne({ _id: serviceId }, { $set: { subServices: reordered } });
  refresh();
}
```

The length-mismatch guard (`if (reordered.length !== service.subServices.length) return;`) is defensive-only: Task 4's UI always derives `orderedIds` from the live `service.subServices` array, so it can't trigger this path through the app. It guards this function against being called with a stale or partial list from any future caller. There's no DB-backed test for it (no test framework, and this project doesn't test `actions.ts`) — verify it by reading the implementation in Step 2/3 below rather than by exercising it.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions.ts
git commit -m "Add reorderSubServices server action"
```

---

## Task 3: Drag-and-drop UI for the Services list

**Files:**
- Modify: `src/components/dashboard/DashboardClient.tsx:5-21` (import `reorderServicesInGroup`)
- Modify: `src/components/dashboard/DashboardClient.tsx:214-287` (`ServicesScreen` function, specifically its `renderRow` helper)

**Interfaces:**
- Consumes: `reorderServicesInGroup(categoryId: string | null, orderedIds: string[]): Promise<void>` from Task 1; `run: (fn: () => Promise<void>) => void` and `isPending: boolean`, already props of `ServicesScreen`.
- Produces: the `dragId`/`overId` state-naming pattern inside `ServicesScreen`, which Task 4 should mirror (not a code dependency — just keep the UI behavior consistent between the two lists).

- [ ] **Step 1: Add drag state to `ServicesScreen`**

Alongside the existing `collapsed` state (`DashboardClient.tsx:216`), add:

```ts
const [dragId, setDragId] = useState<string | null>(null);
const [overId, setOverId] = useState<string | null>(null);
```

- [ ] **Step 2: Add a drag handle and drag handlers to `renderRow`**

In `renderRow(service, group, categoryId)` (`DashboardClient.tsx:229-287`):

1. Add a drag-handle element as the new leftmost child, before the existing up/down-arrow `div` (`DashboardClient.tsx:243`):

```tsx
<span
  draggable={!isPending}
  onDragStart={(e) => { if (isPending) { e.preventDefault(); return; } setDragId(service.id); e.dataTransfer.effectAllowed = "move"; }}
  onDragEnd={() => { setDragId(null); setOverId(null); }}
  className="cursor-grab text-spa-muted hover:text-spa-text transition-colors shrink-0 px-0.5"
  title="Drag to reorder"
>
  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
    <circle cx="2" cy="2" r="1.3" /><circle cx="8" cy="2" r="1.3" />
    <circle cx="2" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" />
    <circle cx="2" cy="14" r="1.3" /><circle cx="8" cy="14" r="1.3" />
  </svg>
</span>
```

2. On the row's root `div` (`DashboardClient.tsx:236-240`), add `onDragOver` and `onDrop`, and append a drop-indicator class when this row is the current drop target:

```tsx
const isDropTarget = overId === service.id && dragId !== null && dragId !== service.id;
```

```tsx
onDragOver={(e) => {
  e.preventDefault();
  if (dragId && dragId !== service.id) setOverId(service.id);
}}
onDrop={(e) => {
  e.preventDefault();
  if (!dragId || dragId === service.id) { setDragId(null); setOverId(null); return; }
  const ids = group.map((s) => s.id);
  const from = ids.indexOf(dragId);
  const to = ids.indexOf(service.id);
  setDragId(null);
  setOverId(null);
  if (from === -1 || to === -1 || from === to) return;
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  run(() => reorderServicesInGroup(categoryId, ids));
}}
```

Append `${isDropTarget ? " border-t-2 border-spa-accent" : ""}` to the row's existing template-literal `className`.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open `/dashboard` → Services tab (PIN `1337` unless changed).

- With at least one category containing 2+ services: drag a service to a different position within its own category section; confirm it lands in the new position and the order survives a page reload.
- Confirm dragging a service and dropping it over a row in a *different* category's section does nothing (no reorder, no category change) — the drop handler only acts within the `group` the row belongs to.
- With a category/uncategorized group containing exactly 1 service, confirm its drag handle doesn't error (nothing to drop onto).
- While a drag-triggered reorder is in flight (if perceptible), confirm the drag handle doesn't allow starting a second drag (`draggable={!isPending}`).

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/DashboardClient.tsx
git commit -m "Add drag-and-drop reordering to the Services list"
```

---

## Task 4: Drag-and-drop UI for the Steps list

**Files:**
- Modify: `src/components/dashboard/DashboardClient.tsx:5-21` (import `reorderSubServices`)
- Modify: `src/components/dashboard/DashboardClient.tsx:55-86` (`SubRowProps` / `SubRow`)
- Modify: `src/components/dashboard/DashboardClient.tsx:399-401, 494-525` (`ServiceEditScreen`, specifically the `subServices.map` block)

**Interfaces:**
- Consumes: `reorderSubServices(serviceId: string, orderedIds: string[]): Promise<void>` from Task 2; `run`/`isPending`, already props of `ServiceEditScreen`. Mirrors the `dragId`/`overId` pattern from Task 3.

- [ ] **Step 1: Extend `SubRowProps` and `SubRow`**

In `SubRowProps` (`DashboardClient.tsx:55-64`), add:

```ts
isDropTarget: boolean;
draggable: boolean;
onDragStart: () => void;
onDragOver: () => void;
onDrop: () => void;
onDragEnd: () => void;
```

In `SubRow` (`DashboardClient.tsx:66-86`), destructure the new props, add the same drag-handle markup used in Task 3 (SVG grip icon) as the new leftmost child before the existing up/down-arrow `div` (`DashboardClient.tsx:69`), wiring its `draggable`/`onDragStart`/`onDragEnd` to the new props, and add `onDragOver`/`onDrop` to the row's root `div` (`DashboardClient.tsx:68`). Append `isDropTarget ? " border-t-2 border-spa-accent" : ""` to that root `div`'s className.

- [ ] **Step 2: Add drag state and handlers to `ServiceEditScreen`**

Alongside `editingSubId`/`showAddStep` state (`DashboardClient.tsx:400-401`), add:

```ts
const [dragId, setDragId] = useState<string | null>(null);
const [overId, setOverId] = useState<string | null>(null);
```

In the `subServices.map` callback (`DashboardClient.tsx:497-523`), pass to each non-editing `SubRow`:

```tsx
isDropTarget={overId === sub.id && dragId !== null && dragId !== sub.id}
draggable={!isPending}
onDragStart={() => setDragId(sub.id)}
onDragEnd={() => { setDragId(null); setOverId(null); }}
onDragOver={() => { if (dragId && dragId !== sub.id) setOverId(sub.id); }}
onDrop={() => {
  if (!dragId || dragId === sub.id) { setDragId(null); setOverId(null); return; }
  const ids = service.subServices.map((s) => s.id);
  const from = ids.indexOf(dragId);
  const to = ids.indexOf(sub.id);
  setDragId(null);
  setOverId(null);
  if (from === -1 || to === -1 || from === to) return;
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  run(() => reorderSubServices(service.id, ids));
}}
```

`SubRow`'s `onDragOver`/`onDrop` handlers in its JSX must call `e.preventDefault()` before invoking these props (same as Task 3's row handlers), since `SubRow` owns the DOM element and the native drag API requires `preventDefault()` on `dragover` for `drop` to fire at all.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open `/dashboard` → Services tab → edit a service with 2+ steps.

- Drag a step to a new position; confirm it lands correctly and the new order (and each step's running-total time) survives a page reload.
- Confirm dropping a step onto itself does nothing.
- With a service that has exactly 1 step, confirm its drag handle doesn't error.
- Confirm editing a step (the inline `SubForm`) still works unaffected — that row isn't rendered as a draggable `SubRow` while being edited (`DashboardClient.tsx:499-509` already branches to `SubForm` instead).

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/DashboardClient.tsx
git commit -m "Add drag-and-drop reordering to the Steps list"
```
