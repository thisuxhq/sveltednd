import { dndState } from '$lib/stores/dnd.svelte.js';
import type { DragDropOptions, DragDropState } from '$lib/types/index.js';

const DEFAULT_DRAG_OVER_CLASS = 'drag-over';

export function droppable<T>(node: HTMLElement, options: DragDropOptions<T>) {
	const dragOverClass = (options.attributes?.dragOverClass || DEFAULT_DRAG_OVER_CLASS).split(' ');
	let dragEnterCounter = 0;

	// Track which node actually carries the indicator class (may be a sibling)
	let indicatorNode: HTMLElement | null = null;
	let indicatorClass: 'drop-before' | 'drop-after' = 'drop-before';

	function getDropPosition(clientY: number): 'before' | 'after' {
		const { top, height } = node.getBoundingClientRect();
		return clientY < top + height / 2 ? 'before' : 'after';
	}

	function setDropIndicator(position: 'before' | 'after') {
		clearDropIndicator();

		dndState.dropPosition = position;

		if (position === 'after') {
			// Put the line at the TOP of the next sibling so "after A" and "before B"
			// always render at the same visual position in the gap.
			const next = node.nextElementSibling as HTMLElement | null;
			if (next) {
				indicatorNode = next;
				indicatorClass = 'drop-before';
			} else {
				// Last item — no sibling, show line below this item.
				indicatorNode = node;
				indicatorClass = 'drop-after';
			}
		} else {
			indicatorNode = node;
			indicatorClass = 'drop-before';
		}

		indicatorNode.classList.add(indicatorClass);
	}

	function clearDropIndicator() {
		if (indicatorNode) {
			indicatorNode.classList.remove(indicatorClass);
			indicatorNode = null;
		}
		dndState.dropPosition = null;
	}

	function handleDragEnter(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dragEnterCounter++;
		dndState.targetContainer = options.container;
		dndState.targetElement = event.target as HTMLElement;

		node.classList.add(...dragOverClass);
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	function handleDragLeave(event: DragEvent) {
		if (options.disabled) return;

		dragEnterCounter--;
		if (dragEnterCounter < 0) dragEnterCounter = 0;
		if (dragEnterCounter > 0) return;

		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);

		if (dndState.targetContainer === options.container && dndState.targetElement === event.target) {
			dndState.targetContainer = null;
			dndState.targetElement = null;
		}
	}

	function handleDragOver(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

		setDropIndicator(getDropPosition(event.clientY));
		options.callbacks?.onDragOver?.(dndState as DragDropState<T>);
	}

	async function handleDrop(event: DragEvent) {
		if (options.disabled) return;
		event.preventDefault();

		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);

		try {
			if (event.dataTransfer) {
				dndState.draggedItem = JSON.parse(event.dataTransfer.getData('text/plain')) as T;
			}
			await options.callbacks?.onDrop?.(dndState as DragDropState<T>);
		} catch (error) {
			console.error('Drop handling failed:', error);
		} finally {
			clearDropIndicator();
		}
	}

	function handleDragStartOnContainer() {
		if (options.disabled) return;
		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
	}

	function handlePointerOver(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		dndState.targetContainer = options.container;
		node.classList.add(...dragOverClass);
		setDropIndicator(getDropPosition(event.clientY));
		options.callbacks?.onDragEnter?.(dndState as DragDropState<T>);
	}

	function handlePointerMove(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;
		if (dndState.targetContainer !== options.container) return;

		setDropIndicator(getDropPosition(event.clientY));
	}

	function handlePointerOut(event: PointerEvent) {
		if (options.disabled || !dndState.isDragging) return;

		if (dndState.targetContainer === options.container) {
			dndState.targetContainer = null;
		}
		node.classList.remove(...dragOverClass);
		clearDropIndicator();
		options.callbacks?.onDragLeave?.(dndState as DragDropState<T>);
	}

	async function handlePointerDropOnContainer(event: Event) {
		if (options.disabled || !dndState.isDragging) return;
		if (dndState.targetContainer !== options.container) return;

		dragEnterCounter = 0;
		node.classList.remove(...dragOverClass);

		try {
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

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragstart-on-container', handleDragStartOnContainer as EventListener);

	node.addEventListener('pointerover', handlePointerOver);
	node.addEventListener('pointermove', handlePointerMove);
	node.addEventListener('pointerout', handlePointerOut);
	node.addEventListener('pointerdrop-on-container', handlePointerDropOnContainer as EventListener);

	return {
		update(newOptions: DragDropOptions<T>) {
			options = newOptions;
		},

		destroy() {
			clearDropIndicator();
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener(
				'dragstart-on-container',
				handleDragStartOnContainer as EventListener
			);
			node.removeEventListener('pointerover', handlePointerOver);
			node.removeEventListener('pointermove', handlePointerMove);
			node.removeEventListener('pointerout', handlePointerOut);
			node.removeEventListener(
				'pointerdrop-on-container',
				handlePointerDropOnContainer as EventListener
			);
		}
	};
}
