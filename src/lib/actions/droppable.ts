import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

export function droppable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	const dragOverClasses = (options.attributes?.dragOverClasses ?? 'drag-over').split(' ');

	let touchTimeout: number | null = null;

	function handleDragEnter(event: DragEvent | TouchEvent) {
		if (options.disabled) return;
		event.preventDefault();

		const target = event.target as HTMLElement;

		dndState.targetContainer = options.container;
		dndState.dragOverElement = target;

		if (node.isSameNode(target)) {
			node.classList.add(...dragOverClasses);
			options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
		}
	}

	function handleDragLeave(event: DragEvent | TouchEvent) {
		if (options.disabled) return;

		const target = event.target as HTMLElement;

		// check if element is still being dragged over
		if (!dndState.dragOverElement?.isSameNode(target)) return;

		node.classList.remove(...dragOverClasses);

		dndState.targetContainer = null;
		dndState.dragOverElement = null;
	}

	function handleDragOver(event: DragEvent | TouchEvent) {
		if (options.disabled) return;
		event.preventDefault();

		if (event instanceof DragEvent && event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		options.callbacks?.onDragOver?.(dndState as DragDropState<T>);
	}

	async function handleDrop(event: DragEvent | TouchEvent) {
		if (options.disabled) return;
		event.preventDefault();

		node.classList.remove(...dragOverClasses);

		try {
			if (event instanceof DragEvent && event.dataTransfer) {
				const dragData = JSON.parse(event.dataTransfer.getData('text/plain')) as T;
				dndState.draggedItem = dragData;
			}

			await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
		} catch (error) {
			console.error('Drop handling failed:', error);
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (touchTimeout) {
			clearTimeout(touchTimeout);
		}

		touchTimeout = window.setTimeout(() => {
			handleDragOver(event);
		}, 100);
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('touchmove', handleTouchMove);

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
		},

		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener('touchmove', handleTouchMove);
		}
	};
}
