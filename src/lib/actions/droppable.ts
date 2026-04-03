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
import {
	announce,
	registerDroppable,
	unregisterDroppable,
	focusNextDroppable,
	focusPrevDroppable
} from '$lib/utils/keyboard.js';

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
	 * Which indicator style to apply.
	 *
	 * Vertical lists: 'drop-before' (line above) / 'drop-after' (line below)
	 * Horizontal lists: 'drop-left' (line to the left) / 'drop-right' (line to the right)
	 */
	let indicatorClass: 'drop-before' | 'drop-after' | 'drop-left' | 'drop-right' = 'drop-before';

	/**
	 * Tracks whether the pointer was inside this droppable on the previous
	 * pointermove tick. Used to fire onDragEnter/onDragLeave on transitions only.
	 */
	let wasOver = false;

	/**
	 * Calculates whether the drop should be positioned before or after the target.
	 *
	 * For vertical lists: compares cursor Y against the element's vertical midpoint.
	 * For horizontal lists: compares cursor X against the element's horizontal midpoint.
	 *
	 * Not used for 'grid' direction — see updateDropIndicator instead.
	 *
	 * @param clientY - Mouse/pointer Y coordinate
	 * @param clientX - Mouse/pointer X coordinate
	 * @returns 'before' or 'after'
	 */
	function getDropPosition(clientY: number, clientX: number): 'before' | 'after' {
		if (options.direction === 'horizontal') {
			const { left, width } = node.getBoundingClientRect();
			return clientX < left + width / 2 ? 'before' : 'after';
		}
		const { top, height } = node.getBoundingClientRect();
		return clientY < top + height / 2 ? 'before' : 'after';
	}

	/**
	 * Nearest-edge detection for grid layouts.
	 *
	 * Finds which of the four edges (top, right, bottom, left) the cursor is
	 * closest to using normalised relative coordinates. Normalising by half the
	 * element's dimensions means a square cell and a wide rectangle both give
	 * sensible results without bias toward one axis.
	 *
	 * Returns the CSS indicator class and the logical drop position ('before' |
	 * 'after') so callers don't have to re-derive either.
	 */
	function getNearestEdge(
		clientY: number,
		clientX: number
	): {
		edgeClass: 'drop-before' | 'drop-after' | 'drop-left' | 'drop-right';
		position: 'before' | 'after';
	} {
		const { left, top, width, height } = node.getBoundingClientRect();

		// Normalise to [-1, 1] relative to element centre, accounting for aspect ratio
		const nx = (clientX - (left + width / 2)) / (width / 2);
		const ny = (clientY - (top + height / 2)) / (height / 2);

		if (Math.abs(nx) >= Math.abs(ny)) {
			// Cursor is closer to left or right edge
			return nx < 0
				? { edgeClass: 'drop-left', position: 'before' }
				: { edgeClass: 'drop-right', position: 'after' };
		} else {
			// Cursor is closer to top or bottom edge
			return ny < 0
				? { edgeClass: 'drop-before', position: 'before' }
				: { edgeClass: 'drop-after', position: 'after' };
		}
	}

	/**
	 * Single call-site for updating the drop indicator during any drag move.
	 *
	 * Routes to nearest-edge logic for grids, or the midpoint comparison for
	 * vertical/horizontal lists.
	 */
	function updateDropIndicator(clientY: number, clientX: number) {
		if (options.direction === 'grid') {
			const { edgeClass, position } = getNearestEdge(clientY, clientX);
			setDropIndicator(position, edgeClass);
		} else {
			setDropIndicator(getDropPosition(clientY, clientX));
		}
	}

	/**
	 * Applies the visual drop indicator.
	 *
	 * For vertical/horizontal lists the sibling-transfer strategy is used:
	 * when dropping "after" item A, we draw the indicator on item B's leading
	 * edge so the line sits in the visual gap between them.
	 *
	 * For grid layouts the caller passes an explicit edgeClass derived from
	 * nearest-edge detection. We always apply it to the current node — the
	 * sibling strategy doesn't make sense in 2D because the next DOM sibling
	 * is the next cell in row order, which may not be visually adjacent.
	 *
	 * @param position - Logical drop position (updates dndState)
	 * @param edgeClass - Override CSS class; when provided skips sibling logic
	 */
	function setDropIndicator(
		position: 'before' | 'after',
		edgeClass?: 'drop-before' | 'drop-after' | 'drop-left' | 'drop-right'
	) {
		clearDropIndicator();
		dndState.dropPosition = position;

		if (edgeClass) {
			// Grid path: pin the indicator to this node on the detected edge
			indicatorNode = node;
			indicatorClass = edgeClass;
		} else {
			// Vertical/horizontal path: sibling-transfer strategy
			const isHorizontal = options.direction === 'horizontal';
			const beforeClass = isHorizontal ? 'drop-left' : 'drop-before';
			const afterClass = isHorizontal ? 'drop-right' : 'drop-after';

			if (position === 'after') {
				const next = node.nextElementSibling as HTMLElement | null;
				if (next) {
					indicatorNode = next;
					indicatorClass = beforeClass;
				} else {
					indicatorNode = node;
					indicatorClass = afterClass;
				}
			} else {
				indicatorNode = node;
				indicatorClass = beforeClass;
			}
		}

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
	 * Handles document-level pointermove for touch-compatible hover detection.
	 *
	 * pointerover/pointerout do not fire on elements beneath the finger during
	 * a touch drag — the pointer stays captured to the element where touch began.
	 * This handler uses getBoundingClientRect to detect hover by coordinates,
	 * which works on both mouse and touch devices.
	 *
	 * Fires onDragOver on every tick while inside, and onDragEnter/onDragLeave
	 * only on the transition between inside/outside.
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
			options.callbacks?.onDragOver?.(dndState as DragDropState<T>);
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

		// Update the position indicator based on cursor position
		updateDropIndicator(event.clientY, event.clientX);
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
	 * Handles the global dragenter event.
	 *
	 * The dragEnterCounter can get out of sync — especially when the same element
	 * has both use:draggable and use:droppable — causing drag-over classes to stick.
	 *
	 * Whenever the cursor enters any element in the document, we check if it's
	 * still inside this droppable. If not, we force cleanup immediately rather
	 * than waiting for a dragleave that may never arrive.
	 */
	function handleDocumentDragEnter(event: DragEvent) {
		if (dragEnterCounter === 0) return;
		if (node.contains(event.target as Node)) return;
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		if (dndState.targetContainer === options.container) {
			dndState.targetContainer = null;
			dndState.targetElement = null;
		}
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles the global dragend event.
	 *
	 * When a drag is cancelled (Escape key, dropped outside any droppable, etc.),
	 * the browser may not fire dragleave on every element that received dragenter.
	 * This leaves drag-over classes stuck on elements indefinitely.
	 *
	 * We listen at the document level so any drag ending — regardless of where it
	 * started — triggers cleanup on this drop zone.
	 */
	function handleGlobalDragEnd() {
		wasOver = false;
		if (dragEnterCounter === 0) return;
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
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
		wasOver = false;
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

	/**
	 * Handles keyboard events on the droppable element during keyboard drag mode.
	 *
	 * - Space / Enter: execute the drop
	 * - Escape: cancel the drag
	 * - Arrow keys: navigate to the next/prev droppable
	 *
	 * Only active when a keyboard drag is in progress (dndState.isKeyboardDragging).
	 */
	async function handleKeyDown(event: KeyboardEvent) {
		if (!dndState.isKeyboardDragging || options.disabled) return;

		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			dndState.targetContainer = options.container;
			node.classList.add(...dragOverClass);

			try {
				await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
				announce('Item dropped.');
			} catch (error) {
				console.error('Keyboard drop failed:', error);
			} finally {
				node.classList.remove(...dragOverClass);
				clearDropIndicator();
				dndState.isDragging = false;
				dndState.isKeyboardDragging = false;
				dndState.draggedItem = null;
				dndState.sourceContainer = '';
				dndState.targetContainer = null;
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			// Dispatch a cancel event — the draggable's own Escape handler will fire
			// since focus was on this droppable, so we dispatch to document
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			event.preventDefault();
			focusNextDroppable(node);
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			event.preventDefault();
			focusPrevDroppable(node);
		}
	}

	/**
	 * Handles focus entering this droppable during keyboard drag.
	 * Updates targetContainer so onDrop knows where to put the item.
	 */
	function handleFocus() {
		if (!dndState.isKeyboardDragging || options.disabled) return;
		dndState.targetContainer = options.container;
		dndState.targetElement = node;
		node.classList.add(...dragOverClass);
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	/**
	 * Handles focus leaving this droppable during keyboard drag.
	 */
	function handleBlur() {
		if (!dndState.isKeyboardDragging || options.disabled) return;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		if (dndState.targetContainer === options.container) {
			dndState.targetContainer = null;
			dndState.targetElement = null;
		}
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	/**
	 * Expose this droppable as a Tab stop while a keyboard drag is in progress.
	 * Without this, container-only droppables (not also draggable) are unreachable via Tab.
	 * We store the original value so we can restore it when the drag ends.
	 */
	const originalTabIndex = node.getAttribute('tabindex');
	if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');

	// === Setup: Attach all event listeners ===

	// Register in the keyboard droppable registry
	registerDroppable(node);

	// HTML5 drag API events
	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragstart-on-container', handleDragStartOnContainer as EventListener);

	// Global dragenter: cleans up if the cursor moves to an element outside this droppable,
	// fixing counter desync that causes drag-over class to stick (issue #22)
	document.addEventListener('dragenter', handleDocumentDragEnter);

	// Global dragend: cleans up drag-over state when the drag ends without a drop
	// on this element (cancelled drag, dropped outside, etc.)
	document.addEventListener('dragend', handleGlobalDragEnd);

	// Pointer events for custom drag support
	document.addEventListener('pointermove', handleDocumentPointerMove);
	node.addEventListener('pointerdrop-on-container', handlePointerDropOnContainer as EventListener);

	// Keyboard accessibility events
	node.addEventListener('keydown', handleKeyDown);
	node.addEventListener('focus', handleFocus);
	node.addEventListener('blur', handleBlur);

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
			unregisterDroppable(node);
			clearDropIndicator();
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener(
				'dragstart-on-container',
				handleDragStartOnContainer as EventListener
			);
			document.removeEventListener('dragenter', handleDocumentDragEnter);
			document.removeEventListener('dragend', handleGlobalDragEnd);
			document.removeEventListener('pointermove', handleDocumentPointerMove);
			node.removeEventListener(
				'pointerdrop-on-container',
				handlePointerDropOnContainer as EventListener
			);
			node.removeEventListener('keydown', handleKeyDown);
			node.removeEventListener('focus', handleFocus);
			node.removeEventListener('blur', handleBlur);
			// Restore original tabindex
			if (originalTabIndex === null) node.removeAttribute('tabindex');
			else node.setAttribute('tabindex', originalTabIndex);
		}
	};
}
