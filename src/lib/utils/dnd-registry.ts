/**
 * Registry of active droppable zones for keyboard navigation (#24).
 *
 * Droppables register on mount and unregister on destroy. Keyboard sessions
 * query this list (sorted by geometry) instead of inventing list indexes.
 *
 * @module dnd-registry
 */

import type { DragDropState } from '$lib/types/index.js';

export type DroppableDirection = 'vertical' | 'horizontal' | 'grid';

export interface DroppableRegistration {
	/** DOM node for this drop zone */
	element: HTMLElement;
	/** Container id (same as droppable options.container) */
	container: string;
	direction: DroppableDirection;
	disabled: boolean;
	/**
	 * Apply or clear visual hover for keyboard preview.
	 * position is used for drop indicators when hovering.
	 */
	setKeyboardHover: (active: boolean, position?: 'before' | 'after' | null) => void;
	/**
	 * Commit a drop using the same pipeline as pointer/HTML5.
	 * Receives a snapshot of dndState at drop time.
	 */
	commitDrop: (state: DragDropState) => void | Promise<void>;
}

const droppables = new Set<DroppableRegistration>();

export function registerDroppable(entry: DroppableRegistration): void {
	droppables.add(entry);
}

export function unregisterDroppable(entry: DroppableRegistration): void {
	droppables.delete(entry);
}

export function getRegisteredDroppables(): DroppableRegistration[] {
	return [...droppables];
}

/**
 * Returns enabled droppables sorted along an axis for keyboard stepping.
 * Nested parents that fully contain a registered child are omitted so the
 * deepest zones win (same spirit as #27).
 */
export function listKeyboardTargets(
	direction: DroppableDirection = 'vertical'
): DroppableRegistration[] {
	const enabled = [...droppables].filter((d) => !d.disabled && d.element.isConnected);

	// Prefer deepest: drop a zone if another registered zone is contained inside it
	const deepest = enabled.filter(
		(candidate) =>
			!enabled.some((other) => other !== candidate && candidate.element.contains(other.element))
	);

	const axis = direction === 'horizontal' ? 'x' : 'y';

	return deepest.sort((a, b) => {
		const ra = a.element.getBoundingClientRect();
		const rb = b.element.getBoundingClientRect();
		if (axis === 'y') {
			const dy = ra.top - rb.top;
			if (Math.abs(dy) > 1) return dy;
			return ra.left - rb.left;
		}
		const dx = ra.left - rb.left;
		if (Math.abs(dx) > 1) return dx;
		return ra.top - rb.top;
	});
}

/**
 * Find the index of a registration that owns `element` or contains it.
 */
export function indexOfElement(
	targets: DroppableRegistration[],
	element: HTMLElement | null
): number {
	if (!element) return -1;
	return targets.findIndex(
		(t) => t.element === element || t.element.contains(element) || element.contains(t.element)
	);
}

/** Clear keyboard hover on all registered droppables. */
export function clearAllKeyboardHovers(): void {
	for (const d of droppables) {
		d.setKeyboardHover(false, null);
	}
}

/** Testing helpers */
export const _testing = {
	clearAll() {
		droppables.clear();
	},
	size() {
		return droppables.size;
	}
};
