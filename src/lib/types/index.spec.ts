import { describe, it, expect } from 'vitest';
import type {
	DraggableOptions,
	DragDropState,
	DragDropCallbacks,
	DragDropAttributes
} from './index.js';

describe('Type exports', () => {
	describe('Issue #12 - DraggableOptions interface', () => {
		it('should export DraggableOptions type', () => {
			// This test verifies at compile time that the types are exported
			// If the types are not exported, TypeScript will fail here
			const _testDraggableOptions: DraggableOptions<string> = {
				container: 'test',
				dragData: 'item',
				interactive: ['button', 'input[type="checkbox"]']
			};

			// If we get here without compilation errors, the types are exported
			expect(_testDraggableOptions.interactive).toEqual(['button', 'input[type="checkbox"]']);
		});

		it('should allow all DraggableOptions properties', () => {
			const callbacks: DragDropCallbacks<string> = {
				onDragStart: (state: DragDropState<string>) => console.log(state.draggedItem),
				onDragEnd: (state: DragDropState<string>) => console.log(state.isDragging),
				onDragEnter: (state: DragDropState<string>) => console.log(state.targetContainer),
				onDragLeave: (state: DragDropState<string>) => console.log(state.targetContainer),
				onDragOver: (state: DragDropState<string>) => console.log(state.targetContainer),
				onDrop: async (state: DragDropState<string>) => console.log(state.draggedItem)
			};

			const attributes: DragDropAttributes = {
				draggingClass: 'custom-dragging',
				dragOverClass: 'custom-drag-over'
			};

			const options: DraggableOptions<string> = {
				container: 'my-container',
				dragData: 'test-data',
				disabled: false,
				callbacks,
				attributes,
				interactive: ['button', 'input', '.custom-handle']
			};

			expect(options.container).toBe('my-container');
			expect(options.dragData).toBe('test-data');
			expect(options.disabled).toBe(false);
			expect(options.interactive).toEqual(['button', 'input', '.custom-handle']);
			expect(options.callbacks).toBe(callbacks);
			expect(options.attributes).toBe(attributes);
		});

		it('should have optional interactive property', () => {
			// Should work without interactive
			const optionsWithoutInteractive: DraggableOptions<number> = {
				container: 'test',
				dragData: 42
			};

			expect(optionsWithoutInteractive.interactive).toBeUndefined();
		});

		it('should work with complex generic types', () => {
			interface Item {
				id: string;
				name: string;
				priority: 'low' | 'medium' | 'high';
			}

			const item: Item = {
				id: '1',
				name: 'Test',
				priority: 'high'
			};

			const options: DraggableOptions<Item> = {
				container: 'items',
				dragData: item,
				interactive: ['button', 'input']
			};

			expect(options.dragData?.id).toBe('1');
			expect(options.dragData?.priority).toBe('high');
		});
	});

	describe('DragDropState type', () => {
		it('should have all required properties', () => {
			const state: DragDropState<string> = {
				isDragging: true,
				draggedItem: 'test',
				sourceContainer: 'source',
				targetContainer: 'target',
				targetElement: null,
				invalidDrop: false
			};

			expect(state.isDragging).toBe(true);
			expect(state.draggedItem).toBe('test');
			expect(state.sourceContainer).toBe('source');
			expect(state.targetContainer).toBe('target');
			expect(state.invalidDrop).toBe(false);
		});

		it('should allow targetContainer to be null', () => {
			const state: DragDropState<string> = {
				isDragging: false,
				draggedItem: 'test',
				sourceContainer: 'source',
				targetContainer: null,
				targetElement: null
			};

			expect(state.targetContainer).toBeNull();
		});

		it('should have optional invalidDrop property', () => {
			const state: DragDropState<string> = {
				isDragging: false,
				draggedItem: 'test',
				sourceContainer: 'source',
				targetContainer: null,
				targetElement: null,
				invalidDrop: true
			};

			expect(state.invalidDrop).toBe(true);
		});
	});
});
