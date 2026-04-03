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
let scrollableCache = new WeakMap<HTMLElement, boolean>();

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
 * Only called on elements that already passed isScrollable().
 */
function scrollContainer(container: HTMLElement): void {
	const rect = container.getBoundingClientRect();

	// Vertical scrolling — check if there's room to scroll
	if (container.scrollHeight > container.clientHeight) {
		const distTop = lastClientY - rect.top;
		const distBottom = rect.bottom - lastClientY;
		if (distTop < EDGE_THRESHOLD && distTop >= 0) {
			container.scrollBy({ top: -calcScrollSpeed(distTop), behavior: 'instant' });
		} else if (distBottom < EDGE_THRESHOLD && distBottom >= 0) {
			container.scrollBy({ top: calcScrollSpeed(distBottom), behavior: 'instant' });
		}
	}

	// Horizontal scrolling — check if there's room to scroll
	if (container.scrollWidth > container.clientWidth) {
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

	document.removeEventListener('pointermove', handlePointerMove);
	document.removeEventListener('dragover', handleDragOver);

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
