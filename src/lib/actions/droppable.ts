import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions } from '$lib/types/index.js';

export function droppable(node: HTMLElement, options: DragDropOptions) {
	function handleDragEnter(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dndState.targetContainer = options.container;
		node.classList.add('drag-over');
		options.callbacks?.onDragEnter?.(dndState);
	}

	function handleDragLeave(event: DragEvent) {
		if (options.disabled) return;

		const target = event.target as HTMLElement;
		if (!node.contains(target)) {
			dndState.targetContainer = null;
			node.classList.remove('drag-over');
			options.callbacks?.onDragLeave?.(dndState);
		}
	}

	function handleDragOver(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		options.callbacks?.onDragOver?.(dndState);
	}

	async function handleDrop(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		node.classList.remove('drag-over');

		try {
			if (event.dataTransfer) {
				const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
				dndState.draggedItem = dragData;
			}

			await options.callbacks?.onDrop?.(dndState);
		} catch (error) {
			console.error('Drop handling failed:', error);
		}
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		update(newOptions: DragDropOptions) {
			options = newOptions;
		},

		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}
