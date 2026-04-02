# Mobile Touch Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix drag and drop on mobile/touch devices by replacing broken `pointerover`/`pointerout` hover detection with document-level `pointermove` + `getBoundingClientRect`, and adding `pointercancel` handling to prevent stuck drag state.

**Architecture:** Each droppable listens to document `pointermove` and uses `getBoundingClientRect` to determine if the pointer is within bounds — coordinate-based, not propagation-based, so it works on both mouse and touch. A `wasOver` boolean per droppable tracks the previous frame to fire `onDragEnter`/`onDragLeave` callbacks on transitions only. `pointercancel` in the draggable reuses the existing `handlePointerUp` cleanup so no new logic is required.

**Tech Stack:** TypeScript, Svelte 5, Vitest, happy-dom

---

### Task 1: Fix `pointercancel` — draggable loses stuck drag state on mobile

**Files:**

- Modify: `src/lib/actions/draggable.ts`
- Test: `src/lib/actions/draggable.spec.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('General functionality')` block in `src/lib/actions/draggable.spec.ts`:

```ts
it('should reset drag state when pointercancel fires (mobile gesture takeover)', () => {
	const onDragEnd = vi.fn();
	const action = draggable(node, {
		container: 'test',
		attributes: { draggingClass: 'dragging' },
		callbacks: { onDragEnd }
	});

	// Start a drag
	node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
	expect(dndState.isDragging).toBe(true);
	expect(node.classList.contains('dragging')).toBe(true);

	// Browser cancels the gesture (e.g. scroll detected on mobile)
	document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: false, pointerId: 1 }));

	expect(dndState.isDragging).toBe(false);
	expect(dndState.draggedItem).toBeNull();
	expect(dndState.sourceContainer).toBe('');
	expect(node.classList.contains('dragging')).toBe(false);
	expect(onDragEnd).toHaveBeenCalledTimes(1);

	action.destroy();
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
bun run test:unit -- --run src/lib/actions/draggable.spec.ts
```

Expected: FAIL — `pointercancel` is not handled, so `dndState.isDragging` stays `true`.

- [ ] **Step 3: Implement — add `pointercancel` to document listeners**

In `src/lib/actions/draggable.ts`, find `handlePointerDown` (around line 196). After the two `addEventListener` calls, add one more:

```ts
document.addEventListener('pointermove', handlePointerMove);
document.addEventListener('pointerup', handlePointerUp);
document.addEventListener('pointercancel', handlePointerUp); // ← add this line
```

In `handlePointerUp` (around line 240), after the two `removeEventListener` calls, add:

```ts
document.removeEventListener('pointermove', handlePointerMove);
document.removeEventListener('pointerup', handlePointerUp);
document.removeEventListener('pointercancel', handlePointerUp); // ← add this line
```

In `destroy()` (around line 326), after the two document `removeEventListener` calls, add:

```ts
document.removeEventListener('pointermove', handlePointerMove);
document.removeEventListener('pointerup', handlePointerUp);
document.removeEventListener('pointercancel', handlePointerUp); // ← add this line
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
bun run test:unit -- --run src/lib/actions/draggable.spec.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/draggable.ts src/lib/actions/draggable.spec.ts
git commit -m "fix: handle pointercancel to reset stuck drag state on mobile"
```

---

### Task 2: Fix hover detection — replace `pointerover`/`pointerout` with document `pointermove` in droppable

**Files:**

- Modify: `src/lib/actions/droppable.ts`
- Test: `src/lib/actions/droppable.spec.ts`

- [ ] **Step 1: Update existing pointer event tests to use document `pointermove`**

The current tests in `describe('Pointer events for touch/mouse fallback')` dispatch `pointerover`/`pointerout` directly on the node. These need to change to dispatch document-level `pointermove` with coordinates, using a mocked `getBoundingClientRect`.

Replace the entire `describe('Pointer events for touch/mouse fallback', ...)` block in `src/lib/actions/droppable.spec.ts` with:

```ts
describe('Pointer events for touch/mouse fallback (document pointermove)', () => {
	beforeEach(() => {
		// Give the node a known bounding rect: x:10, y:10 → x:110, y:110
		vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
			left: 10,
			top: 10,
			right: 110,
			bottom: 110,
			width: 100,
			height: 100,
			x: 10,
			y: 10,
			toJSON: () => ({})
		});
	});

	function dispatchDocumentPointerMove(clientX: number, clientY: number) {
		const event = new PointerEvent('pointermove', { bubbles: false, cancelable: false });
		Object.defineProperty(event, 'clientX', { value: clientX });
		Object.defineProperty(event, 'clientY', { value: clientY });
		document.dispatchEvent(event);
	}

	it('should set targetContainer and add drag-over class when pointer enters bounds', () => {
		const action = droppable(node, {
			container: 'test',
			attributes: { dragOverClass: 'drag-over' }
		});

		dndState.isDragging = true;
		dispatchDocumentPointerMove(60, 60); // inside 10-110 bounds

		expect(dndState.targetContainer).toBe('test');
		expect(node.classList.contains('drag-over')).toBe(true);

		action.destroy();
	});

	it('should call onDragEnter only once when pointer enters bounds', () => {
		const onDragEnter = vi.fn();
		const action = droppable(node, {
			container: 'test',
			callbacks: { onDragEnter }
		});

		dndState.isDragging = true;
		dispatchDocumentPointerMove(60, 60); // enter
		dispatchDocumentPointerMove(70, 70); // still inside — should not fire again

		expect(onDragEnter).toHaveBeenCalledTimes(1);

		action.destroy();
	});

	it('should not call onDragEnter when pointer is outside bounds', () => {
		const onDragEnter = vi.fn();
		const action = droppable(node, {
			container: 'test',
			callbacks: { onDragEnter }
		});

		dndState.isDragging = true;
		dispatchDocumentPointerMove(5, 5); // outside bounds (left: 10)

		expect(onDragEnter).not.toHaveBeenCalled();

		action.destroy();
	});

	it('should call onDragLeave and clear targetContainer when pointer leaves bounds', () => {
		const onDragLeave = vi.fn();
		const action = droppable(node, {
			container: 'test',
			callbacks: { onDragLeave }
		});

		dndState.isDragging = true;
		dispatchDocumentPointerMove(60, 60); // enter
		dispatchDocumentPointerMove(5, 5); // leave

		expect(onDragLeave).toHaveBeenCalledTimes(1);
		expect(dndState.targetContainer).toBeNull();
		expect(node.classList.contains('drag-over')).toBe(false);

		action.destroy();
	});

	it('should not fire any events when not dragging', () => {
		const onDragEnter = vi.fn();
		const onDragLeave = vi.fn();
		const action = droppable(node, {
			container: 'test',
			callbacks: { onDragEnter, onDragLeave }
		});

		dndState.isDragging = false;
		dispatchDocumentPointerMove(60, 60);

		expect(onDragEnter).not.toHaveBeenCalled();
		expect(onDragLeave).not.toHaveBeenCalled();

		action.destroy();
	});

	it('should not call onDragLeave when leaving a different container', () => {
		const onDragLeave = vi.fn();
		const action = droppable(node, {
			container: 'test',
			callbacks: { onDragLeave }
		});

		dndState.isDragging = true;
		dndState.targetContainer = 'other-container'; // something else is active
		dispatchDocumentPointerMove(60, 60); // enter this node
		dndState.targetContainer = 'other-container'; // simulate another container taking over
		dispatchDocumentPointerMove(5, 5); // leave this node bounds

		// onDragLeave should not fire because targetContainer !== 'test'
		expect(onDragLeave).not.toHaveBeenCalled();

		action.destroy();
	});
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
bun run test:unit -- --run src/lib/actions/droppable.spec.ts
```

Expected: the new `Pointer events for touch/mouse fallback` tests FAIL because `pointerover`/`pointerout` are still being used.

- [ ] **Step 3: Implement — add `wasOver` and `handleDocumentPointerMove`**

In `src/lib/actions/droppable.ts`, after the `let indicatorClass` declaration (around line 89), add:

```ts
/**
 * Tracks whether the pointer was inside this droppable on the previous
 * pointermove tick. Used to fire onDragEnter/onDragLeave on transitions only.
 */
let wasOver = false;
```

After the `clearDropIndicator` function (around line 225), add the new handler:

```ts
/**
 * Handles document-level pointermove for touch-compatible hover detection.
 *
 * pointerover/pointerout do not fire on elements beneath the finger during
 * a touch drag — the pointer stays captured to the element where touch began.
 * This handler uses getBoundingClientRect to detect hover by coordinates,
 * which works on both mouse and touch devices.
 *
 * Fires onDragEnter/onDragLeave callbacks only on the transition between
 * inside/outside, not on every pointermove tick.
 */
function handleDocumentPointerMove(event: PointerEvent) {
	if (options.disabled || !dndState.isDragging) return;

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
	} else if (wasOver && dndState.targetContainer === options.container) {
		dndState.targetContainer = null;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	wasOver = isOver;
}
```

- [ ] **Step 4: Replace node-level pointer listeners with the new document listener**

In `src/lib/actions/droppable.ts`, find the `// Pointer events for custom drag support` setup block (around line 476). Replace the three node-level listeners:

```ts
// REMOVE these three lines:
node.addEventListener('pointerover', handlePointerOver);
node.addEventListener('pointermove', handlePointerMove);
node.addEventListener('pointerout', handlePointerOut);

// ADD this one line:
document.addEventListener('pointermove', handleDocumentPointerMove);
```

In `destroy()`, replace the three removals:

```ts
// REMOVE these three lines:
node.removeEventListener('pointerover', handlePointerOver);
node.removeEventListener('pointermove', handlePointerMove);
node.removeEventListener('pointerout', handlePointerOut);

// ADD this one line:
document.removeEventListener('pointermove', handleDocumentPointerMove);
```

- [ ] **Step 5: Reset `wasOver` in drag-end cleanup handlers**

In `src/lib/actions/droppable.ts`, find `handleGlobalDragEnd` (around line 363). Add `wasOver = false;` at the end:

```ts
function handleGlobalDragEnd() {
	if (dragEnterCounter === 0) return;
	dragEnterCounter = 0;
	node.classList.remove(...dragOverClass);
	clearDropIndicator();
	wasOver = false; // ← add this
}
```

Find `handleDragStartOnContainer` (around line 376). Add `wasOver = false;` at the end:

```ts
function handleDragStartOnContainer() {
	if (options.disabled) return;
	dragEnterCounter = 0;
	node.classList.remove(...dragOverClass);
	clearDropIndicator();
	wasOver = false; // ← add this
}
```

- [ ] **Step 6: Run all tests**

```bash
bun run test:unit -- --run src/lib/actions/droppable.spec.ts
```

Expected: all tests PASS including the new document-pointermove tests.

- [ ] **Step 7: Run the full test suite**

```bash
bun run test
```

Expected: all tests PASS. No regressions.

- [ ] **Step 8: Type-check**

```bash
bun run check
```

Expected: no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/actions/droppable.ts src/lib/actions/droppable.spec.ts
git commit -m "fix: use document pointermove + getBoundingClientRect for touch-compatible hover detection"
```
