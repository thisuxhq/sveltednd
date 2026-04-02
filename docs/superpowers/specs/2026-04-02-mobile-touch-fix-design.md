# Mobile Touch Fix — Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Problem

Drag and drop does not work on mobile/touch devices. Three root causes:

1. **`pointerover`/`pointerout` don't fire on touch during drag.** The droppable uses these events to set `dndState.targetContainer`. On touch, these events only fire on the element where the touch started — not on elements the finger moves over. So `targetContainer` is never updated.

2. **Drop silently rejected.** Because `targetContainer` is never set, `handlePointerDropOnContainer` in `droppable.ts` always fails its guard check (`dndState.targetContainer !== options.container`) and returns early. `onDrop` never fires.

3. **`pointercancel` not handled.** When the browser takes over a gesture (scroll intent, palm rejection), it fires `pointercancel`. Without a handler, `dndState.isDragging` stays `true` indefinitely and subsequent touches behave erratically.

## Approach: `getBoundingClientRect` in droppable + `pointercancel` in draggable

Chosen for minimal surface area: two files changed, zero API changes, no cross-module coordination.

## Changes

### `src/lib/actions/droppable.ts`

**Remove** three node-level pointer listeners that are broken on touch:
- `pointerover` → `handlePointerOver`
- `pointermove` → `handlePointerMove`
- `pointerout` → `handlePointerOut`

**Add** one document-level `pointermove` listener per droppable instance:

```ts
let wasOver = false;

function handleDocumentPointerMove(event: PointerEvent) {
    if (!dndState.isDragging) return;

    const rect = node.getBoundingClientRect();
    const isOver =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (isOver) {
        dndState.targetContainer = options.container;
        node.classList.add(...dragOverClass);
        updateDropIndicator(event.clientY, event.clientX);
        if (!wasOver) {
            options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
        }
    } else {
        if (wasOver && dndState.targetContainer === options.container) {
            dndState.targetContainer = null;
            node.classList.remove(...dragOverClass);
            clearDropIndicator();
            options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
        }
    }

    wasOver = isOver;
}
```

- The `wasOver` boolean ensures `onDragEnter`/`onDragLeave` callbacks fire only on the transition, not every frame.
- Works on both mouse and touch because it's coordinate-based, not propagation-based.
- Early-exits when `!dndState.isDragging` so idle overhead is a single boolean check.

Register/remove in setup and `destroy()`:
```ts
document.addEventListener('pointermove', handleDocumentPointerMove);
// destroy:
document.removeEventListener('pointermove', handleDocumentPointerMove);
```

### `src/lib/actions/draggable.ts`

**Add** `pointercancel` to the document-level listeners started in `handlePointerDown`:

```ts
document.addEventListener('pointercancel', handlePointerUp);
```

Remove it in `handlePointerUp` and `destroy()`:
```ts
document.removeEventListener('pointercancel', handlePointerUp);
```

`handlePointerUp` already resets `dndState`, removes dragging classes, fires `onDragEnd`, and cleans up listeners — no new logic needed.

## What Does Not Change

- `pointerdrop-on-container` / `handlePointerDropOnContainer` flow: unchanged. Once `targetContainer` is correctly set by the new `pointermove` logic, the existing drop guard works correctly.
- HTML5 drag path (desktop): unchanged.
- Public API (`draggable`, `droppable`, `dndState`): unchanged.
- CSS, types, stores: unchanged.

## Testing

- Manual: test sortable list, Kanban board, and grid demos on iOS Safari and Android Chrome.
- Verify drag indicator (drop-before/drop-after line) updates correctly during touch drag.
- Verify `onDragEnter`/`onDragLeave` callbacks fire exactly once per enter/leave transition.
- Verify cancelling a touch gesture (scroll attempt) fully resets `dndState.isDragging` to `false`.
- Verify existing desktop tests still pass.
