/**
 * Droppable action - Makes any element accept drops from draggable items.
 *
 * This action works in tandem with the draggable action to provide drop zones.
 * It handles both HTML5 drag events and custom pointer events, maintaining
 * consistent state across both interaction modes.
 *
 * Key features:
 * - Drop position indicators (line before/after items for sorting)
 * - Drag enter/leave tracking with counter (handles nested elements)
 * - Support for multiple containers with the same identifier
 *
 * @example
 * ```svelte
 * <ul
 *   use:droppable={{
 *     container: 'task-list',
 *     callbacks: {
 *       onDrop: (state) => {
 *         // Move item from state.sourceContainer to this container
 *         // at position state.dropPosition ('before' or 'after' the target)
 *       }
 *     }
 *   }}
 * >
 *   {#each tasks as task}
 *     <li use:draggable={{ dragData: task, container: 'task-list' }}>
 *       {task.title}
 *     </li>
 *   {/each}
 * </ul>
 * ```
 *
 * @module droppable
 */

import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

/**
 * Default CSS class applied when an item is dragged over this element.
 * Override via options.attributes.dragOverClass
 */
const DEFAULT_DRAG_OVER_CLASS = 'drag-over';

/**
 * Svelte action that makes an element accept drops.
 *
 * @typeParam T - The type of data being dropped
 * @param node - The DOM element to make a drop zone
 * @param options - Configuration for drop behavior
 * @returns Svelte action lifecycle object with update and destroy
 */
export function droppable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	/**
	 * CSS classes to apply when an item is dragged over.
	 * Supports multiple classes separated by spaces.
	 */
	const dragOverClass = (options.attributes?.dragOverClass || DEFAULT_DRAG_OVER_CLASS).split(' ');

	/**
	 * Counter for tracking dragenter/dragleave events.
	 *
	 * WHY WE NEED THIS:
	 * When you drag over nested elements (like a list item containing a span),
	 * the browser fires dragenter for the child, then dragleave for the parent.
	 * Without a counter, we'd think we left the drop zone when we just entered a child.
	 *
	 * We increment on dragenter, decrement on dragleave. Only when it hits 0
	 * have we actually left the container.
	 */
	let dragEnterCounter = 0;

	/**
	 * The element currently showing the drop position indicator.
	 *
	 * This might be different from `node` - when dropping "after" an item,
	 * we actually draw the line on the NEXT sibling (so "after A" and "before B"
	 * appear at the same visual position). This creates cleaner gaps between items.
	 */
	let indicatorNode: HTMLElement | null = null;

	/**
	 * Which indicator style to apply: 'drop-before' or 'drop-after'.
	 *
	 * These classes draw the blue line indicator via CSS ::before/::after pseudo-elements.
	 */
	let indicatorClass: 'drop-before' | 'drop-after' = 'drop-before';

	/**
	 * Calculates whether the drop should be positioned before or after the target.
	 *
	 * Uses the cursor's Y position relative to the element's center point.
	 * Above center = before, below center = after.
	 *
	 * @param clientY - Mouse/pointer Y coordinate
	 * @returns 'before' or 'after'
	 */
	function getDropPosition(clientY: number): 'before' | 'after' {
		const { top, height } = node.getBoundingClientRect();
		return clientY < top + height / 2 ? 'before' : 'after';
	}

	/**
	 * Sets the visual drop indicator (the blue line showing where item will drop).
	 *
	 * THE SIBLING STRATEGY:
	 * When dropping "after" item A, we look for the next sibling (item B).
	 * If found, we apply 'drop-before' to B. This means:
	 * - "After A" and "Before B" render at the SAME visual position (the gap between them)
	 * - We avoid drawing a line below A that might look disconnected
	 *
	 * If there's no next sibling (last item), we draw the line below ourselves.
	 */
	function setDropIndicator(position: 'before' | 'after') {
		// Clear any existing indicator first
		clearDropIndicator();

		// Update global state so consumers can react
		dndState.dropPosition = position;

		if (position === 'after') {
			// Try to find the next sibling to draw the line on
			const next = node.nextElementSibling as HTMLElement | null;
			if (next) {
				// There's a next item - draw line at its top (which is same as our bottom gap)
				indicatorNode = next;
				indicatorClass = 'drop-before';
			} else {
				// No next sibling (we're the last item) - draw line below ourselves
				indicatorNode = node;
				indicatorClass = 'drop-after';
			}
		} else {
			// Position is 'before' - draw line at our top
			indicatorNode = node;
			indicatorClass = 'drop-before';
		}

		// Apply the CSS class that draws the line via ::before or ::after
		indicatorNode.classList.add(indicatorClass);
	}

	/**
	 * Removes the drop indicator line.
	 *
	 * Cleans up both the visual class and the global state.
	 */
	function clearDropIndicator() {
		if (indicatorNode) {
			indicatorNode.classList.remove(indicatorClass);
			indicatorNode = null;
		}
		dndState.dropPosition = null;
	}

	/**
	 * Handles dragenter - item dragged into this drop zone.
	 *
	 * We increment the counter and update state. The counter handles
	 * nested elements - we only truly "enter" on the first call.
	 */
	function handleDragEnter(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dragEnterCounter++;
		dndState.targetContainer = options.container;
		dndState.targetElement = event.target as HTMLElement;

		// Visual feedback: highlight the drop zone
		node.classList.add(...dragOverClass);
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles dragleave - item left this drop zone.
	 *
	 * Decrements the counter. Only when counter reaches 0 do we actually
	 * consider this a "leave" (handles nested element bubbling).
	 */
	function handleDragLeave(event: DragEvent) {
		if (options.disabled) return;

		dragEnterCounter--;

		// Sanity check: counter shouldn't go negative
		if (dragEnterCounter < 0) dragEnterCounter = 0;

		// Still inside nested elements? Don't clean up yet
		if (dragEnterCounter > 0) return;

		// Actually leaving - remove visual feedback
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);

		// Clear target state if this was the active container
		if (dndState.targetContainer === options.container && dndState.targetElement === event.target) {
			dndState.targetContainer = null;
			dndState.targetElement = null;
		}
	}

	/**
	 * Handles dragover - item moving within this drop zone.
	 *
	 * Fires continuously during drag. We:
	 * 1. Allow the drop (preventDefault)
	 * 2. Set the drop effect to 'move'
	 * 3. Update the drop position indicator
	 *
	 * Keep this lightweight - it runs on every mouse move!
	 */
	function handleDragOver(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		// Show the "move" cursor to indicate this is a valid drop target
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

		// Update the position indicator based on cursor Y position
		setDropIndicator(getDropPosition(event.clientY));
		options.callbacks?.onDragOver?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles drop - item was released over this zone.
	 *
	 * This is where the actual data update happens. We:
	 * 1. Parse the dropped data from the dataTransfer
	 * 2. Call the consumer's onDrop callback
	 * 3. Clean up visual state
	 *
	 * Supports async callbacks - state stays stable until the promise resolves.
	 */
	async function handleDrop(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		// Reset counter - we're no longer dragging over this zone
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);

		try {
			// Extract the dragged data from the HTML5 dataTransfer
			if (event.dataTransfer) {
				dndState.draggedItem = JSON.parse(event.dataTransfer.getData('text/plain')) as T;
			}
			// Let the consumer handle the actual data movement
			await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
		} catch (error) {
			console.error('Drop handling failed:', error);
		} finally {
			// Always clean up the indicator, even if drop handler fails
			clearDropIndicator();
		}
	}

	/**
	 * Handles dragstart-on-container custom event.
	 *
	 * This is fired by the draggable action when dragging starts.
	 * We use it to reset our state in case a drag started from within this container.
	 */
	function handleDragStartOnContainer() {
		if (options.disabled) return;
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
	}

	/**
	 * Handles pointerover - pointer mode version of dragenter.
	 *
	 * Unlike HTML5 drag events, pointer events fire on the element
	 * the cursor is actually over. We check if we're in a drag
	 * operation and update state accordingly.
	 */
	function handlePointerOver(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		dndState.targetContainer = options.container;
		node.classList.add(...dragOverClass);
		setDropIndicator(getDropPosition(event.clientY));
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles pointermove - pointer mode version of dragover.
	 *
	 * Only updates if we're currently the active target container.
	 * Updates the drop position indicator as the cursor moves.
	 */
	function handlePointerMove(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;
		if (dndState.targetContainer !== options.container) return;

		setDropIndicator(getDropPosition(event.clientY));
	}

	/**
	 * Handles pointerout - pointer mode version of dragleave.
	 *
	 * When the pointer leaves this element, we clean up our state
	 * and notify the consumer.
	 */
	function handlePointerOut(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		if (dndState.targetContainer === options.container) {
			dndState.targetContainer = null;
		}
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles pointerdrop-on-container custom event.
	 *
	 * This is dispatched by the draggable action's pointer event system
	 * when the pointer is released. We handle it the same way as HTML5 drop.
	 *
	 * Supports async callbacks - returns a Promise if the callback is async.
	 */
	async function handlePointerDropOnContainer(event: Event) {
		if (options.disabled || !dndState.isDragging) return;
		if (dndState.targetContainer !== options.container) return;

		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);

		try {
			// Extract data from the custom event detail
			const customEvent = event as CustomEvent;
			if (customEvent.detail?.dragData) {
				dndState.draggedItem = customEvent.detail.dragData;
			}
			await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
		} catch (error) {
			console.error('Drop handling failed:', error);
		} finally {
			clearDropIndicator();
		}
	}

	// === Setup: Attach all event listeners ===

	// HTML5 drag API events
	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragstart-on-container', handleDragStartOnContainer as EventListener);

	// Pointer events for custom drag support
	node.addEventListener('pointerover', handlePointerOver);
	node.addEventListener('pointermove', handlePointerMove);
	node.addEventListener('pointerout', handlePointerOut);
	node.addEventListener('pointerdrop-on-container', handlePointerDropOnContainer as EventListener);

	// Return Svelte action lifecycle methods
	return {
		/**
		 * Called when options change - updates the droppable configuration.
		 *
		 * @param newOptions - Updated configuration
		 */
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
		},

		/**
		 * Cleanup when the component is destroyed or the action is removed.
		 *
		 * Removes all event listeners and clears any visual indicators.
		 */
		destroy() {
			clearDropIndicator();
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener(
				'dragstart-on-container',
				handleDragStartOnContainer as EventListener
			);
			node.removeEventListener('pointerover', handlePointerOver);
			node.removeEventListener('pointermove', handlePointerMove);
			node.removeEventListener('pointerout', handlePointerOut);
			node.removeEventListener(
				'pointerdrop-on-container',
				handlePointerDropOnContainer as EventListener
			);
		}
	};
}
