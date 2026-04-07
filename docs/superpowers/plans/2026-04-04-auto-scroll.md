# Auto-Scroll During Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add built-in auto-scrolling during drag so scrollable containers and the viewport scroll when the pointer approaches their edges.

**Architecture:** A centralized scroll manager module (`src/lib/utils/auto-scroll.ts`) runs a single `requestAnimationFrame` loop during drags. It caches pointer coordinates from move events, discovers scrollable ancestors via DOM traversal, and applies `scrollBy()` at a speed proportional to edge proximity. The draggable action starts/stops the manager during the drag lifecycle.

**Tech Stack:** TypeScript, Svelte 5 runes, Vitest, happy-dom

---

### Task 1: Add `autoScroll` option to types

**Files:**

- Modify: `src/lib/types/index.ts:147-183`

- [ ] **Step 1: Add `autoScroll` to `DragDropOptions`**

In `src/lib/types/index.ts`, add the `autoScroll` property to `DragDropOptions` after the `disabled` field (line 165):

```typescript
/**
 * Whether to auto-scroll scrollable ancestors when dragging near their edges.
 * Enabled by default. Set to false to disable for this container.
 */
autoScroll?: boolean;
```

- [ ] **Step 2: Run type check**

Run: `bun run check`
Expected: PASS — optional property, no breaking changes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types/index.ts
git commit -m "feat: add autoScroll option to DragDropOptions type"
```

---

### Task 2: Create auto-scroll manager with tests (TDD)

**Files:**

- Create: `src/lib/utils/auto-scroll.ts`
- Create: `src/lib/utils/auto-scroll.spec.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils/auto-scroll.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startAutoScroll, stopAutoScroll, _testing } from './auto-scroll.js';
import { dndState } from '../stores/dnd.svelte.js';

describe('auto-scroll manager', () => {
	let rafCallback: FrameRequestCallback | null = null;
	let rafId = 1;

	beforeEach(() => {
		dndState.isDragging = true;
		rafCallback = null;
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			rafCallback = cb;
			return rafId++;
		});
		vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
	});

	afterEach(() => {
		stopAutoScroll();
		dndState.isDragging = false;
		vi.restoreAllMocks();
	});

	describe('startAutoScroll / stopAutoScroll lifecycle', () => {
		it('should add document-level pointermove and dragover listeners on start', () => {
			const addSpy = vi.spyOn(document, 'addEventListener');
			startAutoScroll();
			expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
			expect(addSpy).toHaveBeenCalledWith('dragover', expect.any(Function), expect.anything());
			stopAutoScroll();
		});

		it('should remove listeners and cancel rAF on stop', () => {
			const removeSpy = vi.spyOn(document, 'removeEventListener');
			startAutoScroll();
			stopAutoScroll();
			expect(removeSpy).toHaveBeenCalledWith(
				'pointermove',
				expect.any(Function),
				expect.anything()
			);
			expect(removeSpy).toHaveBeenCalledWith('dragover', expect.any(Function), expect.anything());
			expect(window.cancelAnimationFrame).toHaveBeenCalled();
		});

		it('should not add duplicate listeners if called twice', () => {
			const addSpy = vi.spyOn(document, 'addEventListener');
			startAutoScroll();
			startAutoScroll();
			const pointermoveCalls = addSpy.mock.calls.filter((c) => c[0] === 'pointermove');
			expect(pointermoveCalls).toHaveLength(1);
			stopAutoScroll();
		});
	});

	describe('calcScrollSpeed', () => {
		it('should return max speed at edge (distance 0)', () => {
			expect(_testing.calcScrollSpeed(0)).toBe(15);
		});

		it('should return min speed at threshold boundary', () => {
			expect(_testing.calcScrollSpeed(40)).toBe(0);
		});

		it('should interpolate linearly at midpoint', () => {
			const speed = _testing.calcScrollSpeed(20);
			expect(speed).toBeCloseTo(7.5);
		});

		it('should return 0 beyond threshold', () => {
			expect(_testing.calcScrollSpeed(50)).toBe(0);
		});
	});

	describe('isScrollable', () => {
		it('should detect element with overflow auto and scrollable content', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 500 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'auto',
				overflowX: 'hidden'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(true);
		});

		it('should return false for non-scrollable element', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 200 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'visible',
				overflowX: 'visible'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(false);
		});

		it('should detect horizontal scroll', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollWidth', { value: 500 });
			Object.defineProperty(el, 'clientWidth', { value: 200 });
			Object.defineProperty(el, 'scrollHeight', { value: 200 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'hidden',
				overflowX: 'scroll'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(true);
		});
	});

	describe('getScrollableAncestors', () => {
		it('should find scrollable ancestors walking up the DOM', () => {
			const inner = document.createElement('div');
			const outer = document.createElement('div');
			outer.appendChild(inner);
			document.body.appendChild(outer);

			Object.defineProperty(outer, 'scrollHeight', { value: 500 });
			Object.defineProperty(outer, 'clientHeight', { value: 200 });

			const originalGetComputedStyle = window.getComputedStyle;
			vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
				if (el === outer) {
					return { overflowY: 'auto', overflowX: 'hidden' } as CSSStyleDeclaration;
				}
				return originalGetComputedStyle(el);
			});

			const ancestors = _testing.getScrollableAncestors(inner);
			expect(ancestors).toContain(outer);

			outer.remove();
		});
	});

	describe('exclusion set', () => {
		it('should skip excluded elements', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 500 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'auto',
				overflowX: 'hidden'
			} as CSSStyleDeclaration);

			_testing.addExclusion(el);
			expect(_testing.isScrollable(el)).toBe(false);
			_testing.removeExclusion(el);
			expect(_testing.isScrollable(el)).toBe(true);
		});
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test:unit -- --run src/lib/utils/auto-scroll.spec.ts`
Expected: FAIL — module `./auto-scroll.js` does not exist.

- [ ] **Step 3: Implement the auto-scroll manager**

Create `src/lib/utils/auto-scroll.ts`:

```typescript
/**
 * Centralized auto-scroll manager for drag operations.
 *
 * Activates when a drag starts, attaches a single set of document-level
 * listeners, and runs a requestAnimationFrame loop that scrolls any
 * scrollable ancestor whose edge the pointer is near.
 *
 * @module auto-scroll
 */

const EDGE_THRESHOLD = 40;
const MAX_SCROLL_SPEED = 15;

/** Pointer position cached from the most recent move event. */
let lastClientX = 0;
let lastClientY = 0;

/** rAF handle for the scroll loop. */
let rafHandle: number | null = null;

/** Whether the manager is currently active. */
let active = false;

/** Elements excluded from auto-scroll (droppables with autoScroll: false). */
const exclusions = new Set<HTMLElement>();

/** Cache for isScrollable results — cleared each drag session. */
const scrollableCache = new WeakMap<HTMLElement, boolean>();

/**
 * Calculates scroll speed based on distance from edge.
 * Returns 0 if distance >= EDGE_THRESHOLD.
 */
function calcScrollSpeed(distance: number): number {
	if (distance >= EDGE_THRESHOLD) return 0;
	if (distance <= 0) return MAX_SCROLL_SPEED;
	return MAX_SCROLL_SPEED * (1 - distance / EDGE_THRESHOLD);
}

/**
 * Checks if an element is scrollable (has overflow auto/scroll and
 * content exceeding its client dimensions).
 */
function isScrollable(el: HTMLElement): boolean {
	if (exclusions.has(el)) return false;

	if (scrollableCache.has(el)) return scrollableCache.get(el)!;

	const style = window.getComputedStyle(el);
	const overflowY = style.overflowY;
	const overflowX = style.overflowX;

	const canScrollY =
		(overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
	const canScrollX =
		(overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth;

	const result = canScrollY || canScrollX;
	scrollableCache.set(el, result);
	return result;
}

/**
 * Walks up from `el` to document root, collecting scrollable ancestors.
 */
function getScrollableAncestors(el: HTMLElement): HTMLElement[] {
	const ancestors: HTMLElement[] = [];
	let current = el.parentElement;
	while (current && current !== document.documentElement) {
		if (isScrollable(current)) {
			ancestors.push(current);
		}
		current = current.parentElement;
	}
	return ancestors;
}

/**
 * Applies scroll to a single container based on pointer proximity to edges.
 */
function scrollContainer(container: HTMLElement): void {
	const rect = container.getBoundingClientRect();
	const style = window.getComputedStyle(container);

	// Vertical scrolling
	const canScrollY =
		(style.overflowY === 'auto' || style.overflowY === 'scroll') &&
		container.scrollHeight > container.clientHeight;
	if (canScrollY) {
		const distTop = lastClientY - rect.top;
		const distBottom = rect.bottom - lastClientY;
		if (distTop < EDGE_THRESHOLD && distTop >= 0) {
			container.scrollBy({ top: -calcScrollSpeed(distTop), behavior: 'instant' });
		} else if (distBottom < EDGE_THRESHOLD && distBottom >= 0) {
			container.scrollBy({ top: calcScrollSpeed(distBottom), behavior: 'instant' });
		}
	}

	// Horizontal scrolling
	const canScrollX =
		(style.overflowX === 'auto' || style.overflowX === 'scroll') &&
		container.scrollWidth > container.clientWidth;
	if (canScrollX) {
		const distLeft = lastClientX - rect.left;
		const distRight = rect.right - lastClientX;
		if (distLeft < EDGE_THRESHOLD && distLeft >= 0) {
			container.scrollBy({ left: -calcScrollSpeed(distLeft), behavior: 'instant' });
		} else if (distRight < EDGE_THRESHOLD && distRight >= 0) {
			container.scrollBy({ left: calcScrollSpeed(distRight), behavior: 'instant' });
		}
	}
}

/**
 * Applies scroll to the viewport (window) based on pointer proximity to edges.
 */
function scrollViewport(): void {
	const distTop = lastClientY;
	const distBottom = window.innerHeight - lastClientY;
	const distLeft = lastClientX;
	const distRight = window.innerWidth - lastClientX;

	let scrollX = 0;
	let scrollY = 0;

	if (distTop < EDGE_THRESHOLD && distTop >= 0) {
		scrollY = -calcScrollSpeed(distTop);
	} else if (distBottom < EDGE_THRESHOLD && distBottom >= 0) {
		scrollY = calcScrollSpeed(distBottom);
	}

	if (distLeft < EDGE_THRESHOLD && distLeft >= 0) {
		scrollX = -calcScrollSpeed(distLeft);
	} else if (distRight < EDGE_THRESHOLD && distRight >= 0) {
		scrollX = calcScrollSpeed(distRight);
	}

	if (scrollX !== 0 || scrollY !== 0) {
		window.scrollBy({ top: scrollY, left: scrollX, behavior: 'instant' });
	}
}

/** The rAF scroll loop. */
function scrollLoop(): void {
	if (!active) return;

	const elementUnderPointer = document.elementFromPoint(lastClientX, lastClientY);
	if (elementUnderPointer) {
		const ancestors = getScrollableAncestors(elementUnderPointer as HTMLElement);
		for (const container of ancestors) {
			scrollContainer(container);
		}
	}

	// Always check viewport
	scrollViewport();

	rafHandle = requestAnimationFrame(scrollLoop);
}

/** Caches pointer position from pointermove events. */
function handlePointerMove(event: PointerEvent): void {
	lastClientX = event.clientX;
	lastClientY = event.clientY;
}

/** Caches pointer position from dragover events (HTML5 path). */
function handleDragOver(event: DragEvent): void {
	lastClientX = event.clientX;
	lastClientY = event.clientY;
}

/**
 * Starts the auto-scroll manager.
 * Call when a drag operation begins.
 */
export function startAutoScroll(): void {
	if (active) return;
	active = true;

	document.addEventListener('pointermove', handlePointerMove, { passive: true });
	document.addEventListener('dragover', handleDragOver, { passive: true });

	rafHandle = requestAnimationFrame(scrollLoop);
}

/**
 * Stops the auto-scroll manager.
 * Call when a drag operation ends.
 */
export function stopAutoScroll(): void {
	if (!active) return;
	active = false;

	document.removeEventListener('pointermove', handlePointerMove, {
		passive: true
	} as EventListenerOptions);
	document.removeEventListener('dragover', handleDragOver, {
		passive: true
	} as EventListenerOptions);

	if (rafHandle !== null) {
		cancelAnimationFrame(rafHandle);
		rafHandle = null;
	}

	// Clear cache for next drag session
	scrollableCache = new WeakMap<HTMLElement, boolean>();
}

/** Add an element to the exclusion set (autoScroll: false). */
export function addScrollExclusion(el: HTMLElement): void {
	exclusions.add(el);
}

/** Remove an element from the exclusion set. */
export function removeScrollExclusion(el: HTMLElement): void {
	exclusions.delete(el);
}

/** Exported for testing only. */
export const _testing = {
	calcScrollSpeed,
	isScrollable,
	getScrollableAncestors,
	addExclusion: addScrollExclusion,
	removeExclusion: removeScrollExclusion
};
```

- [ ] **Step 4: Fix the `let` reassignment on WeakMap**

The `scrollableCache` is declared with `const` but reassigned in `stopAutoScroll`. Change it to `let`:

```typescript
let scrollableCache = new WeakMap<HTMLElement, boolean>();
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test:unit -- --run src/lib/utils/auto-scroll.spec.ts`
Expected: PASS

- [ ] **Step 6: Run full test suite**

Run: `bun run test`
Expected: PASS — no regressions.

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils/auto-scroll.ts src/lib/utils/auto-scroll.spec.ts
git commit -m "feat: add centralized auto-scroll manager with tests"
```

---

### Task 3: Integrate auto-scroll into draggable lifecycle

**Files:**

- Modify: `src/lib/actions/draggable.ts:31-32` (imports)
- Modify: `src/lib/actions/draggable.ts:154-177` (handleDragStart)
- Modify: `src/lib/actions/draggable.ts:186-196` (handleDragEnd)
- Modify: `src/lib/actions/draggable.ts:221-237` (handlePointerDown)
- Modify: `src/lib/actions/draggable.ts:271-308` (handlePointerUp)

- [ ] **Step 1: Add import**

At the top of `src/lib/actions/draggable.ts`, after line 32, add:

```typescript
import { startAutoScroll, stopAutoScroll } from '$lib/utils/auto-scroll.js';
```

- [ ] **Step 2: Call `startAutoScroll()` in `handleDragStart`**

After line 170 (`node.classList.add(...draggingClass);`), add:

```typescript
startAutoScroll();
```

- [ ] **Step 3: Call `stopAutoScroll()` in `handleDragEnd`**

At the beginning of `handleDragEnd` (after line 187 `html5DragActive = false;`), add:

```typescript
stopAutoScroll();
```

- [ ] **Step 4: Call `startAutoScroll()` in `handlePointerDown`**

After line 228 (`node.classList.add(...draggingClass);`), add:

```typescript
startAutoScroll();
```

- [ ] **Step 5: Call `stopAutoScroll()` in `handlePointerUp`**

After line 280 (`node.classList.remove(...draggingClass);`) and before the `elementFromPoint` call, add:

```typescript
stopAutoScroll();
```

- [ ] **Step 6: Run tests**

Run: `bun run test`
Expected: PASS

- [ ] **Step 7: Run type check**

Run: `bun run check`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/draggable.ts
git commit -m "feat: integrate auto-scroll manager into drag lifecycle"
```

---

### Task 4: Wire up autoScroll exclusion in droppable

**Files:**

- Modify: `src/lib/actions/droppable.ts:37-38` (imports)
- Modify: `src/lib/actions/droppable.ts:54-59` (setup section)
- Modify: `src/lib/actions/droppable.ts:459-478` (listener setup)
- Modify: `src/lib/actions/droppable.ts:487-489` (update method)
- Modify: `src/lib/actions/droppable.ts:496-513` (destroy method)

- [ ] **Step 1: Add import**

At the top of `src/lib/actions/droppable.ts`, after line 38, add:

```typescript
import { addScrollExclusion, removeScrollExclusion } from '$lib/utils/auto-scroll.js';
```

- [ ] **Step 2: Register exclusion on setup**

After the listener setup block (after line 478), add:

```typescript
// If auto-scroll is explicitly disabled for this container, exclude it
if (options.autoScroll === false) {
	addScrollExclusion(node);
}
```

- [ ] **Step 3: Handle exclusion in update method**

Replace the `update` method body (lines 487-489) with:

```typescript
		update(newOptions: DragDropOptions<T>) {
			// Update exclusion if autoScroll option changed
			if (newOptions.autoScroll === false && options.autoScroll !== false) {
				addScrollExclusion(node);
			} else if (newOptions.autoScroll !== false && options.autoScroll === false) {
				removeScrollExclusion(node);
			}
			options = newOptions;
		},
```

- [ ] **Step 4: Clean up exclusion in destroy**

At the beginning of the `destroy` method (after `clearDropIndicator();` on line 497), add:

```typescript
removeScrollExclusion(node);
```

- [ ] **Step 5: Run tests**

Run: `bun run test`
Expected: PASS

- [ ] **Step 6: Run type check**

Run: `bun run check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/actions/droppable.ts
git commit -m "feat: wire autoScroll exclusion in droppable action"
```

---

### Task 5: Manual verification and format

- [ ] **Step 1: Run linter and format**

Run: `bun run format && bun run lint`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `bun run test`
Expected: PASS

- [ ] **Step 3: Run type check**

Run: `bun run check`
Expected: PASS

- [ ] **Step 4: Build the library**

Run: `bun run build`
Expected: PASS — library builds and packages correctly.

- [ ] **Step 5: Start dev server and test manually**

Run: `bun run dev`

Test on the Kanban demo (`/`):

1. Drag a task to the bottom edge of a column — column should scroll down
2. Drag a task to the top edge of a column — column should scroll up
3. Drag a task to the right edge of the board — board should scroll right
4. Drag near the bottom of the viewport — page should scroll down

Test on horizontal scroll demo (`/horizontal-scroll`):

1. Drag an image to the right edge — container should scroll right
2. Drag an image to the left edge — container should scroll left

- [ ] **Step 6: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix: address issues found during manual testing"
```
