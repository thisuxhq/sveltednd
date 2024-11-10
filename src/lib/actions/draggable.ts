import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions } from '$lib/types/index.js';

export function draggable(node: HTMLElement, options: DragDropOptions) {
	function handleDragStart(event: DragEvent | TouchEvent) {
		if (options.disabled) return;

		// Update state using assignment (Svelte 5 style)
		dndState.isDragging = true;
		dndState.draggedItem = options.dragData;
		dndState.sourceContainer = options.container;
		dndState.targetContainer = null;

		if (event instanceof DragEvent && event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify(options.dragData));
		}

		node.classList.add('dragging');
		options.callbacks?.onDragStart?.(dndState);
	}

	function handleDragEnd(event: DragEvent | TouchEvent) {
		node.classList.remove('dragging');
		options.callbacks?.onDragEnd?.(dndState);

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
		update(newOptions: DragDropOptions) {
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
