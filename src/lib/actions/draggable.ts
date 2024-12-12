import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

const DEFAULT_DRAGGING_CLASS = 'dragging';

export function draggable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	const draggingClass = (options.attributes?.draggingClass || DEFAULT_DRAGGING_CLASS).split(' ');

	function handleDragStart(event: DragEvent) {
		if (options.disabled) return;

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

		// **Dispatch the custom event that bubbles up to the container**
		const customEvent = new CustomEvent('dragstart-on-container', { bubbles: true });
		node.dispatchEvent(customEvent);
	}

	function handleDragEnd() {
		node.classList.remove(...draggingClass);
		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		// Reset state
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	function handlePointerDown(event: PointerEvent) {
		if (options.disabled) return;

		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		node.setPointerCapture(event.pointerId);
		node.classList.add(...draggingClass);
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dndState.isDragging) return;

		// Optional: Update visual feedback or position
	}

	function handlePointerUp(event: PointerEvent) {
		if (!dndState.isDragging) return;

		node.releasePointerCapture(event.pointerId);
		node.classList.remove(...draggingClass);
		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		// Reset state
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	node.draggable = !options.disabled;
	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);
	node.addEventListener('pointerdown', handlePointerDown);
	node.addEventListener('pointermove', handlePointerMove);
	node.addEventListener('pointerup', handlePointerUp);

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
			node.draggable = !options.disabled;
		},

		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointermove', handlePointerMove);
			node.removeEventListener('pointerup', handlePointerUp);
		}
	};
}
