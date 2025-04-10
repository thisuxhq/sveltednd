import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

const DEFAULT_DRAG_OVER_CLASS = 'drag-over';

export function droppable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	const dragOverClass = (options.attributes?.dragOverClass || DEFAULT_DRAG_OVER_CLASS).split(' ');
	let dragEnterCounter = 0; // Initialize the counter

	function handleDragEnter(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dragEnterCounter++;

		dndState.targetContainer = options.container;
		dndState.targetElement = event.target as HTMLElement;

		if (dragEnterCounter === 0) return;

		node.classList.add(...dragOverClass);
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	function handleDragLeave(event: DragEvent) {
		if (options.disabled) return;

		dragEnterCounter--;

		// check if element is still being dragged over
		if (dragEnterCounter > 0) return;

		node.classList.remove(...dragOverClass);

		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);

		if (dndState.targetContainer === options.container && dndState.targetElement === event.target) {
			dndState.targetContainer = null;
			dndState.targetElement = null;
			dragEnterCounter = 0; // Ensure dragEnterCounter is reset to 0
		}
	}

	function handleDragOver(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		options.callbacks?.onDragOver?.(dndState as DragDropState<T>);
	}

	async function handleDrop(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dragEnterCounter = 0; // Reset the counter
		node.classList.remove(...dragOverClass);

		try {
			if (event.dataTransfer) {
				const dragData = JSON.parse(event.dataTransfer.getData('text/plain')) as T;
				dndState.draggedItem = dragData;
			}

			await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
		} catch (error) {
			console.error('Drop handling failed:', error);
		}
	}

	function handleDragStartOnContainer(event: Event) {
		if (options.disabled) return;

		// Reset the counter and remove the class
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);
	}

	function handlePointerOver(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		dndState.targetContainer = options.container;
		node.classList.add(...dragOverClass);
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	function handlePointerOut(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		if (dndState.targetContainer === options.container) {
			dndState.targetContainer = null;
		}
		node.classList.remove(...dragOverClass);
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	function handlePointerUp(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		node.classList.remove(...dragOverClass);
		options.callbacks?.onDrop?.(dndState as DragDropState<T>);
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragstart-on-container', handleDragStartOnContainer);

	node.addEventListener('pointerover', handlePointerOver);
	node.addEventListener('pointerout', handlePointerOut);
	node.addEventListener('pointerup', handlePointerUp);

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
		},

		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener('dragstart-on-container', handleDragStartOnContainer);

			node.removeEventListener('pointerover', handlePointerOver);
			node.removeEventListener('pointerout', handlePointerOut);
			node.removeEventListener('pointerup', handlePointerUp);
		}
	};
}
