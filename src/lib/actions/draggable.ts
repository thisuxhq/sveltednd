/**
 * Draggable action - Makes any element draggable.
 *
 * This action implements a dual-mode drag system:
 * 1. **HTML5 Drag API**: Native browser drag-and-drop (desktop, high fidelity)
 * 2. **Pointer Events**: Custom implementation for broader device support
 *
 * The action automatically detects which mode to use based on the event type,
 * providing a seamless experience across desktop and touch devices.
 *
 * @example
 * ```svelte
 * <div
 *   use:draggable={{
 *     dragData: task,
 *     container: 'todo-list',
 *     handle: '.drag-handle',
 *     callbacks: {
 *       onDragStart: (state) => console.log('Started dragging:', state.draggedItem)
 *     }
 *   }}
 * >
 *   <span class="drag-handle">⋮⋮</span>
 *   <span>{task.title}</span>
 * </div>
 * ```
 *
 * @module draggable
 */

import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DraggableOptions, DragDropState } from '$lib/types/index.js';
import { startAutoScroll, stopAutoScroll } from '$lib/utils/auto-scroll.js';

/**
 * Default CSS class applied while dragging.
 * Override via options.attributes.draggingClass
 */
const DEFAULT_DRAGGING_CLASS = 'dragging';

/**
 * CSS selectors for elements that should remain interactive inside draggable items.
 *
 * When a user clicks these elements, we don't start a drag - the element
 * retains its normal behavior (typing in inputs, clicking buttons, etc.).
 *
 * This is the "don't be annoying" list - users expect these to work normally.
 */
const DEFAULT_INTERACTIVE_SELECTORS = [
	'input', // Form text inputs
	'textarea', // Multi-line text inputs
	'select', // Dropdown menus
	'button', // Clickable buttons
	'[contenteditable]', // Rich text editing areas
	'a[href]', // Actual links (not anchor targets)
	'label', // Form labels (triggers associated input)
	'option' // Select dropdown options
];

/**
 * Svelte action that makes an element draggable.
 *
 * @typeParam T - The type of data being dragged
 * @param node - The DOM element to make draggable
 * @param options - Configuration for the drag behavior
 * @returns Svelte action lifecycle object with update and destroy
 */
export function draggable<T>(node: HTMLElement, options: DraggableOptions<T>) {
	/**
	 * CSS classes to apply while dragging.
	 * Supports multiple classes separated by spaces.
	 */
	const draggingClass = (options.attributes?.draggingClass || DEFAULT_DRAGGING_CLASS).split(' ');

	/**
	 * Tracks the actual element pressed during pointerdown.
	 *
	 * dragstart's event.target is always the draggable container (node), not
	 * the element the user actually clicked. We capture it here so handleDragStart
	 * can correctly detect interactive children (inputs, checkboxes, etc.).
	 */
	let pointerDownTarget: HTMLElement | null = null;

	/**
	 * Tracks whether the HTML5 drag API is currently active.
	 *
	 * On desktop, the browser fires `pointercancel` when it takes over the pointer
	 * for an HTML5 drag operation. Without this flag, our `pointercancel` handler
	 * would reset drag state mid-drag, clearing sourceContainer before the drop fires.
	 *
	 * Set to true on dragstart, false on dragend.
	 */
	let html5DragActive = false;

	/**
	 * Checks if the clicked element (or its parent) is an interactive element.
	 *
	 * We walk up the DOM tree because the user might click on a span inside a button,
	 * and we want to detect that as "clicked a button".
	 *
	 * @param target - The element that received the click/pointer event
	 * @returns true if this element should not trigger drag
	 */
	function isInteractiveElement(target: HTMLElement): boolean {
		const interactiveSelectors = [...DEFAULT_INTERACTIVE_SELECTORS, ...(options.interactive || [])];
		return interactiveSelectors.some(
			(selector) => target.matches(selector) || target.closest(selector)
		);
	}

	/**
	 * Checks if the clicked element is a valid drag handle.
	 *
	 * If options.handle is set, only clicks on that specific element (or its children)
	 * start a drag. This enables "drag handle" patterns like grip icons on list items.
	 *
	 * @param target - The element that received the click/pointer event
	 * @returns true if this element can initiate a drag
	 */
	function isHandleElement(target: HTMLElement): boolean {
		if (!options.handle) return true; // No handle = entire element is draggable
		return target.matches(options.handle) || !!target.closest(options.handle);
	}

	/**
	 * Handles HTML5 dragstart event.
	 *
	 * This is the native browser drag API path. We set up the data transfer
	 * with the dragged item's data (for cross-window drops) and update
	 * the global DnD state.
	 */
	function handleDragStart(event: DragEvent) {
		if (options.disabled) return;

		// Use the element that was actually pressed (captured in pointerdown), not
		// event.target — dragstart always reports the draggable container as target,
		// not the child element the user clicked, so interactive-child detection
		// (inputs, checkboxes, radios, etc.) would silently fail without this.
		const target = (pointerDownTarget ?? event.target) as HTMLElement;

		// If we're using a handle and didn't click it, bail out
		if (!isHandleElement(target)) {
			event.preventDefault();
			return;
		}

		// If we clicked an interactive element (and we're not using a handle), bail out
		// This prevents dragging when the user just wants to type in an input
		if (!options.handle && isInteractiveElement(target)) {
			event.preventDefault();
			return;
		}

		// Mark HTML5 drag as active so pointercancel is ignored during this drag
		html5DragActive = true;

		// Update global state - this triggers reactive updates across all components
		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		// Configure the native drag data transfer
		// We stringify the data so it works across different browser contexts
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify(options.dragData));
		}

		// Visual feedback: add dragging class
		node.classList.add(...draggingClass);

		startAutoScroll();

		// Notify consumer via callback
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);

		// Notify any parent containers (used by droppables to reset state)
		const customEvent = new CustomEvent('dragstart-on-container', { bubbles: true });
		node.dispatchEvent(customEvent);
	}

	/**
	 * Handles HTML5 dragend event.
	 *
	 * Cleans up after the drag finishes - removes visual styles and resets state.
	 * This fires whether the drop succeeded or was cancelled.
	 */
	function handleDragEnd() {
		html5DragActive = false;

		stopAutoScroll();

		node.classList.remove(...draggingClass);
		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		// Reset global state
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	/**
	 * Handles pointerdown - entry point for the custom pointer event system.
	 *
	 * This provides an alternative drag path that works better on some devices
	 * and gives us more control over the interaction.
	 *
	 * IMPORTANT: We use document-level listeners for pointermove/pointerup instead of
	 * setPointerCapture. Here's why:
	 *
	 * - setPointerCapture redirects ALL pointer events to this node
	 * - That would prevent droppables from detecting hover (pointerover never fires on them)
	 * - Document listeners let us track the pointer while still allowing normal event bubbling
	 */
	function handlePointerDown(event: PointerEvent) {
		// Always capture the pressed element so handleDragStart can use it.
		pointerDownTarget = event.target as HTMLElement;

		if (options.disabled) return;

		if (!isHandleElement(event.target as HTMLElement)) return;

		if (!options.handle && isInteractiveElement(event.target as HTMLElement)) return;

		// Initialize the drag state (same as HTML5 path)
		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		// Visual feedback
		node.classList.add(...draggingClass);

		startAutoScroll();

		// Notify consumer
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);

		// Set up document-level tracking for the drag operation
		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerUp);
		document.addEventListener('pointercancel', handlePointerCancel);
	}

	/**
	 * Handles pointermove during a drag.
	 *
	 * Currently minimal - the heavy lifting (drop indicator positioning)
	 * happens in the droppable's pointermove handler. We just validate
	 * that we're still in a drag state.
	 */
	function handlePointerMove(_event: PointerEvent) {
		if (!dndState.isDragging) return;
	}

	/**
	 * Handles pointercancel - fires when the browser takes over the pointer gesture.
	 *
	 * On desktop, the browser fires pointercancel when the HTML5 drag API takes over.
	 * We must ignore it in that case — html5DragActive tracks whether we're in an HTML5
	 * drag so we can bail out without resetting state mid-drag.
	 *
	 * On mobile/touch, pointercancel fires when the browser decides to scroll or apply
	 * palm rejection. In that case we DO want to reset state (same as pointerup).
	 */
	function handlePointerCancel(event: PointerEvent) {
		if (html5DragActive) return;
		handlePointerUp(event);
	}

	/**
	 * Handles pointerup - the "drop" moment in pointer mode.
	 *
	 * We figure out what element is under the cursor using elementFromPoint,
	 * then dispatch a custom event that droppables listen for.
	 */
	function handlePointerUp(event: PointerEvent) {
		if (!dndState.isDragging) return;

		// Clean up our document listeners
		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerup', handlePointerUp);
		document.removeEventListener('pointercancel', handlePointerCancel);

		// Remove visual dragging styles
		node.classList.remove(...draggingClass);

		stopAutoScroll();

		/**
		 * Find what's actually under the cursor.
		 *
		 * We use elementFromPoint because the pointerup target might be
		 * the element we started dragging, not where we dropped.
		 *
		 * If for some reason we can't find an element (shouldn't happen),
		 * fall back to the original node.
		 */
		const dropTarget = document.elementFromPoint(event.clientX, event.clientY) ?? node;

		// Dispatch custom drop event - droppables listen for this
		dropTarget.dispatchEvent(
			new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData: options.dragData }
			})
		);

		// Consumer callback and state cleanup
		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	// === Setup: Attach all event listeners ===

	// Enable native HTML5 dragging (unless disabled)
	node.draggable = !options.disabled;

	/**
	 * Critical for touch/mobile support.
	 *
	 * Without touch-action: none the browser intercepts the touch gesture for
	 * scrolling and fires pointercancel instead of pointermove/pointerup, so
	 * the pointer-events drag path never works on any mobile browser.
	 *
	 * user-select: none prevents text selection while dragging.
	 *
	 * Set inline so they apply even when the consumer hasn't imported dnd.css.
	 */
	if (!options.disabled) {
		node.style.touchAction = 'none';
		node.style.userSelect = 'none';
	}

	// HTML5 drag API events
	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);

	// Pointer events for broader device support
	node.addEventListener('pointerdown', handlePointerDown);

	// Return Svelte action lifecycle methods
	return {
		/**
		 * Called when options change - updates the draggable state.
		 *
		 * @param newOptions - Updated configuration
		 */
		update(newOptions: DraggableOptions<T>) {
			options = newOptions;
			node.draggable = !options.disabled;
			node.style.touchAction = options.disabled ? '' : 'none';
			node.style.userSelect = options.disabled ? '' : 'none';
		},

		/**
		 * Cleanup when the component is destroyed or the action is removed.
		 *
		 * Removes all event listeners and cleans up any dangling document-level
		 * listeners (in case the component unmounts mid-drag).
		 */
		destroy() {
			node.style.touchAction = '';
			node.style.userSelect = '';
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
			node.removeEventListener('pointerdown', handlePointerDown);

			// Safety cleanup: if component unmounts mid-drag, these might still be attached
			document.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('pointerup', handlePointerUp);
			document.removeEventListener('pointercancel', handlePointerCancel);
		}
	};
}
