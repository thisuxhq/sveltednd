import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

export function draggable<T>(node: HTMLElement, options: DragDropOptions<T>) {
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

		node.classList.add('dragging');
		options.callbacks?.onDragStart?.(dndState as DragDropState<T>);
	}

	function handleDragEnd() {
		node.classList.remove('dragging');
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

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
			node.draggable = !options.disabled;
		},

		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
		}
	};
}
