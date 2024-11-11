import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

export function draggable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	const draggingClasses = (options.attributes?.draggingClasses ?? 'dragging').split(' ');

	function handleDragStart(event: DragEvent | TouchEvent) {
		if (options.disabled) return;

		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		if (event instanceof DragEvent && event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify(options.dragData));
		}

		node.classList.add(...draggingClasses);

		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);
	}

	function handleDragEnd(event: DragEvent | TouchEvent) {
		node.classList.remove(...draggingClasses);

		options.callbacks?.onDragEnd?.(dndState as DragDropState<T>);

		// Reset state
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
	}

	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		handleDragStart(event);
	}

	function handleTouchEnd(event: TouchEvent) {
		event.preventDefault();
		handleDragEnd(event);
	}

	node.draggable = !options.disabled;
	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragend', handleDragEnd);
	node.addEventListener('touchstart', handleTouchStart);
	node.addEventListener('touchend', handleTouchEnd);

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
			node.draggable = !options.disabled;
		},

		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
			node.removeEventListener('touchstart', handleTouchStart);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	};
}
