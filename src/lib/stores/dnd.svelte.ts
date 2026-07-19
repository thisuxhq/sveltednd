/**
 * Global drag and drop state management using Svelte 5 runes.
 *
 * We use a global $state object rather than a store because:
 * 1. Only one drag operation happens at a time in the browser
 * 2. Droppables need to read the current drag state without prop drilling
 * 3. $state provides fine-grained reactivity with less boilerplate than stores
 *
 * This state is reactive - components accessing these properties will
 * re-render when they change during the drag lifecycle.
 */

import type { DragDropState } from '$lib/types/index.js';

/**
 * Global reactive state for the current drag operation.
 *
 * @example
 * ```svelte
 * <script>
 *   import { dndState } from '@thisux/sveltednd';
 * </script>
 *
 * {#if dndState.isDragging}
 *   <div class="drop-hint">
 *     Dragging {dndState.draggedItem?.title} from {dndState.sourceContainer}
 *   </div>
 * {/if}
 * ```
 */
export const dndState = $state<DragDropState>({
	/** True when actively dragging (dragstart fired, dragend hasn't) */
	isDragging: false,
	/** The data being dragged - null when not dragging */
	draggedItem: null,
	/** Container identifier where the drag started - empty string when not dragging */
	sourceContainer: '',
	/**
	 * Current drop target container.
	 * Updates dynamically as the user moves between containers.
	 * Null when not over any valid drop zone.
	 */
	targetContainer: null,
	/**
	 * The specific DOM element under the cursor.
	 * Useful for precise visual feedback.
	 */
	targetElement: null,
	/**
	 * Where the drop would occur relative to targetElement.
	 * 'before' = drop above, 'after' = drop below, null = no position calculated.
	 */
	dropPosition: null,
	/**
	 * Set to true when hovering over an invalid drop zone.
	 * Can be used to show red highlighting or other error states.
	 */
	invalidDrop: false,
	/** Input path for the active drag; null when idle */
	dragInput: null
});

/**
 * Resets all transient drag state to idle.
 *
 * Idempotent — safe to call from multiple end paths (drop, dragend, pointerup,
 * destroy). Critical when `onDrop` removes the dragged node from the DOM:
 * the browser may never fire `dragend`, so droppables must also reset (#60).
 */
export function resetDndState(): void {
	dndState.isDragging = false;
	dndState.draggedItem = null;
	dndState.sourceContainer = '';
	dndState.targetContainer = null;
	dndState.targetElement = null;
	dndState.dropPosition = null;
	dndState.invalidDrop = false;
	dndState.dragInput = null;
}
