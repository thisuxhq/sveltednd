# Auto-Scroll During Drag

**Date:** 2026-04-04
**Status:** Approved
**Scope:** Built-in auto-scroll for all scrollable containers during drag operations

## Problem

When dragging items on mobile (or desktop), scrollable containers and the viewport do not scroll automatically when the pointer approaches the edge. Users must manually scroll to reach off-screen drop targets, which breaks the drag flow. This is table-stakes DnD behavior that users expect to just work.

## Decision

Built-in, enabled by default. Centralized scroll manager pattern.

- Auto-scroll activates on every drag with no consumer configuration
- Consumers can opt out per-droppable with `autoScroll: false`
- No new public exports; entirely internal to the library

## Architecture

### New Module: `src/lib/utils/auto-scroll.ts`

Exports two internal functions:

- `startAutoScroll()` — attaches document-level listeners, starts rAF loop
- `stopAutoScroll()` — cancels rAF, removes listeners, resets state

### Lifecycle Integration

1. **Drag starts** (`handleDragStart` or `handlePointerDown` in `draggable.ts`): calls `startAutoScroll()`
2. **During drag**: rAF loop reads cached pointer coordinates, applies scroll
3. **Drag ends** (`dragend`, `pointerup`, `pointercancel`, `drop`): calls `stopAutoScroll()`

### Event Listeners (document-level, added by scroll manager)

- `pointermove` — touch/pointer path, caches `clientX`/`clientY`
- `dragover` — HTML5 path, caches `clientX`/`clientY`

Both events only update the cached position. The rAF loop does the actual scrolling, decoupling event frequency from scroll frequency (always 60fps).

## Scrollable Container Discovery

On each rAF tick:

1. Call `document.elementFromPoint(lastClientX, lastClientY)` to find the element under the pointer
2. Walk up the DOM tree to `document.documentElement`
3. For each ancestor, check:
   - `getComputedStyle` reports `overflow`/`overflowX`/`overflowY` as `auto` or `scroll`
   - Element has scrollable content: `scrollHeight > clientHeight` or `scrollWidth > clientWidth`
4. Cache scrollability per element in a `WeakMap` to avoid recomputing `getComputedStyle` every frame
5. Viewport (`window`) is always included as the final scrollable target

### Excluding Containers

If a droppable has `autoScroll: false`, its container element is added to an internal exclusion set. The ancestor walk skips excluded elements.

## Edge Detection & Scroll Speed

For each scrollable container found, check pointer proximity to edges:

```
const rect = container.getBoundingClientRect()
const THRESHOLD = 40  // px from edge

// Vertical
if (clientY < rect.top + THRESHOLD)    -> scroll up
if (clientY > rect.bottom - THRESHOLD) -> scroll down

// Horizontal
if (clientX < rect.left + THRESHOLD)   -> scroll left
if (clientX > rect.right - THRESHOLD)  -> scroll right
```

### Speed Curve

Linear interpolation based on distance from edge:

- At threshold boundary (40px from edge): `MIN_SCROLL_SPEED` (1 px/frame)
- At container edge (0px from edge): `MAX_SCROLL_SPEED` (15 px/frame)
- Formula: `speed = MAX_SCROLL_SPEED * (1 - distance / THRESHOLD)`

### Multiple Containers

If the pointer is near the edge of a nested scrollable inside an outer scrollable, both scroll simultaneously. This handles the Kanban case: scroll a column vertically while the board scrolls horizontally.

## Constants (Internal)

| Constant           | Value | Description                            |
| ------------------ | ----- | -------------------------------------- |
| `EDGE_THRESHOLD`   | `40`  | Pixels from edge to activate scrolling |
| `MAX_SCROLL_SPEED` | `15`  | Pixels per frame at the edge           |
| `MIN_SCROLL_SPEED` | `1`   | Pixels per frame at threshold boundary |

These are not configurable by consumers. Sensible defaults, consistent with the library's existing pattern.

## API Changes

### DragDropOptions (type change)

```typescript
interface DragDropOptions<T = unknown> {
	container: string;
	direction?: 'vertical' | 'horizontal' | 'grid';
	autoScroll?: boolean; // NEW - defaults to true
	callbacks?: DragDropCallbacks<T>;
	disabled?: boolean;
}
```

### No New Exports

`startAutoScroll` and `stopAutoScroll` are internal. The public API surface does not change beyond the new option.

## Files Changed

| File                                | Change                                                        |
| ----------------------------------- | ------------------------------------------------------------- |
| `src/lib/utils/auto-scroll.ts`      | **New** — scroll manager module                               |
| `src/lib/utils/auto-scroll.spec.ts` | **New** — unit tests                                          |
| `src/lib/actions/draggable.ts`      | Call `startAutoScroll()`/`stopAutoScroll()` in drag lifecycle |
| `src/lib/actions/droppable.ts`      | Register/unregister exclusions when `autoScroll: false`       |
| `src/lib/types/index.ts`            | Add `autoScroll?: boolean` to `DragDropOptions`               |

## Testing Strategy

### Unit Tests (`src/lib/utils/auto-scroll.spec.ts`)

- **Speed calculation:** Verify linear interpolation at edge, midpoint, and threshold boundary
- **Container discovery:** Mock DOM with nested scrollable containers, verify all are found
- **WeakMap caching:** Verify `getComputedStyle` is not called redundantly for the same element
- **Exclusion:** Container with `autoScroll: false` is skipped in ancestor walk
- **Cleanup:** `stopAutoScroll()` cancels rAF and removes all listeners
- **No-op cases:** No scrollable ancestor found, pointer not near any edge
- **Both axes:** Horizontal + vertical scroll simultaneously on a single container
- **Nested scrollables:** Inner and outer both scroll when pointer is near shared edge

### Integration (existing test files)

- Verify `startAutoScroll` called on drag start in draggable tests
- Verify `stopAutoScroll` called on drag end / cancel / drop
