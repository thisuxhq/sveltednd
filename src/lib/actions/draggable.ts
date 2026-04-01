import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DraggableOptions, DragDropState } from '$lib/types/index.js';

const DEFAULT_DRAGGING_CLASS = 'dragging';
const DEFAULT_INTERACTIVE_SELECTORS = [
	'input',
	'textarea',
	'select',
	'button',
	'[contenteditable]',
	'a[href]',
	'label',
	'option'
];

export function draggable<T>(node: HTMLElement, options: DraggableOptions<T>) {
	const draggingClass = (options.attributes?.draggingClass || DEFAULT_DRAGGING_CLASS).split(' ');

	function isInteractiveElement(target: HTMLElement): boolean {
		const interactiveSelectors = [...DEFAULT_INTERACTIVE_SELECTORS, ...(options.interactive || [])];
		return interactiveSelectors.some(
			(selector) => target.matches(selector) || target.closest(selector)
		);
	}

	function isHandleElement(target: HTMLElement): boolean {
		if (!options.handle) return true;
		return target.matches(options.handle) || !!target.closest(options.handle);
	}

	function handleDragStart(event: DragEvent) {
		if (options.disabled) return;

		const target = event.target as HTMLElement;

		if (!isHandleElement(target)) {
			event.preventDefault();
			return;
		}

		if (!options.handle && isInteractiveElement(target)) {
			event.preventDefault();
			return;
		}

		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify(options.dragData));
		}

		node.classList.add(...draggingClass);
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);

		const customEvent = new CustomEvent('dragstart-on-container', { bubbles: true });
		node.dispatchEvent(customEvent);
	}

	function handleDragEnd() {
		node.classList.remove(...draggingClass);
		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	function handlePointerDown(event: PointerEvent) {
		if (options.disabled) return;

		if (!isHandleElement(event.target as HTMLElement)) return;

		if (!options.handle && isInteractiveElement(event.target as HTMLElement)) return;

		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		node.classList.add(...draggingClass);
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);

		// Use document-level listeners so pointerover/pointerout fire normally on droppables.
		// setPointerCapture would redirect all pointer events to this node, breaking hover detection.
		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerUp);
	}

	function handlePointerMove(_event: PointerEvent) {
		if (!dndState.isDragging) return;
	}

	function handlePointerUp(event: PointerEvent) {
		if (!dndState.isDragging) return;

		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerup', handlePointerUp);

		node.classList.remove(...draggingClass);

		// Dispatch on the element actually under the cursor so bubbling reaches the correct droppable.
		const dropTarget = document.elementFromPoint(event.clientX, event.clientY) ?? node;
		dropTarget.dispatchEvent(
			new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData: options.dragData }
			})
		);

		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	node.draggable = !options.disabled;
	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);
	node.addEventListener('pointerdown', handlePointerDown);

	return {
		update(newOptions: DraggableOptions<T>) {
			options = newOptions;
			node.draggable = !options.disabled;
		},

		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
			node.removeEventListener('pointerdown', handlePointerDown);
			// Clean up document listeners in case destroyed mid-drag
			document.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('pointerup', handlePointerUp);
		}
	};
}
