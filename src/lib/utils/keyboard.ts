/**
 * Keyboard drag-and-drop utilities.
 *
 * Provides two things:
 * 1. A screen reader live region for announcing drag state changes.
 * 2. A registry of active droppable nodes, used to move focus between
 *    drop targets during keyboard drag operations.
 */

/**
 * The aria-live region element used to announce drag events to screen readers.
 * Created lazily on first use and reused thereafter.
 */
let liveRegion: HTMLElement | null = null;

/**
 * Announces a message to screen readers via an aria-live region.
 *
 * Uses role="status" (polite) so announcements don't interrupt
 * the user mid-sentence. The message is cleared after a short delay
 * so the same message can be re-announced if needed.
 */
export function announce(message: string): void {
	if (typeof document === 'undefined') return;

	if (!liveRegion) {
		liveRegion = document.createElement('div');
		liveRegion.setAttribute('role', 'status');
		liveRegion.setAttribute('aria-live', 'polite');
		liveRegion.setAttribute('aria-atomic', 'true');
		// Visually hidden but accessible to screen readers
		Object.assign(liveRegion.style, {
			position: 'absolute',
			width: '1px',
			height: '1px',
			padding: '0',
			margin: '-1px',
			overflow: 'hidden',
			clip: 'rect(0,0,0,0)',
			whiteSpace: 'nowrap',
			border: '0'
		});
		document.body.appendChild(liveRegion);
	}

	// Clear first so the same message can be repeated
	liveRegion.textContent = '';
	// Small timeout ensures the DOM mutation is picked up by screen readers
	setTimeout(() => {
		if (liveRegion) liveRegion.textContent = message;
	}, 50);
}

/**
 * Ordered registry of active droppable elements.
 *
 * Droppables register themselves on mount and unregister on destroy.
 * The order reflects DOM insertion order, which matches visual order
 * in most layouts.
 */
const droppableRegistry: HTMLElement[] = [];

/** Register a droppable node. Called by the droppable action on setup. */
export function registerDroppable(node: HTMLElement): void {
	if (!droppableRegistry.includes(node)) {
		droppableRegistry.push(node);
	}
}

/** Unregister a droppable node. Called by the droppable action on destroy. */
export function unregisterDroppable(node: HTMLElement): void {
	const index = droppableRegistry.indexOf(node);
	if (index !== -1) droppableRegistry.splice(index, 1);
}

/**
 * Move focus to the next droppable after `current` in the registry.
 * Wraps around to the first droppable if at the end.
 * If `current` is null, focuses the first droppable.
 */
export function focusNextDroppable(current: HTMLElement | null): void {
	if (droppableRegistry.length === 0) return;
	const index = current ? droppableRegistry.indexOf(current) : -1;
	const next = droppableRegistry[(index + 1) % droppableRegistry.length];
	next?.focus();
}

/**
 * Move focus to the previous droppable before `current` in the registry.
 * Wraps around to the last droppable if at the beginning.
 */
export function focusPrevDroppable(current: HTMLElement | null): void {
	if (droppableRegistry.length === 0) return;
	const index = current ? droppableRegistry.indexOf(current) : 0;
	const prev = droppableRegistry[(index - 1 + droppableRegistry.length) % droppableRegistry.length];
	prev?.focus();
}
