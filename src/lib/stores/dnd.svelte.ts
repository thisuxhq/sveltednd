import type { DragDropState } from '$lib/types/index.js';

// Global DnD state using Svelte 5's state rune
export const dndState = $state<DragDropState>({
	isDragging: false,
	draggedItem: null,
	sourceContainer: '',
	targetContainer: null,
	dragOverElement: null
});
